import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { clockText, isoForMinute, minuteForX, nearestIndex, totalMinutes, xForMinute } from "../src/lib/time";
import { LatestThrottle, Playback, type Clock } from "../src/lib/playback";
import { buildPayload, changes, coerce, parseForm, savedValues } from "../src/lib/options";
import { brightnessPath, colorStops, hourTicks, yForPct } from "../src/lib/chart";
import { asLightList, lightRows, lightStatus, previewLights, pruneMix, sameLights, toggle } from "../src/lib/lights";
import type { Curve } from "../src/lib/types";

const here = dirname(fileURLToPath(import.meta.url));
const load = (name: string) => JSON.parse(readFileSync(join(here, "fixtures", name), "utf8"));
const day: Curve = load("curve_bonus_2026-10-15.json");
const dst: Curve = load("curve_bonus_2026-11-01_dst.json");
const flow = load("options_flow_1.32.0.json");

describe("time axis", () => {
  const axis = { totalMinutes: 1440, width: 1000, padLeft: 40, padRight: 10 };

  it("maps minutes to x and back", () => {
    expect(xForMinute(0, axis)).toBe(40);
    expect(xForMinute(1440, axis)).toBe(990);
    expect(xForMinute(720, axis)).toBe(515);
    expect(minuteForX(515, axis)).toBe(720);
  });

  it("clamps outside the plot", () => {
    expect(minuteForX(0, axis)).toBe(0);
    expect(minuteForX(5000, axis)).toBe(1440);
    expect(xForMinute(-50, axis)).toBe(40);
  });

  it("knows a DST day is 25 hours long", () => {
    expect(totalMinutes(day.samples)).toBe(1440);
    expect(totalMinutes(dst.samples)).toBe(1500);
  });

  it("finds the nearest sample", () => {
    expect(nearestIndex(day.samples, 0)).toBe(0);
    expect(nearestIndex(day.samples, 1440)).toBe(288);
    expect(day.samples[nearestIndex(day.samples, 722)].minute).toBe(720);
    expect(day.samples[nearestIndex(day.samples, 723)].minute).toBe(725);
  });

  it("shows wall-clock time as HA reported it", () => {
    expect(clockText(day.samples[nearestIndex(day.samples, 20 * 60)].t)).toBe("20:00");
  });

  it("builds local timestamps with the right offset, across DST", () => {
    expect(isoForMinute(day.samples, 20 * 60)).toBe("2026-10-15T20:00:00-04:00");
    expect(isoForMinute(day.samples, 20 * 60 + 2)).toBe("2026-10-15T20:02:00-04:00");
    // 1500 minutes after midnight on 1 Nov = next local midnight, now EST (-05:00)
    expect(isoForMinute(dst.samples, 1500)).toBe("2026-11-02T00:00:00-05:00");
    // 03:00 local on the DST day is 240 elapsed minutes (01:00-02:00 happens twice)
    expect(isoForMinute(dst.samples, 240)).toBe("2026-11-01T03:00:00-05:00");
  });
});

describe("playback", () => {
  function fakeClock() {
    let t = 0;
    const frames: Array<() => void> = [];
    const clock: Clock = { now: () => t, schedule: (cb) => frames.push(cb), cancel: () => undefined };
    return { clock, advance: (ms: number) => { t += ms; }, frames };
  }

  it("crosses the whole day in the chosen duration (default 30 s)", () => {
    const { clock, advance } = fakeClock();
    const ticks: number[] = [];
    const p = new Playback(1440, 30_000, (m) => ticks.push(m), clock);
    p.play();
    advance(15_000);
    p.tick();
    expect(p.minute).toBeCloseTo(720);
    advance(15_000);
    p.tick();
    expect(p.minute).toBe(1440);
    expect(p.playing).toBe(false);
  });

  it("pauses and resumes from where it was", () => {
    const { clock, advance } = fakeClock();
    const p = new Playback(1440, 30_000, () => undefined, clock);
    p.play();
    advance(10_000);
    p.tick();
    p.pause();
    advance(60_000); // time passes while paused
    p.play();
    advance(5_000);
    p.tick();
    expect(p.minute).toBeCloseTo(720);
  });

  it("seeks while playing and keeps going from there", () => {
    const { clock, advance } = fakeClock();
    const p = new Playback(1440, 24_000, () => undefined, clock); // 1 min per ~16.7 ms
    p.play();
    p.seek(600);
    advance(1_000);
    p.tick();
    expect(p.minute).toBeCloseTo(660);
  });

  it("restarts from the beginning when played at the end", () => {
    const { clock } = fakeClock();
    const p = new Playback(1440, 30_000, () => undefined, clock);
    p.seek(1440);
    p.play();
    expect(p.minute).toBe(0);
  });

  it("changing speed mid-play doesn't jump the playhead", () => {
    const { clock, advance } = fakeClock();
    const p = new Playback(1440, 30_000, () => undefined, clock);
    p.play();
    advance(10_000);
    p.tick();
    const at = p.minute;
    p.setDuration(60_000);
    p.tick();
    expect(p.minute).toBeCloseTo(at);
  });
});

