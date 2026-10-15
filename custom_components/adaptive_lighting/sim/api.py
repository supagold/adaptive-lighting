"""Websocket API for the simulator panel (homeops fork). All commands are admin-only."""

# Relative parent imports are required. HA loads this package under the
# custom_components namespace, while upstream's tests load it through a symlink
# under homeassistant.components; an absolute import would break one of the two.
# ruff: noqa: TID252

from __future__ import annotations

import datetime as dt
import zoneinfo
from typing import TYPE_CHECKING, Any

import homeassistant.helpers.config_validation as cv
import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.components.switch import DOMAIN as SWITCH_DOMAIN
from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import entity_registry as er

from ..const import CONF_LIGHTS, DOMAIN
from ..switch import _supported_features
from . import engine, preview

if TYPE_CHECKING:
    from homeassistant.config_entries import ConfigEntry

ERR_INVALID = "invalid_options"
ERR_NOT_FOUND = "not_found"
ERR_BUSY = "busy"
ERR_NOT_LOADED = "not_loaded"

_OVERRIDES = vol.Schema({str: object})


def _entry(hass: HomeAssistant, entry_id: str) -> ConfigEntry | None:
    entry = hass.config_entries.async_get_entry(entry_id)
    return entry if entry is not None and entry.domain == DOMAIN else None


def _light_info(hass: HomeAssistant, light: str) -> dict[str, Any]:
    state = hass.states.get(light)
    if state is None:
        return {"entity_id": light, "missing": True}
    attrs = state.attributes
    return {
        "entity_id": light,
        "name": attrs.get("friendly_name", light),
        "state": state.state,
        "features": sorted(_supported_features(hass, light)),
        "supported_color_modes": sorted(attrs.get("supported_color_modes") or []),
        "min_color_temp_kelvin": attrs.get("min_color_temp_kelvin"),
        "max_color_temp_kelvin": attrs.get("max_color_temp_kelvin"),
    }


def _resolve_or_error(connection, msg, hass) -> engine.Resolved | None:
    entry = _entry(hass, msg["entry_id"])
    if entry is None:
        connection.send_error(
            msg["id"],
            ERR_NOT_FOUND,
            f"No adaptive_lighting entry {msg['entry_id']}",
        )
        return None
    try:
        return engine.resolve(hass, entry, msg.get("overrides"))
    except engine.SimulationError as err:
        # Invalid unsaved values are a normal state while editing: return them as
        # a result (field -> message) so the panel can show them next to the field.
        connection.send_result(msg["id"], {"errors": err.errors})
        return None


