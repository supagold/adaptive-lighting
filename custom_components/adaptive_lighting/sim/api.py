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
from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import entity_registry as er

from ..const import CONF_LIGHTS, DOMAIN
from ..switch import _supported_features
from . import engine

if TYPE_CHECKING:
    from homeassistant.config_entries import ConfigEntry

ERR_INVALID = "invalid_options"
ERR_NOT_FOUND = "not_found"

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
def async_register(hass: HomeAssistant) -> None:
    """Register the simulator's websocket commands."""
    for handler in (ws_profiles, ws_curve, ws_point):
        websocket_api.async_register_command(hass, handler)
