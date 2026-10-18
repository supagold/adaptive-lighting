"""Tests for real-light preview sessions (homeops fork).

The guarantee under test: whatever ends a preview (release, browser gone, timeout,
profile unload), every light goes back to exactly how Adaptive Lighting would have had it,
including its manual-control state, without manual_control events leaking out.
"""

import datetime as dt

import pytest
from homeassistant.components.adaptive_lighting.adaptation_utils import (
    LightControlAttributes,
)
from homeassistant.components.adaptive_lighting.const import (
    ATTR_ADAPTIVE_LIGHTING_MANAGER,
    CONF_DETECT_NON_HA_CHANGES,
    CONF_LIGHTS,
    CONF_MANUAL_CONTROL,
    CONF_NAME,
    CONF_TAKE_OVER_CONTROL,
    CONF_TRANSITION,
    DOMAIN,
    SERVICE_SET_MANUAL_CONTROL,
)
from homeassistant.components.adaptive_lighting.sim import preview
from homeassistant.components.light import ATTR_BRIGHTNESS
from homeassistant.components.light import DOMAIN as LIGHT_DOMAIN
from homeassistant.const import ATTR_ENTITY_ID, SERVICE_TURN_OFF, SERVICE_TURN_ON
from homeassistant.util import dt as dt_util

from tests.common import async_fire_time_changed

from .test_switch import cleanup, setup_lights, setup_switch  # noqa: F401 (fixture)

pytestmark = pytest.mark.usefixtures("cleanup")

LIGHT_1 = "light.light_1"
LIGHT_2 = "light.light_2"
NIGHT = "2026-10-15T23:30:00"  # dim on the curve
NOON = "2026-10-15T12:00:00"  # bright on the curve


async def _setup(hass, **extra):
    await setup_lights(hass)
    entry, switch = await setup_switch(
        hass,
        {
            CONF_NAME: "Bonus Room",
            CONF_LIGHTS: [LIGHT_1, LIGHT_2],
            CONF_TRANSITION: 0,
            CONF_TAKE_OVER_CONTROL: True,
            CONF_DETECT_NON_HA_CHANGES: True,
            **extra,
        },
    )
    for light in (LIGHT_1, LIGHT_2):
        await hass.services.async_call(
            LIGHT_DOMAIN,
            SERVICE_TURN_ON,
            {ATTR_ENTITY_ID: light},
            blocking=True,
        )
    await switch._update_attrs_and_maybe_adapt_lights(
        context=switch.create_context("test"),
        force=True,
    )
    await hass.async_block_till_done()
    return entry, switch


def _manager(hass):
    return hass.data[DOMAIN][ATTR_ADAPTIVE_LIGHTING_MANAGER]


def _brightness(hass, light):
    return hass.states.get(light).attributes.get(ATTR_BRIGHTNESS)


def _manual_events(hass):
    events = []
    hass.bus.async_listen(f"{DOMAIN}.manual_control", events.append)
    return events


async def _start(hass, hass_ws_client, entry, **kwargs):
    _set.entry_id = entry.entry_id
    client = await hass_ws_client(hass)
    await client.send_json(
        {
            "id": 1,
            "type": "adaptive_lighting/sim/preview",
            "entry_id": entry.entry_id,
            **kwargs,
        },
    )
    result = await client.receive_json()
    assert result["success"], result
    event = await client.receive_json()
    assert event["event"]["status"] == "active"
    return client


async def _set(client, msg_id, at, **kwargs):
    entry_id = kwargs.pop("entry_id", _set.entry_id)
    await client.send_json(
        {
            "id": msg_id,
            "type": "adaptive_lighting/sim/preview/set",
            "entry_id": entry_id,
            "at": at,
            **kwargs,
        },
    )
    resp = await client.receive_json()
    assert resp["success"], resp
    return resp["result"]


async def _expected_brightness(switch):
    # What AL would set now. Re-adaptation targets now + initial_transition, so near
    # sunset the curve can move a step in that second: callers compare with abs=2.
    settings = switch._sun_light_settings.get_settings(False, 0)
    return round(255 * settings["brightness_pct"] / 100)


