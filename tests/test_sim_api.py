"""Tests for the simulator websocket API (homeops fork).

The core guarantee: for the same options, the simulator's numbers equal what the
integration's own switch computes. Tests compare against a live AdaptiveSwitch's
`_sun_light_settings`, not against a re-implementation.
"""

import datetime as dt
import zoneinfo

import pytest
from homeassistant.components.adaptive_lighting.const import (
    CONF_ADAPT_UNTIL_SLEEP,
    CONF_BRIGHTNESS_MODE,
    CONF_BRIGHTNESS_MODE_TIME_DARK,
    CONF_BRIGHTNESS_MODE_TIME_LIGHT,
    CONF_LIGHTS,
    CONF_MAX_BRIGHTNESS,
    CONF_MAX_COLOR_TEMP,
    CONF_MAX_SUNRISE_TIME,
    CONF_MIN_BRIGHTNESS,
    CONF_MIN_COLOR_TEMP,
    CONF_NAME,
    CONF_PREFER_RGB_COLOR,
    CONF_SLEEP_RGB_COLOR,
    CONF_SLEEP_RGB_OR_COLOR_TEMP,
    CONF_SUNSET_TIME,
    CONF_TRANSITION,
    DOMAIN,
)
from homeassistant.components.light import DOMAIN as LIGHT_DOMAIN
from homeassistant.core import HomeAssistant

from .test_switch import cleanup, setup_lights, setup_switch  # noqa: F401 (fixture)

# Cancel the integration's timers/tasks after every test (fixture from test_switch).
pytestmark = pytest.mark.usefixtures("cleanup")

LIGHT_1 = "light.light_1"
LIGHT_2 = "light.light_2"

# Mirrors prod's "BDRM4 TV Backlight" profile shape (tanh, fixed sunset, clamped
# sunrise, adapt until sleep with an RGB sleep colour).
TV_BACKLIGHT = {
    CONF_BRIGHTNESS_MODE: "tanh",
    CONF_BRIGHTNESS_MODE_TIME_DARK: 1800,
    CONF_BRIGHTNESS_MODE_TIME_LIGHT: 1800,
    CONF_SUNSET_TIME: "20:30:00",
    CONF_MAX_SUNRISE_TIME: "07:20:00",
    CONF_ADAPT_UNTIL_SLEEP: True,
    CONF_SLEEP_RGB_OR_COLOR_TEMP: "rgb_color",
    CONF_SLEEP_RGB_COLOR: [255, 56, 0],
    CONF_MIN_BRIGHTNESS: 10,
    CONF_MIN_COLOR_TEMP: 1000,
    CONF_MAX_COLOR_TEMP: 3500,
}
DATES = [dt.date(2026, 6, 20), dt.date(2026, 12, 21), dt.date(2026, 10, 15)]


async def _profile(hass: HomeAssistant, name: str, extra: dict):
    entry, switch = await setup_switch(
        hass,
        {CONF_NAME: name, CONF_LIGHTS: [LIGHT_1, LIGHT_2], CONF_TRANSITION: 0, **extra},
    )
    return entry, switch


async def _ws(hass, hass_ws_client, msg):
    client = await hass_ws_client(hass)
    await client.send_json({"id": 1, **msg})
    return await client.receive_json()


def _assert_matches_switch(hass, samples, switch, is_sleep):
    tz = zoneinfo.ZoneInfo(hass.config.time_zone)
    assert samples
    for sample in samples:
        when = dt.datetime.fromisoformat(sample["t"]).astimezone(tz)
        expected = switch._sun_light_settings.brightness_and_color(when, is_sleep)
        assert sample["brightness_pct"] == pytest.approx(expected["brightness_pct"])
        assert sample["color_temp_kelvin"] == expected["color_temp_kelvin"]
        assert sample["rgb_color"] == list(expected["rgb_color"])
        assert sample["force_rgb_color"] == expected["force_rgb_color"]


async def test_profiles_lists_entries_lights_and_switches(hass, hass_ws_client):
    await setup_lights(hass)
    entry, _ = await _profile(hass, "Bonus Room", {CONF_MIN_BRIGHTNESS: 15})
    resp = await _ws(hass, hass_ws_client, {"type": "adaptive_lighting/sim/profiles"})
    assert resp["success"], resp
    (profile,) = resp["result"]["profiles"]
    assert profile["entry_id"] == entry.entry_id
    assert profile["title"] == entry.title
    assert profile["loaded"] is True
    assert profile["options"][CONF_MIN_BRIGHTNESS] == 15
    assert profile["options"][CONF_MAX_BRIGHTNESS] == 100  # default filled in
    assert [light["entity_id"] for light in profile["lights"]] == [LIGHT_1, LIGHT_2]
    assert "brightness" in profile["lights"][0]["features"]
    assert len(profile["switches"]) == 4
    assert resp["result"]["time_zone"] == hass.config.time_zone


