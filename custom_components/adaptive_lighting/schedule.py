"""Schedule curve (homeops fork): fade between keyframes at times the user picks.

A schedule is a list of points ``{"at": ..., "brightness": 1-100, "color_temp": optional K}``.
``at`` is a clock time (``"08:00"``, ``"08:00:30"``) or a sun anchor (``"sunrise"``, ``"sunset"``,
optionally with an offset such as ``"sunset+30m"``, ``"sunrise-1h"`` or ``"sunset+1:30"``). The
brightness fades linearly between neighbouring points and wraps over midnight (the last point of a
day fades to the first point of the next). Pure Python, no Home Assistant imports.
"""

from __future__ import annotations

import bisect
import datetime  # noqa: ICN001
import json
import re
from dataclasses import dataclass
from datetime import UTC, timedelta
from typing import Any, Protocol

import voluptuous as vol

MAX_POINTS = 64
MIN_COLOR_TEMP = 1000
MAX_COLOR_TEMP = 10000

_ANCHOR = re.compile(
    r"^(sunrise|sunset)(?:([+-])(?:(\d{1,3})(m|h)|(\d{1,2}):(\d{2})))?$",
)
_CLOCK = re.compile(r"^(\d{1,2}):(\d{2})(?::(\d{2}))?$")


@dataclass(frozen=True)
class Keyframe:
    """One point of a schedule."""

    brightness: float
    at: datetime.time | None = None  # fixed clock time (local), or None for an anchor
    anchor: str | None = None  # "sunrise" or "sunset"
    offset: timedelta = timedelta()  # added to the anchor
    color_temp: int | None = None

    def text(self) -> str:
        """The point's ``at`` as text (round-trips through :func:`parse_at`)."""
        if self.anchor is None:
            assert self.at is not None
            return self.at.strftime("%H:%M" if self.at.second == 0 else "%H:%M:%S")
        minutes = round(self.offset.total_seconds() / 60)
        if minutes == 0:
            return self.anchor
        sign = "+" if minutes > 0 else "-"
        minutes = abs(minutes)
        return f"{self.anchor}{sign}{minutes // 60}:{minutes % 60:02d}"


class _Sun(Protocol):
    def sunrise(self, dt: datetime.date) -> datetime.datetime: ...
    def sunset(self, dt: datetime.date) -> datetime.datetime: ...


def parse_at(text: str) -> dict[str, Any]:
    """Parse an ``at`` string into Keyframe keyword arguments (at / anchor / offset)."""
    value = text.strip().lower()
    if m := _CLOCK.match(value):
        h, mi, s = int(m[1]), int(m[2]), int(m[3] or 0)
        if h > 23 or mi > 59 or s > 59:
            msg = f"not a valid time: {text!r}"
            raise vol.Invalid(msg)
        return {"at": datetime.time(h, mi, s)}
    if m := _ANCHOR.match(value):
        offset = timedelta()
        if m[2]:
            if m[3]:
                amount = int(m[3]) * (60 if m[4] == "h" else 1)
            else:
                amount = int(m[5]) * 60 + int(m[6])
            offset = timedelta(minutes=-amount if m[2] == "-" else amount)
        return {"anchor": m[1], "offset": offset}
    msg = f"not a time or sun anchor: {text!r} (use 08:00, sunrise, sunset+30m)"
    raise vol.Invalid(msg)


