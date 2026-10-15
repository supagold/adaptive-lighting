"""Tests for compute_light_service_data (homeops fork).

The function is the per-light step of adaptation, extracted verbatim from
AdaptiveSwitch.prepare_adaptation_data so the simulator can reuse it. The upstream
suite covers it end to end; these tests pin each decision branch directly.
"""

import pytest
from homeassistant.components.adaptive_lighting.switch import (
    compute_light_service_data,
)
from homeassistant.components.light import (
    ATTR_BRIGHTNESS,
    ATTR_COLOR_TEMP_KELVIN,
    ATTR_RGB_COLOR,
    ATTR_TRANSITION,
)
from homeassistant.const import ATTR_ENTITY_ID

SETTINGS = {
    "brightness_pct": 50.0,
    "color_temp_kelvin": 2500,
    "rgb_color": (255, 160, 80),
    "force_rgb_color": False,
}
CT_RANGE = {"min_color_temp_kelvin": 2000, "max_color_temp_kelvin": 6500}
CT_AND_COLOR = {"transition", "brightness", "color_temp", "color"}

DEFAULTS = {
    "transition": 1.0,
    "adapt_brightness": True,
    "adapt_color": True,
    "prefer_rgb_color": False,
    "sleep_rgb": False,
}


def call(features, settings=None, attributes=None, **kwargs):
    return compute_light_service_data(
        "light.x",
        settings or SETTINGS,
        features,
        CT_RANGE if attributes is None else attributes,
        **{**DEFAULTS, **kwargs},
    )


def test_brightness_only_light():
    data = call({"brightness"}, attributes={})
    assert data == {ATTR_ENTITY_ID: "light.x", ATTR_BRIGHTNESS: 128}


def test_brightness_rounding():
    data = call({"brightness"}, settings={**SETTINGS, "brightness_pct": 10.0})
    assert data[ATTR_BRIGHTNESS] == round(255 * 10 / 100)


def test_color_temp_light_gets_kelvin():
    data = call({"brightness", "color_temp"})
    assert data[ATTR_COLOR_TEMP_KELVIN] == 2500
    assert ATTR_RGB_COLOR not in data


@pytest.mark.parametrize(("kelvin", "expected"), [(1000, 2000), (9000, 6500)])
def test_kelvin_clamped_to_bulb_range(kelvin, expected):
    data = call(
        {"brightness", "color_temp"},
        settings={**SETTINGS, "color_temp_kelvin": kelvin},
    )
    assert data[ATTR_COLOR_TEMP_KELVIN] == expected


def test_prefer_rgb_on_color_light_sends_rgb():
    data = call(CT_AND_COLOR, prefer_rgb_color=True)
    assert data[ATTR_RGB_COLOR] == (255, 160, 80)
    assert ATTR_COLOR_TEMP_KELVIN not in data


def test_prefer_rgb_on_ct_only_light_still_sends_kelvin():
    data = call({"brightness", "color_temp"}, prefer_rgb_color=True)
    assert ATTR_COLOR_TEMP_KELVIN in data


def test_sleep_rgb_sends_rgb():
    data = call(CT_AND_COLOR, sleep_rgb=True)
    assert ATTR_RGB_COLOR in data
    assert ATTR_COLOR_TEMP_KELVIN not in data


def test_force_rgb_after_sunset_sends_rgb():
    data = call(CT_AND_COLOR, settings={**SETTINGS, "force_rgb_color": True})
    assert ATTR_RGB_COLOR in data
    assert ATTR_COLOR_TEMP_KELVIN not in data


def test_rgb_only_light():
    data = call({"brightness", "color"}, attributes={})
    assert data[ATTR_RGB_COLOR] == (255, 160, 80)


def test_adapt_color_off():
    data = call(CT_AND_COLOR, adapt_color=False)
    assert ATTR_RGB_COLOR not in data
    assert ATTR_COLOR_TEMP_KELVIN not in data
    assert ATTR_BRIGHTNESS in data


def test_adapt_brightness_off():
    data = call(CT_AND_COLOR, adapt_brightness=False)
    assert ATTR_BRIGHTNESS not in data
    assert ATTR_COLOR_TEMP_KELVIN in data


def test_transition_included_when_supported():
    assert call(CT_AND_COLOR, transition=2.0)[ATTR_TRANSITION] == 2.0


@pytest.mark.parametrize(
    ("features", "transition"),
    [(CT_AND_COLOR, 0), ({"brightness", "color_temp"}, 2.0)],
)
def test_transition_omitted_when_zero_or_unsupported(features, transition):
    assert ATTR_TRANSITION not in call(features, transition=transition)


def test_kelvin_range_not_needed_unless_sending_kelvin():
    # A colour-only light has no min/max kelvin attributes; must not KeyError.
    call({"brightness", "color"}, attributes={})
    with pytest.raises(KeyError):
        call({"brightness", "color_temp"}, attributes={})