@pytest.mark.parametrize("day", DATES)
@pytest.mark.parametrize("is_sleep", [False, True])
async def test_curve_equals_live_switch(hass, hass_ws_client, day, is_sleep):
    await setup_lights(hass)
    entry, switch = await _profile(hass, "TV", TV_BACKLIGHT)
    resp = await _ws(
        hass,
        hass_ws_client,
        {
            "type": "adaptive_lighting/sim/curve",
            "entry_id": entry.entry_id,
            "date": day.isoformat(),
            "step_min": 10,
            "sleep": is_sleep,
        },
    )
    assert resp["success"], resp
    _assert_matches_switch(hass, resp["result"]["samples"], switch, is_sleep)
    assert set(resp["result"]["sun"]) == {
        "sunrise",
        "sunset",
        "solar_noon",
        "solar_midnight",
    }
    # sunset_time override pins sunset to 20:30 local
    sunset = dt.datetime.fromisoformat(resp["result"]["sun"]["sunset"])
    assert (sunset.hour, sunset.minute) == (20, 30)


@pytest.mark.parametrize("day", DATES)
async def test_overrides_equal_switch_with_those_options_saved(
    hass,
    hass_ws_client,
    day,
):
    """Unsaved overrides on profile A == profile B that has them saved."""
    await setup_lights(hass)
    entry_a, _ = await _profile(hass, "A", {})
    _, switch_b = await _profile(hass, "B", TV_BACKLIGHT)
    resp = await _ws(
        hass,
        hass_ws_client,
        {
            "type": "adaptive_lighting/sim/curve",
            "entry_id": entry_a.entry_id,
            "overrides": TV_BACKLIGHT,
            "date": day.isoformat(),
            "step_min": 15,
        },
    )
    assert resp["success"], resp
    _assert_matches_switch(hass, resp["result"]["samples"], switch_b, False)
    # and nothing was saved on A
    assert (
        CONF_SUNSET_TIME
        not in hass.config_entries.async_get_entry(entry_a.entry_id).options
    )


@pytest.mark.parametrize(
    ("day", "count"),
    [
        (dt.date(2026, 10, 15), 289),
        (dt.date(2026, 3, 8), 277),
        (dt.date(2026, 11, 1), 301),
    ],
)
async def test_sample_count_follows_local_day_length(hass, hass_ws_client, day, count):
    """5-minute samples: 24 h -> 289; DST spring-forward 23 h -> 277; fall-back 25 h -> 301."""
    await hass.config.async_update(time_zone="America/New_York")
    await setup_lights(hass)
    entry, _ = await _profile(hass, "X", {})
    resp = await _ws(
        hass,
        hass_ws_client,
        {
            "type": "adaptive_lighting/sim/curve",
            "entry_id": entry.entry_id,
            "date": day.isoformat(),
        },
    )
    assert resp["success"], resp
    samples = resp["result"]["samples"]
    assert len(samples) == count
    assert samples[0]["t"].startswith(f"{day.isoformat()}T00:00:00")
    assert samples[-1]["t"].startswith(
        f"{(day + dt.timedelta(days=1)).isoformat()}T00:00:00",
    )


@pytest.mark.parametrize(
    ("overrides", "field"),
    [
        ({"no_such_option": 1}, "no_such_option"),
        ({CONF_MIN_BRIGHTNESS: 0}, CONF_MIN_BRIGHTNESS),
        ({CONF_MIN_BRIGHTNESS: "ten"}, CONF_MIN_BRIGHTNESS),
        ({CONF_SUNSET_TIME: "25:99"}, CONF_SUNSET_TIME),
        ({CONF_BRIGHTNESS_MODE: "cubic"}, CONF_BRIGHTNESS_MODE),
        ({CONF_PREFER_RGB_COLOR: "yes"}, CONF_PREFER_RGB_COLOR),
    ],
)
async def test_invalid_overrides_report_the_field(
    hass,
    hass_ws_client,
    overrides,
    field,
):
    await setup_lights(hass)
    entry, _ = await _profile(hass, "X", {})
    resp = await _ws(
        hass,
        hass_ws_client,
        {
            "type": "adaptive_lighting/sim/curve",
            "entry_id": entry.entry_id,
            "overrides": overrides,
        },
    )
    assert resp["success"], resp
    assert field in resp["result"]["errors"]
    assert "samples" not in resp["result"]