async def test_start_pauses_adaptation_and_preview_drives_lights(hass, hass_ws_client):
    entry, switch = await _setup(hass)
    client = await _start(hass, hass_ws_client, entry)
    assert (
        _manager(hass).get_manual_control_attributes(LIGHT_1)
        == LightControlAttributes.ALL
    )

    res = await _set(client, 2, NIGHT)
    assert res["sent"] is True
    await hass.async_block_till_done()
    night = res["commands"][LIGHT_1][ATTR_BRIGHTNESS]
    assert _brightness(hass, LIGHT_1) == night

    # A normal interval update must not touch a previewed light.
    await switch._update_attrs_and_maybe_adapt_lights(
        context=switch.create_context("interval"),
    )
    await hass.async_block_till_done()
    assert _brightness(hass, LIGHT_1) == night


@pytest.mark.parametrize("how", ["unsubscribe", "disconnect"])
async def test_release_restores_flags_and_readapts(hass, hass_ws_client, how):
    entry, switch = await _setup(hass)
    events = _manual_events(hass)
    client = await _start(hass, hass_ws_client, entry)
    await _set(client, 2, NIGHT if await _expected_brightness(switch) > 128 else NOON)
    await hass.async_block_till_done()

    if how == "unsubscribe":
        await client.send_json(
            {"id": 3, "type": "unsubscribe_events", "subscription": 1},
        )
        assert (await client.receive_json())["success"]
    else:
        await client.close()
    await hass.async_block_till_done()

    for light in (LIGHT_1, LIGHT_2):
        assert (
            _manager(hass).get_manual_control_attributes(light)
            == LightControlAttributes.NONE
        )
        assert _brightness(hass, light) == pytest.approx(
            await _expected_brightness(switch),
            abs=2,
        )
    assert hass.data.get(preview.DATA_SESSIONS) == {}
    assert events == [], "preview must not fire manual_control events"


async def test_timeout_restores(hass, hass_ws_client):
    entry, switch = await _setup(hass)
    client = await _start(hass, hass_ws_client, entry, timeout_s=30)
    await _set(client, 2, NIGHT if await _expected_brightness(switch) > 128 else NOON)
    async_fire_time_changed(hass, dt_util.utcnow() + dt.timedelta(seconds=31))
    await hass.async_block_till_done()
    ended = await client.receive_json()
    assert ended["event"] == {"status": "ended", "reason": "timeout"}
    assert (
        _manager(hass).get_manual_control_attributes(LIGHT_1)
        == LightControlAttributes.NONE
    )
    assert _brightness(hass, LIGHT_1) == pytest.approx(
        await _expected_brightness(switch),
        abs=2,
    )


async def test_entry_unload_ends_preview(hass, hass_ws_client):
    entry, _ = await _setup(hass)
    before = _brightness(hass, LIGHT_1)
    client = await _start(hass, hass_ws_client, entry)
    await _set(client, 2, NIGHT if before > 128 else NOON)
    await hass.async_block_till_done()
    assert _brightness(hass, LIGHT_1) != before

    assert await hass.config_entries.async_unload(entry.entry_id)
    await hass.async_block_till_done()
    assert hass.data.get(preview.DATA_SESSIONS) == {}
    # AL is gone, so the light gets its own pre-preview state back.
    assert _brightness(hass, LIGHT_1) == before

    # Loading the profile again works (and lets the cleanup fixture run).
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()


async def test_manual_light_gets_its_own_state_back(hass, hass_ws_client):
    entry, switch = await _setup(hass)
    await hass.services.async_call(
        LIGHT_DOMAIN,
        SERVICE_TURN_ON,
        {ATTR_ENTITY_ID: LIGHT_1, ATTR_BRIGHTNESS: 77},
        blocking=True,
    )
    await hass.services.async_call(
        DOMAIN,
        SERVICE_SET_MANUAL_CONTROL,
        {
            ATTR_ENTITY_ID: switch.entity_id,
            CONF_LIGHTS: [LIGHT_1],
            CONF_MANUAL_CONTROL: True,
        },
        blocking=True,
    )
    await hass.async_block_till_done()
    prior = _manager(hass).get_manual_control_attributes(LIGHT_1)
    assert prior.has_any()

    client = await _start(hass, hass_ws_client, entry)
    await _set(client, 2, NOON)
    await hass.async_block_till_done()
    await client.close()
    await hass.async_block_till_done()

    assert _manager(hass).get_manual_control_attributes(LIGHT_1) == prior
    assert _brightness(hass, LIGHT_1) == 77
    assert (
        _manager(hass).get_manual_control_attributes(LIGHT_2)
        == LightControlAttributes.NONE
    )