@websocket_api.websocket_command(
    {vol.Required("type"): "adaptive_lighting/sim/profiles"},
)
@websocket_api.require_admin
@callback
def ws_profiles(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """List profiles with their effective options, lights and switches."""
    registry = er.async_get(hass)
    profiles = []
    for entry in hass.config_entries.async_entries(DOMAIN):
        try:
            resolved = engine.resolve(hass, entry)
            options, error = resolved.data, None
        except (engine.SimulationError, vol.Invalid, ValueError) as err:
            options, error = engine.stored_options(entry), str(err)
        profiles.append(
            {
                "entry_id": entry.entry_id,
                "title": entry.title,
                "loaded": entry.state is ConfigEntryState.LOADED,
                "options": _jsonable(options),
                "stored_options": _jsonable(engine.stored_options(entry)),
                "error": error,
                "lights": [
                    _light_info(hass, light) for light in options.get(CONF_LIGHTS, [])
                ],
                "switches": sorted(
                    e.entity_id
                    for e in er.async_entries_for_config_entry(registry, entry.entry_id)
                ),
            },
        )
    connection.send_result(
        msg["id"],
        {"time_zone": hass.config.time_zone, "profiles": profiles},
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): "adaptive_lighting/sim/curve",
        vol.Required("entry_id"): str,
        vol.Optional("overrides", default=dict): _OVERRIDES,
        vol.Optional("date"): cv.date,
        vol.Optional("step_min", default=5): vol.All(vol.Coerce(int), vol.Range(1, 60)),
        vol.Optional("sleep", default=False): bool,
    },
)
@websocket_api.require_admin
@callback
def ws_curve(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """The profile's curve over one local day, using unsaved overrides."""
    if (resolved := _resolve_or_error(connection, msg, hass)) is None:
        return
    tz = zoneinfo.ZoneInfo(hass.config.time_zone)
    day = msg.get("date") or dt.datetime.now(tz).date()
    try:
        samples = engine.sample_day(hass, resolved, day, msg["step_min"], msg["sleep"])
        sun = engine.sun_events(hass, resolved, day)
    except (engine.SimulationError, ValueError) as err:
        connection.send_error(msg["id"], ERR_INVALID, str(err))
        return
    connection.send_result(
        msg["id"],
        {"date": day.isoformat(), "sun": sun, "samples": samples},
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): "adaptive_lighting/sim/point",
        vol.Required("entry_id"): str,
        vol.Optional("overrides", default=dict): _OVERRIDES,
        vol.Required("at"): cv.datetime,
        vol.Optional("sleep", default=False): bool,
        vol.Optional("adapt_brightness", default=True): bool,
        vol.Optional("adapt_color", default=True): bool,
    },
)
@websocket_api.require_admin
@callback
def ws_point(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Curve values at one moment, and what each light would be sent."""
    if (resolved := _resolve_or_error(connection, msg, hass)) is None:
        return
    when: dt.datetime = msg["at"]
    if when.tzinfo is None:
        when = when.replace(tzinfo=zoneinfo.ZoneInfo(hass.config.time_zone))
    try:
        result = engine.point(
            hass,
            resolved,
            when,
            msg["sleep"],
            msg["adapt_brightness"],
            msg["adapt_color"],
        )
    except ValueError as err:
        connection.send_error(msg["id"], ERR_INVALID, str(err))
        return
    connection.send_result(msg["id"], result)


def _jsonable(data: dict[str, Any]) -> dict[str, Any]:
    out = {}
    for key, value in data.items():
        if isinstance(value, dt.timedelta):
            out[key] = value.total_seconds()
        elif isinstance(value, (dt.time, dt.datetime, dt.date)):
            out[key] = value.isoformat()
        elif isinstance(value, tuple):
            out[key] = list(value)
        else:
            out[key] = value
    return out


@callback
def _session_key(
    connection: websocket_api.ActiveConnection,
    entry_id: str,
) -> tuple[int, str]:
    # One preview per profile per connection. Keyed by entry_id, not the subscription
    # id, because HA's frontend websocket library doesn't expose subscription ids.
    return (id(connection), entry_id)


@websocket_api.websocket_command(
    {
        vol.Required("type"): "adaptive_lighting/sim/preview",
        vol.Required("entry_id"): str,
        vol.Optional("lights"): [str],
        vol.Optional("timeout_s", default=preview.DEFAULT_TIMEOUT_S): vol.All(
            vol.Coerce(float),
            vol.Range(10, 3600),
        ),
    },
)
@websocket_api.require_admin
@callback
def ws_preview(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Take over a profile's lights for preview; released when this subscription ends.

    Ends on unsubscribe, websocket disconnect, timeout, profile unload or HA stop.
    Sends an event {"status": "ended", "reason": ...} if it ends while subscribed.
    """
    entry = _entry(hass, msg["entry_id"])
    if entry is None:
        connection.send_error(
            msg["id"],
            ERR_NOT_FOUND,
            "No such adaptive_lighting entry",
        )
        return
    switch = hass.data.get(DOMAIN, {}).get(entry.entry_id, {}).get(SWITCH_DOMAIN)
    if switch is None:
        connection.send_error(msg["id"], ERR_NOT_LOADED, "Profile is not loaded")
        return
    lights = msg.get("lights") or list(switch.lights)
    unknown = [light for light in lights if light not in switch.lights]
    if unknown:
        connection.send_error(
            msg["id"],
            ERR_NOT_FOUND,
            f"Not in this profile: {unknown}",
        )
        return
    sessions: dict = hass.data.setdefault(preview.DATA_SESSIONS + "_ws", {})
    key = _session_key(connection, entry.entry_id)

    @callback
    def on_end(reason: str) -> None:
        sessions.pop(key, None)
        if msg["id"] in connection.subscriptions:
            connection.send_message(
                websocket_api.event_message(
                    msg["id"],
                    {"status": "ended", "reason": reason},
                ),
            )

    session = preview.PreviewSession(hass, switch, lights, msg["timeout_s"], on_end)
    try:
        session.start()
    except preview.PreviewBusyError as err:
        connection.send_error(msg["id"], ERR_BUSY, str(err))
        return
    sessions[key] = (entry.entry_id, session)
    # HA awaits a coroutine returned from an on_unload callback.
    entry.async_on_unload(lambda: session.async_end("unload"))

    @callback
    def unsubscribe() -> None:
        # Called on unsubscribe_events and when the websocket closes.
        hass.async_create_task(session.async_end("released"), eager_start=True)

    connection.subscriptions[msg["id"]] = unsubscribe
    connection.send_result(msg["id"])
    connection.send_message(
        websocket_api.event_message(
            msg["id"],
            {"status": "active", "lights": lights, "timeout_s": msg["timeout_s"]},
        ),
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): "adaptive_lighting/sim/preview/set",
        vol.Required("entry_id"): str,
        vol.Optional("overrides", default=dict): _OVERRIDES,
        vol.Required("at"): cv.datetime,
        vol.Optional("sleep", default=False): bool,
        vol.Optional("transition_s", default=1.0): vol.All(
            vol.Coerce(float),
            vol.Range(0, 60),
        ),
    },
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_preview_set(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Show one simulated moment on the session's lights (rate-limited to 1/s)."""
    sessions: dict = hass.data.get(preview.DATA_SESSIONS + "_ws", {})
    found = sessions.get(_session_key(connection, msg["entry_id"]))
    if found is None or not found[1].active:
        connection.send_error(
            msg["id"],
            ERR_NOT_FOUND,
            "No active preview for that profile on this connection",
        )
        return
    entry_id, session = found
    entry = _entry(hass, entry_id)
    try:
        resolved = engine.resolve(hass, entry, msg["overrides"])
    except engine.SimulationError as err:
        connection.send_result(msg["id"], {"errors": err.errors})
        return
    when: dt.datetime = msg["at"]
    if when.tzinfo is None:
        when = when.replace(tzinfo=zoneinfo.ZoneInfo(hass.config.time_zone))
    per_light = engine.point(hass, resolved, when, msg["sleep"])["per_light"]
    commands = {}
    for light, data in per_light.items():
        if "error" in data or light not in session.lights:
            continue
        # display_rgb is for the panel's swatch only; light.turn_on would reject it.
        command = {k: v for k, v in data.items() if k != "display_rgb"}
        if "transition" in command:
            command["transition"] = msg["transition_s"]
        commands[light] = command
    sent = await session.async_send(commands)
    connection.send_result(msg["id"], {"sent": sent, "commands": commands})


@callback
def async_register(hass: HomeAssistant) -> None:
    """Register the simulator's websocket commands."""
    for handler in (ws_profiles, ws_curve, ws_point, ws_preview, ws_preview_set):
        websocket_api.async_register_command(hass, handler)