def parse_schedule(value: Any) -> tuple[Keyframe, ...]:  # noqa: PLR0912
    """Validate a schedule given as JSON text, a list of dicts or already parsed Keyframes."""
    if isinstance(value, tuple) and all(isinstance(v, Keyframe) for v in value):
        points: list[Any] = list(value)
    elif isinstance(value, str):
        try:
            points = json.loads(value)
        except json.JSONDecodeError as err:
            msg = f"schedule is not valid JSON: {err.msg}"
            raise vol.Invalid(msg) from err
    else:
        points = list(value) if isinstance(value, (list, tuple)) else []
    if not isinstance(points, list) or not points:
        msg = "schedule must be a list of points"
        raise vol.Invalid(msg)
    if not 2 <= len(points) <= MAX_POINTS:
        msg = f"a schedule needs between 2 and {MAX_POINTS} points"
        raise vol.Invalid(msg)
    out: list[Keyframe] = []
    for i, p in enumerate(points, 1):
        if isinstance(p, Keyframe):
            out.append(p)
            continue
        if not isinstance(p, dict) or "at" not in p or "brightness" not in p:
            msg = f'point {i}: needs "at" and "brightness"'
            raise vol.Invalid(msg)
        extra = set(p) - {"at", "brightness", "color_temp"}
        if extra:
            msg = f"point {i}: unknown key(s) {sorted(extra)}"
            raise vol.Invalid(msg)
        try:
            kw = parse_at(str(p["at"]))
        except vol.Invalid as err:
            msg = f"point {i}: {err.msg}"
            raise vol.Invalid(msg) from err
        b = p["brightness"]
        if isinstance(b, bool) or not isinstance(b, (int, float)) or not 1 <= b <= 100:
            msg = f"point {i}: brightness must be a number from 1 to 100"
            raise vol.Invalid(msg)
        ct = p.get("color_temp")
        if ct is not None and (
            isinstance(ct, bool)
            or not isinstance(ct, int)
            or not MIN_COLOR_TEMP <= ct <= MAX_COLOR_TEMP
        ):
            msg = f"point {i}: color_temp must be a whole number of Kelvin from {MIN_COLOR_TEMP} to {MAX_COLOR_TEMP}"
            raise vol.Invalid(msg)
        out.append(Keyframe(brightness=float(b), color_temp=ct, **kw))
    fixed = [k.at for k in out if k.anchor is None]
    if len(set(fixed)) != len(fixed):
        msg = "two points have the same time"
        raise vol.Invalid(msg)
    return tuple(out)


def schedule_json(value: Any) -> str:
    """Canonical JSON text for a schedule (what is stored in the options)."""
    out = []
    for k in parse_schedule(value):
        p: dict[str, Any] = {
            "at": k.text(),
            "brightness": int(k.brightness)
            if k.brightness == int(k.brightness)
            else k.brightness,
        }
        if k.color_temp is not None:
            p["color_temp"] = k.color_temp
        out.append(p)
    return json.dumps(out, separators=(",", ":"))


def _resolve(
    k: Keyframe, day: datetime.date, sun: _Sun, tz: datetime.tzinfo,
) -> datetime.datetime:
    if k.anchor == "sunrise":
        return sun.sunrise(day) + k.offset
    if k.anchor == "sunset":
        return sun.sunset(day) + k.offset
    assert k.at is not None
    return datetime.datetime.combine(day, k.at).replace(tzinfo=tz).astimezone(UTC)


def values_at(
    points: tuple[Keyframe, ...],
    sun: _Sun,
    tz: datetime.tzinfo,
    dt: datetime.datetime,
) -> tuple[float, int | None]:
    """Brightness % and colour temperature (None = not set by the schedule) at ``dt``."""
    day = dt.astimezone(tz).date()
    events: list[tuple[datetime.datetime, Keyframe]] = []
    for d in (day - timedelta(days=1), day, day + timedelta(days=1)):
        events.extend((_resolve(k, d, sun, tz), k) for k in points)
    events.sort(key=lambda e: e[0])
    times = [t for t, _ in events]
    i = bisect.bisect_right(times, dt) - 1
    i = min(max(i, 0), len(events) - 2)
    (t0, k0), (t1, k1) = events[i], events[i + 1]
    span = (t1 - t0).total_seconds()
    f = 0.0 if span <= 0 else min(max((dt - t0).total_seconds() / span, 0.0), 1.0)
    brightness = k0.brightness + (k1.brightness - k0.brightness) * f
    ct = None
    if k0.color_temp is not None and k1.color_temp is not None:
        ct = 5 * round((k0.color_temp + (k1.color_temp - k0.color_temp) * f) / 5)
    return brightness, ct