async def test_light_that_was_off_goes_back_off(hass, hass_ws_client):
    entry, _ = await _setup(hass)
    await hass.services.async_call(
        LIGHT_DOMAIN,
        SERVICE_TURN_OFF,
        {ATTR_ENTITY_ID: LIGHT_2},
        blocking=True,
    )
    await hass.async_block_till_done()
    client = await _start(hass, hass_ws_client, entry)
    await _set(client, 2, NOON)
    await hass.async_block_till_done()
    assert hass.states.get(LIGHT_2).state == "on"
    await client.close()
    await hass.async_block_till_done()
    assert hass.states.get(LIGHT_2).state == "off"


async def test_second_preview_on_same_lights_is_busy(hass, hass_ws_client):
    entry, _ = await _setup(hass)
    await _start(hass, hass_ws_client, entry)
    other = await hass_ws_client(hass)
    await other.send_json(
        {"id": 1, "type": "adaptive_lighting/sim/preview", "entry_id": entry.entry_id},
    )
    resp = await other.receive_json()
    assert resp["error"]["code"] == "busy"


async def test_rate_limit_queues_and_sends_latest(hass, hass_ws_client):
    entry, _ = await _setup(hass)
    client = await _start(hass, hass_ws_client, entry)
    first = await _set(client, 2, NOON)
    assert first["sent"] is True
    second = await _set(client, 3, "2026-10-15T21:00:00")
    third = await _set(client, 4, NIGHT)
    assert second["sent"] is False
    assert third["sent"] is False
    async_fire_time_changed(hass, dt_util.utcnow() + dt.timedelta(seconds=2))
    await hass.async_block_till_done()
    assert _brightness(hass, LIGHT_1) == third["commands"][LIGHT_1][ATTR_BRIGHTNESS]


async def test_no_false_manual_detection_after_restore(hass, hass_ws_client):
    entry, switch = await _setup(hass)
    events = _manual_events(hass)
    client = await _start(hass, hass_ws_client, entry)
    await _set(client, 2, NIGHT if await _expected_brightness(switch) > 128 else NOON)
    await hass.async_block_till_done()
    await client.close()
    await hass.async_block_till_done()
    # Two normal interval passes afterwards: still adapting, nothing marked manual.
    for _ in range(2):
        await switch._update_attrs_and_maybe_adapt_lights(
            context=switch.create_context("interval"),
        )
        await hass.async_block_till_done()
    assert (
        _manager(hass).get_manual_control_attributes(LIGHT_1)
        == LightControlAttributes.NONE
    )
    assert events == []


async def test_set_without_session(hass, hass_ws_client):
    await _setup(hass)
    client = await hass_ws_client(hass)
    await client.send_json(
        {
            "id": 5,
            "type": "adaptive_lighting/sim/preview/set",
            "entry_id": "nope",
            "at": NOON,
        },
    )
    assert (await client.receive_json())["error"]["code"] == "not_found"


async def test_preview_non_admin_rejected(
    hass,
    hass_ws_client,
    hass_read_only_access_token,
):
    entry, _ = await _setup(hass)
    client = await hass_ws_client(hass, hass_read_only_access_token)
    await client.send_json(
        {"id": 1, "type": "adaptive_lighting/sim/preview", "entry_id": entry.entry_id},
    )
    assert (await client.receive_json())["error"]["code"] == "unauthorized"
    assert (
        _manager(hass).get_manual_control_attributes(LIGHT_1)
        == LightControlAttributes.NONE
    )


async def _lights(client, msg_id, lights, entry_id=None):
    await client.send_json(
        {
            "id": msg_id,
            "type": "adaptive_lighting/sim/preview/lights",
            "entry_id": entry_id or _set.entry_id,
            "lights": lights,
        },
    )
    return await client.receive_json()