async def test_unknown_entry(hass, hass_ws_client):
    await setup_lights(hass)
    await _profile(hass, "X", {})
    resp = await _ws(
        hass,
        hass_ws_client,
        {"type": "adaptive_lighting/sim/curve", "entry_id": "nope"},
    )
    assert resp["error"]["code"] == "not_found"


@pytest.mark.parametrize(
    "msg",
    [
        {"type": "adaptive_lighting/sim/profiles"},
        {"type": "adaptive_lighting/sim/curve", "entry_id": "x"},
        {
            "type": "adaptive_lighting/sim/point",
            "entry_id": "x",
            "at": "2026-10-15T12:00:00",
        },
    ],
)
async def test_non_admin_rejected(
    hass,
    hass_ws_client,
    hass_read_only_access_token,
    msg,
):
    await setup_lights(hass)
    await _profile(hass, "X", {})
    client = await hass_ws_client(hass, hass_read_only_access_token)
    await client.send_json({"id": 1, **msg})
    resp = await client.receive_json()
    assert resp["error"]["code"] == "unauthorized"


async def test_point_per_light_and_no_side_effects(hass, hass_ws_client):
    await setup_lights(hass)
    entry, switch = await _profile(hass, "TV", TV_BACKLIGHT)
    calls = []
    hass.bus.async_listen(
        "call_service",
        lambda e: calls.append(e) if e.data["domain"] == LIGHT_DOMAIN else None,
    )
    await hass.async_block_till_done()
    tz = zoneinfo.ZoneInfo(hass.config.time_zone)
    at = dt.datetime(2026, 10, 15, 13, 0, tzinfo=tz)
    resp = await _ws(
        hass,
        hass_ws_client,
        {
            "type": "adaptive_lighting/sim/point",
            "entry_id": entry.entry_id,
            "at": at.isoformat(),
        },
    )
    assert resp["success"], resp
    result = resp["result"]
    expected = switch._sun_light_settings.brightness_and_color(at, False)
    assert result["settings"]["color_temp_kelvin"] == expected["color_temp_kelvin"]
    for light in (LIGHT_1, LIGHT_2):
        data = result["per_light"][light]
        assert data["brightness"] == round(255 * expected["brightness_pct"] / 100)
        state = hass.states.get(light)
        if "color_temp_kelvin" in data:
            assert (
                state.attributes["min_color_temp_kelvin"]
                <= data["color_temp_kelvin"]
                <= state.attributes["max_color_temp_kelvin"]
            )
    await hass.async_block_till_done()
    assert calls == [], "simulation must not call light services"


async def test_point_sleep_rgb_sends_rgb(hass, hass_ws_client):
    await setup_lights(hass)
    entry, _ = await _profile(hass, "TV", TV_BACKLIGHT)
    resp = await _ws(
        hass,
        hass_ws_client,
        {
            "type": "adaptive_lighting/sim/point",
            "entry_id": entry.entry_id,
            "at": "2026-10-15T23:00:00",
            "sleep": True,
        },
    )
    assert resp["success"], resp
    data = resp["result"]["per_light"][LIGHT_1]
    assert data["rgb_color"] == [255, 56, 0]
    assert "color_temp_kelvin" not in data
    assert data["display_rgb"] == [255, 56, 0]


async def test_point_display_rgb_uses_clamped_kelvin(hass, hass_ws_client):
    """The swatch colour is HA's conversion of the Kelvin the bulb would really get."""
    from homeassistant.util.color import color_temperature_to_rgb

    await setup_lights(hass)
    entry, _ = await _profile(hass, "Wide", {CONF_MIN_COLOR_TEMP: 1000})
    resp = await _ws(
        hass,
        hass_ws_client,
        {
            "type": "adaptive_lighting/sim/point",
            "entry_id": entry.entry_id,
            "at": "2026-10-15T23:00:00",
        },
    )
    data = resp["result"]["per_light"][LIGHT_1]
    assert (
        data["color_temp_kelvin"]
        >= hass.states.get(LIGHT_1).attributes["min_color_temp_kelvin"]
    )
    assert data["display_rgb"] == [
        round(c) for c in color_temperature_to_rgb(data["color_temp_kelvin"])
    ]


async def test_commands_registered_once_with_many_entries(hass, hass_ws_client):
    await setup_lights(hass)
    for name in ("A", "B", "C"):
        await _profile(hass, name, {})
    resp = await _ws(hass, hass_ws_client, {"type": "adaptive_lighting/sim/profiles"})
    assert resp["success"]
    assert len(resp["result"]["profiles"]) == 3
    assert DOMAIN in hass.data