describe("real-light throttle", () => {
  it("sends at most once per interval, latest value wins", () => {
    let now = 0;
    const timers: Array<{ at: number; cb: () => void }> = [];
    const sent: number[] = [];
    const t = new LatestThrottle<number>(
      1000,
      (v) => sent.push(v),
      () => now,
      (cb, ms) => { timers.push({ at: now + ms, cb }); return timers.length as unknown as ReturnType<typeof setTimeout>; },
      () => undefined,
    );
    t.push(1);
    t.push(2);
    t.push(3);
    expect(sent).toEqual([1]);
    now = 1000;
    timers.shift()!.cb();
    expect(sent).toEqual([1, 3]);
  });
});

describe("real-light throttle with real timer defaults", () => {
  it("delivers the queued value through the default timer functions", () => {
    vi.useFakeTimers();
    try {
      const sent: string[] = [];
      const t = new LatestThrottle<string>(1000, (v) => sent.push(v));
      t.push("21:10");
      t.push("12:00"); // within the interval: queued on the default timer
      expect(sent).toEqual(["21:10"]);
      vi.advanceTimersByTime(1000);
      expect(sent).toEqual(["21:10", "12:00"]);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("options form", () => {
  const form = parseForm(flow);

  it("parses basic and advanced fields from HA's real 1.32 form", () => {
    expect(form.sections).toEqual(["advanced"]);
    expect(form.fields).toHaveLength(42);
    const minB = form.fields.find((f) => f.name === "min_brightness")!;
    expect(minB).toMatchObject({ section: null, kind: "integer", min: 1, max: 100, value: 40 });
    expect(form.fields.find((f) => f.name === "brightness_mode")).toMatchObject({ section: "advanced", kind: "select" });
    expect(form.fields.find((f) => f.name === "lights")!.kind).toBe("entity");
  });

  it("diffs only changed fields", () => {
    const saved = savedValues(form);
    expect(changes(saved, { ...saved, min_brightness: 20, lights: [...(saved.lights as string[])] })).toEqual({ min_brightness: 20 });
  });

  it("nests the full set for submit", () => {
    const p = buildPayload(form, { min_brightness: 20, sunset_time: "19:30" });
    expect(p.min_brightness).toBe(20);
    expect((p.advanced as Record<string, unknown>).sunset_time).toBe("19:30");
    expect("sunset_time" in p).toBe(false);
    expect(Object.keys(p.advanced as object)).toHaveLength(33);
    expect(Object.keys(p).filter((k) => k !== "advanced")).toHaveLength(9);
  });

  it("coerces and validates inputs like the options flow", () => {
    const f = (n: string) => form.fields.find((x) => x.name === n)!;
    expect(coerce(f("min_brightness"), "25")).toEqual([25, null]);
    expect(coerce(f("min_brightness"), "0")[1]).toBe("minimum 1");
    expect(coerce(f("min_brightness"), "2.5")[1]).toMatch(/whole number/);
    expect(coerce(f("transition"), "2.5")).toEqual([2.5, null]);
    expect(coerce(f("brightness_mode"), "cubic")[1]).toBeTruthy();
    expect(coerce(f("sleep_rgb_color"), "255, 56, 0")).toEqual([[255, 56, 0], null]);
    expect(coerce(f("lights"), "light.a, light.b")).toEqual([["light.a", "light.b"], null]);
    expect(coerce(f("take_over_control"), false)).toEqual([false, null]);
  });
});

describe("chart geometry", () => {
  const box = { totalMinutes: 1440, width: 1000, padLeft: 40, padRight: 10, height: 300, padTop: 10, padBottom: 30 };

  it("puts 100% at the top and 0% at the bottom", () => {
    expect(yForPct(100, box)).toBe(10);
    expect(yForPct(0, box)).toBe(270);
  });

  it("draws one point per sample", () => {
    const path = brightnessPath(day.samples, box);
    expect(path.startsWith("M40.0,")).toBe(true);
    expect(path.split("L")).toHaveLength(day.samples.length);
  });

  it("colour strip spans 0..1", () => {
    const stops = colorStops(day.samples);
    expect(stops[0].offset).toBe(0);
    expect(stops[stops.length - 1].offset).toBe(1);
  });

  it("hour ticks follow the day length", () => {
    expect(hourTicks(1440)).toEqual([0, 180, 360, 540, 720, 900, 1080, 1260, 1440]);
    expect(hourTicks(1500).length).toBe(9);
  });
});

import { snap } from "../src/lib/time";
describe("snap", () => {
  it("rounds taps to the 5-minute sample grid", () => {
    expect(snap(1199)).toBe(1200);
    expect(snap(1197.4)).toBe(1195);
    expect(snap(0.4)).toBe(0);
  });
});

import { clock12, hourLabel12 } from "../src/lib/time";
describe("12-hour clock", () => {
  it("formats playhead times", () => {
    expect(clock12("2026-10-15T00:05:00-04:00")).toBe("12:05 AM");
    expect(clock12("2026-10-15T09:00:00-04:00")).toBe("9:00 AM");
    expect(clock12("2026-10-15T12:30:00-04:00")).toBe("12:30 PM");
    expect(clock12("2026-10-15T20:20:00-04:00")).toBe("8:20 PM");
    expect(clock12(isoForMinute(day.samples, 20 * 60 + 2))).toBe("8:02 PM");
  });

  it("labels hour ticks", () => {
    expect(hourLabel12("2026-10-15T00:00:00-04:00")).toBe("12 AM");
    expect(hourLabel12("2026-10-15T15:00:00-04:00")).toBe("3 PM");
    expect(hourLabel12("2026-10-15T12:00:00-04:00", true)).toBe("12p");
    expect(hourLabel12("2026-10-15T06:00:00-04:00", true)).toBe("6a");
  });
});

describe("lights: mute/solo and the edited list", () => {
  const A = "light.a", B = "light.b", C = "light.c";
  const mix = (muted: string[] = [], solo: string[] = []) => ({ muted: new Set(muted), solo: new Set(solo) });

  it("reads arrays and the text-box fallback", () => {
    expect(asLightList([A, B])).toEqual([A, B]);
    expect(asLightList(` ${A}, ${B},,${A} `)).toEqual([A, B]);
    expect(asLightList(undefined)).toEqual([]);
  });

  it("all play with nothing muted or soloed", () => {
    expect(lightRows([A, B], [A, B], mix()).map((r) => r.status)).toEqual(["active", "active"]);
  });

  it("mute removes a light", () => {
    expect(previewLights([A, B], [A, B], mix([B]))).toEqual([A]);
    expect(lightStatus(B, mix([B]))).toBe("muted");
  });

  it("solo wins over mute", () => {
    const m = mix([A], [A, C]);
    expect(lightStatus(A, m)).toBe("solo");
    expect(lightStatus(B, m)).toBe("not-soloed");
    expect(previewLights([A, B, C], [A, B, C], m)).toEqual([A, C]);
  });

  it("unsaved additions show but are not previewed on real lights", () => {
    const rows = lightRows([A], [A, C], mix());
    expect(rows.find((r) => r.id === C)).toMatchObject({ saved: false, active: true });
    expect(previewLights([A], [A, C], mix())).toEqual([A]);
  });

  it("lights removed in the editor are neither shown nor previewed", () => {
    expect(lightRows([A, B], [A], mix()).map((r) => r.id)).toEqual([A]);
    expect(previewLights([A, B], [A], mix())).toEqual([A]);
  });

  it("toggle and prune", () => {
    expect([...toggle(new Set([A]), A)]).toEqual([]);
    expect([...toggle(new Set([A]), B)]).toEqual([A, B]);
    const p = pruneMix(mix([A, B], [C]), [A]);
    expect([...p.muted]).toEqual([A]);
    expect(p.solo.size).toBe(0);
  });

  it("compares light sets ignoring order", () => {
    expect(sameLights([A, B], [B, A])).toBe(true);
    expect(sameLights([A], [A, B])).toBe(false);
  });
});
