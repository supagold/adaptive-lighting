"""Schedule curve (homeops fork): keyframes the user picks instead of sunrise/sunset."""

import datetime as dt
import zoneinfo

import pytest
import voluptuous as vol
from astral import LocationInfo
from astral.location import Location
from homeassistant.components.adaptive_lighting.color_and_brightness import (
    SunLightSettings,
)
from homeassistant.components.adaptive_lighting.schedule import (
    Keyframe,
    parse_schedule,
    schedule_json,
    values_at,
)

NY = zoneinfo.ZoneInfo("America/New_York")
LOCATION = Location(
    LocationInfo(
        name="n",
        region="r",
        timezone="America/New_York",
        latitude=40.7,
        longitude=-74.0,
    ),
)

WORKDAY = (
    '[{"at":"08:00","brightness":100},{"at":"17:00","brightness":100},'
    '{"at":"18:00","brightness":50},{"at":"20:30","brightness":50},{"at":"21:30","brightness":10},'
    '{"at":"06:00","brightness":10}]'
)


def settings(schedule=WORKDAY, **kw):
    return SunLightSettings(
        name="t",
        astral_observer=LOCATION.observer,
        adapt_until_sleep=False,
        max_brightness=100,
        max_color_temp=6500,
        min_brightness=1,
        min_color_temp=2000,
        sleep_brightness=7,
        sleep_rgb_or_color_temp="color_temp",
        sleep_color_temp=1500,
        sleep_rgb_color=(255, 56, 0),
        sunrise_time=None,
        min_sunrise_time=None,
        max_sunrise_time=None,
        sunset_time=None,
        min_sunset_time=None,
        max_sunset_time=None,
        brightness_mode_time_dark=dt.timedelta(seconds=900),
        brightness_mode_time_light=dt.timedelta(seconds=3600),
        timezone=NY,
        schedule=parse_schedule(schedule) if schedule else None,
        **kw,
    )


def at(day, hh, mm=0):
    return dt.datetime(2026, 11, day, hh, mm, tzinfo=NY).astimezone(dt.UTC)


def pct(s, when, sleep=False):
    return s.brightness_and_color(when, sleep)["brightness_pct"]


def test_levels_and_fades():
    s = settings()
    assert pct(s, at(13, 12)) == 100  # workday
    assert pct(s, at(13, 19)) == 50  # evening
    assert pct(s, at(13, 23)) == 10  # night
    assert pct(s, at(13, 21, 0)) == pytest.approx(30)  # midpoint of 20:30 -> 21:30
    assert pct(s, at(13, 17, 30)) == pytest.approx(75)  # midpoint of 17:00 -> 18:00
    assert pct(s, at(13, 7, 0)) == pytest.approx(
        55,
    )  # 06:00 (10) -> 08:00 (100), halfway is 55


def test_wraps_over_midnight_and_across_days():
    s = settings('[{"at":"22:00","brightness":80},{"at":"02:00","brightness":20}]')
    assert pct(s, at(13, 0, 0)) == pytest.approx(50)  # halfway between 22:00 and 02:00
    assert pct(s, at(13, 23, 0)) == pytest.approx(65)
    assert pct(s, at(13, 12, 0)) == pytest.approx(
        20 + (80 - 20) * (10 / 20),
    )  # 02:00 -> 22:00 rises


def test_sun_anchor_with_offset_follows_sunset():
    s = settings('[{"at":"06:00","brightness":10},{"at":"sunset+30m","brightness":90}]')
    sunset = s.sun.sunset(dt.date(2026, 11, 13)) + dt.timedelta(minutes=30)
    assert pct(s, sunset) == pytest.approx(90)
    s_summer = s.sun.sunset(dt.date(2026, 6, 21)) + dt.timedelta(minutes=30)
    assert pct(s, s_summer) == pytest.approx(90)  # the anchor moves with the date


