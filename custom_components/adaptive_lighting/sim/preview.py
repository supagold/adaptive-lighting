"""Real-light preview sessions (homeops fork).

A session takes over a profile's lights so the panel can show a simulated moment on the
real bulbs, then hands them back exactly as they were.

Takeover:  snapshot each light (on/off + colour state) and its manual-control flags, then
           set the flags to ALL directly in the manager. Adaptation asks the manager which
           attributes it may change, so the interval loop leaves the light alone. Writing
           the flags directly (not `set_manual_control_attributes`) starts no auto-reset
           timer and fires no manual_control event.
Commands:  light.turn_on with an Adaptive Lighting context ("preview"), so the integration's
           own manual-change detection ignores them. At most one command per second per
           session; newer requests replace queued ones.
Mute/solo: `async_set_lights` changes the set mid-session; a light leaving it is
           restored at once, like at the end of a session.
Restore:   (toggle off, browser gone, timeout, entry unload, HA stop) put back each light's
           exact previous flags; lights that were off go back off; lights that were being
           adapted are re-adapted immediately (force); lights that were manual get their
           snapshot back. On unload / HA stop the integration is going away, so every light
           gets its snapshot back instead of being re-adapted.
"""

# Relative parent imports are required. HA loads this package under the
# custom_components namespace, while upstream's tests load it through a symlink
# under homeassistant.components; an absolute import would break one of the two.
# ruff: noqa: TID252

from __future__ import annotations

import logging
import time
from typing import TYPE_CHECKING, Any

from homeassistant.components.light import (
    ATTR_BRIGHTNESS,
    ATTR_COLOR_MODE,
    ATTR_COLOR_TEMP_KELVIN,
    ATTR_HS_COLOR,
    ATTR_RGB_COLOR,
    ATTR_TRANSITION,
    ATTR_XY_COLOR,
    ColorMode,
)
from homeassistant.components.light import DOMAIN as LIGHT_DOMAIN
from homeassistant.const import (
    ATTR_ENTITY_ID,
    SERVICE_TURN_OFF,
    SERVICE_TURN_ON,
    STATE_ON,
)
from homeassistant.helpers.event import async_call_later

from ..adaptation_utils import LightControlAttributes
from ..const import DOMAIN

if TYPE_CHECKING:
    from collections.abc import Callable

    from homeassistant.core import HomeAssistant

    from ..switch import AdaptiveSwitch

_LOGGER = logging.getLogger(__name__)

DATA_SESSIONS = "adaptive_lighting_sim_sessions"
# Endings where Adaptive Lighting is no longer running the lights: put each light back
# to its own snapshot instead of asking the (unloading) switch to adapt it.
_AL_GONE = {"unload", "ha_stop"}
MIN_INTERVAL_S = 1.0
DEFAULT_TIMEOUT_S = 600

_COLOR_ATTR_FOR_MODE = {
    ColorMode.COLOR_TEMP: ATTR_COLOR_TEMP_KELVIN,
    ColorMode.HS: ATTR_HS_COLOR,
    ColorMode.XY: ATTR_XY_COLOR,
    ColorMode.RGB: ATTR_RGB_COLOR,
    ColorMode.RGBW: ATTR_RGB_COLOR,
    ColorMode.RGBWW: ATTR_RGB_COLOR,
}


class PreviewBusyError(Exception):
    """A light is already in another preview session."""


