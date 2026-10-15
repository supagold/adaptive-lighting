"""Simulation engine (homeops fork).

Computes what Adaptive Lighting would do for a profile, using the integration's own
code paths so the simulator cannot drift from real behaviour:

- options -> typed settings: `switch.validate` (the `change_switch_settings` path)
- per-field checks: `VALIDATION_TUPLES` (the options-flow schema) + `EXTRA_VALIDATION`
- curve object: `switch.build_sun_light_settings` (what the switch itself builds)
- curve values: `SunLightSettings.brightness_and_color`
- per-light commands: `switch.compute_light_service_data`

Nothing here touches lights or config entries.
"""

# Relative parent imports are required. HA loads this package under the
# custom_components namespace, while upstream's tests load it through a symlink
# under homeassistant.components; an absolute import would break one of the two.
# ruff: noqa: TID252

from __future__ import annotations

import datetime as dt
import zoneinfo
from dataclasses import dataclass
from typing import TYPE_CHECKING, Any

import voluptuous as vol
from homeassistant.config_entries import SOURCE_IMPORT

from ..const import (
    CONF_LIGHTS,
    CONF_PREFER_RGB_COLOR,
    CONF_SLEEP_RGB_OR_COLOR_TEMP,
    CONF_TRANSITION,
    EXTRA_VALIDATION,
    NONE_STR,
    VALIDATION_TUPLES,
)
from ..switch import (
    _supported_features,
    build_sun_light_settings,
    compute_light_service_data,
    validate,
)

if TYPE_CHECKING:
    from homeassistant.config_entries import ConfigEntry
    from homeassistant.core import HomeAssistant

    from ..color_and_brightness import SunLightSettings

FIELD_VALIDATORS: dict[str, Any] = {key: v for key, _, v in VALIDATION_TUPLES}
MIN_STEP_MINUTES = 1
MAX_STEP_MINUTES = 60


class SimulationError(Exception):
    """Invalid simulation input; `errors` maps field -> message."""

    def __init__(self, errors: dict[str, str]) -> None:
        """Store per-field errors."""
        super().__init__(", ".join(f"{k}: {v}" for k, v in errors.items()))
        self.errors = errors


@dataclass(frozen=True)
class Resolved:
    """A profile's effective options (saved + overrides) and its curve object."""

    data: dict[str, Any]
    settings: SunLightSettings


def stored_options(entry: ConfigEntry) -> dict[str, Any]:
    """Saved options with the same precedence `switch.validate` uses."""
    if entry.source == SOURCE_IMPORT:
        return {**entry.options, **entry.data}
    return {**entry.data, **entry.options}


def check_overrides(overrides: dict[str, Any]) -> dict[str, str]:
    """Validate unsaved values field by field, as the options flow would."""
    errors: dict[str, str] = {}
    for key, value in overrides.items():
        if key not in FIELD_VALIDATORS:
            errors[key] = "unknown option"
            continue
        try:
            vol.Schema(FIELD_VALIDATORS[key])(value)
            if key in EXTRA_VALIDATION and value is not None and value != NONE_STR:
                EXTRA_VALIDATION[key][0](value)
        except (vol.Invalid, ValueError, TypeError) as err:
            errors[key] = str(err) or "invalid value"
    return errors


def resolve(
    hass: HomeAssistant,
    entry: ConfigEntry,
    overrides: dict[str, Any] | None = None,
) -> Resolved:
    """Effective options for `entry` with `overrides` applied (not saved)."""
    overrides = overrides or {}
    if errors := check_overrides(overrides):
        raise SimulationError(errors)
    merged = {**stored_options(entry), **overrides}
    data = validate(None, service_data=merged)
    return Resolved(data, build_sun_light_settings(hass, entry.title, data))