async def test_mute_restores_that_light_and_unmute_takes_it_back(
    hass,
    hass_ws_client,
):
    entry, switch = await _setup(hass)
    events = _manual_events(hass)
    client = await _start(hass, hass_ws_client, entry)
    at = NIGHT if await _expected_brightness(switch) > 128 else NOON
    previewed = (await _set(client, 2, at))["commands"][LIGHT_1][ATTR_BRIGHTNESS]
    await hass.async_block_till_done()

    resp = await _lights(client, 3, [LIGHT_1])
    assert resp["success"], resp
    assert resp["result"] == {"lights": [LIGHT_1]}
    await hass.async_block_till_done()
    manager = _manager(hass)
    # Muted: handed back and re-adapted. Still soloed: untouched.
    assert manager.get_manual_control_attributes(LIGHT_2) == LightControlAttributes.NONE
    assert _brightness(hass, LIGHT_2) == pytest.approx(
        await _expected_brightness(switch),
        abs=2,
    )
    assert manager.get_manual_control_attributes(LIGHT_1) == LightControlAttributes.ALL
    assert _brightness(hass, LIGHT_1) == previewed
    assert set(hass.data[preview.DATA_SESSIONS]) == {LIGHT_1}

    # Commands now skip the muted light.
    res = await _set(client, 4, at)
    assert set(res["commands"]) == {LIGHT_1}

    # Unmute: taken over again and driven by the next command.
    resp = await _lights(client, 5, [LIGHT_1, LIGHT_2])
    assert resp["success"], resp
    assert manager.get_manual_control_attributes(LIGHT_2) == LightControlAttributes.ALL
    res = await _set(client, 6, at)
    # Rate limit: the command may be queued; fire the flush.
    async_fire_time_changed(hass, dt_util.utcnow() + dt.timedelta(seconds=4))
    await hass.async_block_till_done()
    assert _brightness(hass, LIGHT_2) == res["commands"][LIGHT_2][ATTR_BRIGHTNESS]

    await client.close()
    await hass.async_block_till_done()
    for light in (LIGHT_1, LIGHT_2):
        assert (
            manager.get_manual_control_attributes(light) == LightControlAttributes.NONE
        )
    assert hass.data.get(preview.DATA_SESSIONS) == {}
    assert events == [], "preview must not fire manual_control events"


async def test_queued_command_skips_light_muted_since(hass, hass_ws_client):
    entry, switch = await _setup(hass)
    client = await _start(hass, hass_ws_client, entry)
    await _set(client, 2, NOON)
    queued = await _set(client, 3, NIGHT)
    assert queued["sent"] is False
    assert (await _lights(client, 4, [LIGHT_1]))["success"]
    await hass.async_block_till_done()
    restored = _brightness(hass, LIGHT_2)
    async_fire_time_changed(hass, dt_util.utcnow() + dt.timedelta(seconds=2))
    await hass.async_block_till_done()
    assert _brightness(hass, LIGHT_1) == queued["commands"][LIGHT_1][ATTR_BRIGHTNESS]
    assert _brightness(hass, LIGHT_2) == restored


async def test_lights_outside_profile_rejected(hass, hass_ws_client):
    entry, _ = await _setup(hass)
    client = await _start(hass, hass_ws_client, entry)
    resp = await _lights(client, 2, [LIGHT_1, "light.light_3"])
    assert resp["error"]["code"] == "not_found"
    assert set(hass.data[preview.DATA_SESSIONS]) == {LIGHT_1, LIGHT_2}


async def test_unmute_light_busy_in_other_preview(hass, hass_ws_client):
    entry, _ = await _setup(hass)
    client = await _start(hass, hass_ws_client, entry, lights=[LIGHT_1])
    other = await hass_ws_client(hass)
    await other.send_json(
        {
            "id": 1,
            "type": "adaptive_lighting/sim/preview",
            "entry_id": entry.entry_id,
            "lights": [LIGHT_2],
        },
    )
    assert (await other.receive_json())["success"]
    resp = await _lights(client, 2, [LIGHT_1, LIGHT_2])
    assert resp["error"]["code"] == "busy"
    sessions = hass.data[preview.DATA_SESSIONS]
    assert sessions[LIGHT_1] is not sessions[LIGHT_2]


async def test_lights_without_session(hass, hass_ws_client):
    entry, _ = await _setup(hass)
    client = await hass_ws_client(hass)
    resp = await _lights(client, 1, [LIGHT_1], entry_id=entry.entry_id)
    assert resp["error"]["code"] == "not_found"