def test_sleep_wins_and_sun_based_when_no_schedule():
    s = settings()
    assert pct(s, at(13, 12), sleep=True) == 7
    plain = settings(schedule=None)
    assert (
        plain.brightness_and_color(at(13, 12), False)["brightness_pct"] == 100.0
    )  # default mode, daytime


def test_colour_temp_from_points_else_sun_curve():
    s = settings(
        '[{"at":"08:00","brightness":100,"color_temp":5000},{"at":"20:00","brightness":40,"color_temp":2500}]',
    )
    out = s.brightness_and_color(at(13, 14), False)
    assert out["color_temp_kelvin"] == 3750  # halfway
    mixed = settings(
        '[{"at":"08:00","brightness":100,"color_temp":5000},{"at":"20:00","brightness":40}]',
    )
    sun_based = settings(schedule=None).brightness_and_color(at(13, 14), False)[
        "color_temp_kelvin"
    ]
    assert (
        mixed.brightness_and_color(at(13, 14), False)["color_temp_kelvin"] == sun_based
    )


def test_dst_days_use_local_clock_times():
    s = settings('[{"at":"01:00","brightness":10},{"at":"12:00","brightness":60}]')
    assert (
        pct(s, dt.datetime(2026, 11, 1, 12, 0, tzinfo=NY).astimezone(dt.UTC)) == 60
    )  # fall-back day
    assert (
        pct(s, dt.datetime(2026, 3, 8, 12, 0, tzinfo=NY).astimezone(dt.UTC)) == 60
    )  # spring-forward day


@pytest.mark.parametrize(
    "bad",
    [
        "not json",
        "[]",
        '[{"at":"08:00","brightness":50}]',  # one point
        '[{"at":"25:00","brightness":50},{"at":"09:00","brightness":50}]',
        '[{"at":"08:00","brightness":0},{"at":"09:00","brightness":50}]',
        '[{"at":"08:00","brightness":101},{"at":"09:00","brightness":50}]',
        '[{"at":"08:00","brightness":50},{"at":"08:00","brightness":60}]',  # same time
        '[{"at":"noon","brightness":50},{"at":"09:00","brightness":50}]',
        '[{"at":"08:00","brightness":50,"color_temp":500},{"at":"09:00","brightness":50}]',
        '[{"at":"08:00","brightness":50,"zzz":1},{"at":"09:00","brightness":50}]',
        '[{"brightness":50},{"at":"09:00","brightness":50}]',
    ],
)
def test_bad_schedules_are_rejected(bad):
    with pytest.raises(vol.Invalid):
        parse_schedule(bad)


def test_canonical_json_round_trips():
    text = '[{"at":"sunset-1:30","brightness":50.5,"color_temp":2700},{"at":"6:05","brightness":10}]'
    canon = schedule_json(text)
    assert (
        canon
        == '[{"at":"sunset-1:30","brightness":50.5,"color_temp":2700},{"at":"06:05","brightness":10}]'
    )
    assert parse_schedule(canon) == parse_schedule(text)
    assert schedule_json(parse_schedule(text)) == canon


def test_anchor_text_forms():
    assert parse_schedule(
        '[{"at":"sunrise+30m","brightness":5},{"at":"sunset-2h","brightness":5}]',
    ) == (
        Keyframe(brightness=5.0, anchor="sunrise", offset=dt.timedelta(minutes=30)),
        Keyframe(brightness=5.0, anchor="sunset", offset=-dt.timedelta(hours=2)),
    )


def test_values_at_handles_coincident_anchor_times():
    class Sun:  # sunrise and a fixed point collide on the same instant
        def sunrise(self, d):
            return dt.datetime.combine(d, dt.time(8, 0), tzinfo=NY).astimezone(dt.UTC)

        sunset = sunrise

    pts = parse_schedule(
        '[{"at":"sunrise","brightness":20},{"at":"08:00","brightness":80},{"at":"20:00","brightness":40}]',
    )
    b, ct = values_at(pts, Sun(), NY, at(13, 8, 0))
    assert 20 <= b <= 80 and ct is None