def _sample(
    settings: SunLightSettings,
    when: dt.datetime,
    is_sleep: bool,
) -> dict[str, Any]:
    values = settings.brightness_and_color(when, is_sleep)
    return {
        "brightness_pct": values["brightness_pct"],
        "color_temp_kelvin": values["color_temp_kelvin"],
        "rgb_color": list(values["rgb_color"]),
        "sun_position": values["sun_position"],
        "force_rgb_color": values["force_rgb_color"],
    }


def day_bounds(day: dt.date, tz: dt.tzinfo) -> tuple[dt.datetime, dt.datetime]:
    """Local midnight to next local midnight (23 or 25 h across DST changes)."""
    start = dt.datetime.combine(day, dt.time(0), tzinfo=tz)
    end = dt.datetime.combine(day + dt.timedelta(days=1), dt.time(0), tzinfo=tz)
    return start, end


def sample_day(
    hass: HomeAssistant,
    resolved: Resolved,
    day: dt.date,
    step_minutes: int = 5,
    is_sleep: bool = False,
) -> list[dict[str, Any]]:
    """The curve across one local day, every `step_minutes`, endpoints included."""
    if not MIN_STEP_MINUTES <= step_minutes <= MAX_STEP_MINUTES:
        raise SimulationError(
            {"step_min": f"must be {MIN_STEP_MINUTES}-{MAX_STEP_MINUTES}"},
        )
    tz = zoneinfo.ZoneInfo(hass.config.time_zone)
    start, end = day_bounds(day, tz)
    utc_start, utc_end = start.astimezone(dt.UTC), end.astimezone(dt.UTC)
    step = dt.timedelta(minutes=step_minutes)
    samples, when = [], utc_start
    while when <= utc_end:
        local = when.astimezone(tz)
        samples.append(
            {
                "t": local.isoformat(),
                "minute": int((when - utc_start).total_seconds() // 60),
                **_sample(resolved.settings, when, is_sleep),
            },
        )
        when += step
    return samples


def sun_events(hass: HomeAssistant, resolved: Resolved, day: dt.date) -> dict[str, str]:
    """Sunrise/sunset/noon/midnight as the profile sees them (after overrides/clamps)."""
    tz = zoneinfo.ZoneInfo(hass.config.time_zone)
    noon = dt.datetime.combine(day, dt.time(12), tzinfo=tz)
    events = resolved.settings.sun.sun_events(noon)
    return {
        str(getattr(name, "value", name)): dt.datetime.fromtimestamp(ts, tz).isoformat()
        for name, ts in events
    }


def point(
    hass: HomeAssistant,
    resolved: Resolved,
    when: dt.datetime,
    is_sleep: bool = False,
    adapt_brightness: bool = True,
    adapt_color: bool = True,
) -> dict[str, Any]:
    """Curve values at `when`, plus the exact light.turn_on data each light would get."""
    data = resolved.data
    settings = resolved.settings.brightness_and_color(when, is_sleep)
    sleep_rgb = is_sleep and data[CONF_SLEEP_RGB_OR_COLOR_TEMP] == "rgb_color"
    per_light: dict[str, Any] = {}
    for light in data[CONF_LIGHTS]:
        state = hass.states.get(light)
        if state is None:
            per_light[light] = {"error": "entity not found"}
            continue
        service_data = compute_light_service_data(
            light,
            settings,
            _supported_features(hass, light),
            state.attributes,
            transition=data[CONF_TRANSITION],
            adapt_brightness=adapt_brightness,
            adapt_color=adapt_color,
            prefer_rgb_color=data[CONF_PREFER_RGB_COLOR],
            sleep_rgb=sleep_rgb,
        )
        service_data.pop("entity_id", None)
        per_light[light] = {
            key: list(value) if isinstance(value, tuple) else value
            for key, value in service_data.items()
        }
    return {
        "t": when.astimezone(zoneinfo.ZoneInfo(hass.config.time_zone)).isoformat(),
        "settings": _sample(resolved.settings, when, is_sleep),
        "per_light": per_light,
    }