class PreviewSession:
    """One panel's takeover of a profile's lights."""

    def __init__(
        self,
        hass: HomeAssistant,
        switch: AdaptiveSwitch,
        lights: list[str],
        timeout_s: float = DEFAULT_TIMEOUT_S,
        on_end: Callable[[str], None] | None = None,
    ) -> None:
        """Create a session; call `start()` to take over the lights."""
        self.hass = hass
        self.switch = switch
        self.lights = lights
        self.timeout_s = timeout_s
        self.on_end = on_end
        self.active = False
        self.end_reason: str | None = None
        self._snapshot: dict[str, dict[str, Any]] = {}
        self._prior_flags: dict[str, LightControlAttributes] = {}
        self._cancel_timeout: Callable[[], None] | None = None
        self._cancel_flush: Callable[[], None] | None = None
        self._pending: dict[str, dict[str, Any]] | None = None
        self._last_sent = 0.0
        self.commands_sent = 0

    # ------------------------------------------------------------------ start
    def start(self) -> None:
        """Snapshot and pause adaptation on the lights."""
        sessions = self.hass.data.setdefault(DATA_SESSIONS, {})
        busy = [light for light in self.lights if light in sessions]
        if busy:
            msg = f"already in a preview: {', '.join(busy)}"
            raise PreviewBusyError(msg)
        for light in self.lights:
            self._take(light, sessions)
        self.active = True
        self._cancel_timeout = async_call_later(
            self.hass,
            self.timeout_s,
            self._on_timeout,
        )
        _LOGGER.debug(
            "Preview started on %s (timeout %ss)",
            self.lights,
            self.timeout_s,
        )

    def _take(self, light: str, sessions: dict[str, PreviewSession]) -> None:
        """Snapshot one light and pause its adaptation."""
        manager = self.switch.manager
        state = self.hass.states.get(light)
        self._snapshot[light] = (
            {"state": state.state, "attributes": dict(state.attributes)}
            if state is not None
            else {"state": None, "attributes": {}}
        )
        self._prior_flags[light] = manager.get_manual_control_attributes(light)
        manager.cancel_ongoing_adaptation_calls(light)
        manager.manual_control[light] = LightControlAttributes.ALL
        sessions[light] = self

    async def async_set_lights(self, lights: list[str]) -> None:
        """Change which lights the session drives (mute/solo in the panel).

        Lights leaving the set are handed back now, exactly as at the end of a
        session; lights joining it are taken over. Raises PreviewBusyError, changing
        nothing, if a joining light is in another session.
        """
        if not self.active:
            return
        sessions = self.hass.data.setdefault(DATA_SESSIONS, {})
        joining = [light for light in lights if light not in self.lights]
        busy = [light for light in joining if light in sessions]
        if busy:
            msg = f"already in a preview: {', '.join(busy)}"
            raise PreviewBusyError(msg)
        leaving = [light for light in self.lights if light not in lights]
        for light in joining:
            self._take(light, sessions)
        self.lights = [light for light in self.lights if light not in leaving] + joining
        if leaving:
            await self._release(leaving, "muted")
        _LOGGER.debug("Preview lights now %s (released %s)", self.lights, leaving)

    async def _on_timeout(self, _now: Any) -> None:
        self._cancel_timeout = None
        await self.async_end("timeout")

    # ---------------------------------------------------------------- commands
    async def async_send(self, per_light: dict[str, dict[str, Any]]) -> bool:
        """Show `per_light` (light -> turn_on data). Returns True if sent now, False if queued."""
        if not self.active:
            return False
        per_light = {
            light: data for light, data in per_light.items() if light in self.lights
        }
        wait = self._last_sent + MIN_INTERVAL_S - time.monotonic()
        if wait > 0:
            self._pending = per_light
            if self._cancel_flush is None:
                self._cancel_flush = async_call_later(self.hass, wait, self._flush)
            return False
        await self._send_now(per_light)
        return True

    async def _flush(self, _now: Any) -> None:
        self._cancel_flush = None
        pending, self._pending = self._pending, None
        if pending and self.active:
            await self._send_now(pending)

    async def _send_now(self, per_light: dict[str, dict[str, Any]]) -> None:
        self._last_sent = time.monotonic()
        for light, data in per_light.items():
            if light in self.lights:  # a queued command may name a light muted since
                await self._call(SERVICE_TURN_ON, {ATTR_ENTITY_ID: light, **data})
        self.commands_sent += 1

    async def _call(self, service: str, data: dict[str, Any]) -> None:
        try:
            await self.hass.services.async_call(
                LIGHT_DOMAIN,
                service,
                data,
                blocking=True,
                context=self.switch.create_context("preview"),
            )
        except Exception:  # a bad light must not block restoring the others
            _LOGGER.exception("Preview: %s %s failed", service, data)

    # ----------------------------------------------------------------- restore
    async def async_end(self, reason: str) -> None:
        """Hand the lights back. Idempotent."""
        if not self.active:
            return
        self.active = False
        self.end_reason = reason
        for cancel in (self._cancel_timeout, self._cancel_flush):
            if cancel is not None:
                cancel()
        self._cancel_timeout = self._cancel_flush = None
        self._pending = None
        await self._release(self.lights, reason)
        _LOGGER.debug("Preview on %s ended (%s)", self.lights, reason)
        if self.on_end is not None:
            self.on_end(reason)

    async def _release(self, lights: list[str], reason: str) -> None:
        """Hand `lights` back: prior flags, then off / re-adapt / snapshot."""
        manager = self.switch.manager
        sessions = self.hass.data.get(DATA_SESSIONS, {})
        to_adapt = []
        for light in lights:
            if sessions.get(light) is self:
                del sessions[light]
            prior = self._prior_flags[light]
            manager.manual_control[light] = prior
            snap = self._snapshot[light]
            if snap["state"] != STATE_ON:
                await self._call(SERVICE_TURN_OFF, {ATTR_ENTITY_ID: light})
            elif (
                prior == LightControlAttributes.NONE
                and self.switch.is_on
                and reason not in _AL_GONE
                and DOMAIN in self.hass.data
            ):
                to_adapt.append(light)
            else:
                await self._call(
                    SERVICE_TURN_ON,
                    _restore_data(light, snap["attributes"]),
                )
        if to_adapt:
            await self.switch._update_attrs_and_maybe_adapt_lights(
                context=self.switch.create_context("preview_end"),
                lights=to_adapt,
                transition=self.switch.initial_transition,
                force=True,
            )


def _restore_data(light: str, attributes: dict[str, Any]) -> dict[str, Any]:
    """light.turn_on data that puts a light back to its snapshot state."""
    data: dict[str, Any] = {ATTR_ENTITY_ID: light, ATTR_TRANSITION: 0}
    if attributes.get(ATTR_BRIGHTNESS) is not None:
        data[ATTR_BRIGHTNESS] = attributes[ATTR_BRIGHTNESS]
    color_attr = _COLOR_ATTR_FOR_MODE.get(attributes.get(ATTR_COLOR_MODE))
    if color_attr and attributes.get(color_attr) is not None:
        value = attributes[color_attr]
        data[color_attr] = list(value) if isinstance(value, tuple) else value
    return data


async def async_end_all(hass: HomeAssistant, reason: str) -> None:
    """End every session (HA stop / integration unload)."""
    sessions = set(hass.data.get(DATA_SESSIONS, {}).values())
    for session in sessions:
        await session.async_end(reason)
