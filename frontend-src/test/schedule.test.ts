import { describe, expect, it } from "vitest";
import { addPoint, describeAt, formatAt, minuteOf, moveTime, parseAt, parseSchedule, removePoint, seedFromCurve, setAt, setBrightness, setColorTemp, sortPoints, toOption } from "../src/lib/schedule";
import { pctForY, yForPct, type ChartBox } from "../src/lib/chart";

const SUN = { sunrise: 420, sunset: 1000 };
const P = (at: string, brightness: number) => ({ at, brightness });

describe("at text", () => {
  it("parses clocks and anchors with offsets", () => {
    expect(parseAt("08:05")).toEqual({ kind: "clock", minutes: 485 });
    expect(parseAt("sunset")).toEqual({ kind: "sun", anchor: "sunset", offset: 0 });
    expect(parseAt("sunset+30m")).toEqual({ kind: "sun", anchor: "sunset", offset: 30 });
    expect(parseAt("sunrise-1h")).toEqual({ kind: "sun", anchor: "sunrise", offset: -60 });
    expect(parseAt("sunset+1:30")).toEqual({ kind: "sun", anchor: "sunset", offset: 90 });
    expect(parseAt("25:00")).toBeNull();
    expect(parseAt("noon")).toBeNull();
  });
  it("formats the way the backend canonicalises", () => {
    expect(formatAt({ kind: "clock", minutes: 485 })).toBe("08:05");
    expect(formatAt({ kind: "sun", anchor: "sunset", offset: 30 })).toBe("sunset+0:30");
    expect(formatAt({ kind: "sun", anchor: "sunrise", offset: -90 })).toBe("sunrise-1:30");
    expect(formatAt({ kind: "sun", anchor: "sunrise", offset: 0 })).toBe("sunrise");
  });
  it("describes anchors for the tooltip", () => {
    expect(describeAt("sunset+0:30")).toBe("sunset + 30 min");
    expect(describeAt("sunrise")).toBe("sunrise");
    expect(describeAt("08:00")).toBe("");
  });
});

describe("option value", () => {
  it("None / empty / bad JSON means no schedule", () => {
    expect(parseSchedule("None")).toBeNull();
    expect(parseSchedule("")).toBeNull();
    expect(parseSchedule("nope")).toBeNull();
    expect(parseSchedule(undefined)).toBeNull();
  });
  it("round-trips", () => {
    const pts = [P("08:00", 100), { ...P("21:30", 10), color_temp: 2200 }];
    expect(parseSchedule(toOption(pts))).toEqual(pts);
    expect(toOption(null)).toBe("None");
  });
});

describe("editing", () => {
  const base = [P("08:00", 100), P("18:00", 50), P("21:30", 10)];
  it("moves a clock point in 5-minute steps and avoids another point's time", () => {
    expect(moveTime(base, 0, 487, SUN)[0].at).toBe("08:05");
    expect(moveTime(base, 0, 18 * 60 + 2, SUN)[0].at).toBe("18:05"); // 18:00 is taken -> nearest free slot
    expect(moveTime(base, 0, 99999, SUN)[0].at).toBe("23:55");
  });
  it("moving an anchor changes its offset, not its anchor", () => {
    const pts = [P("sunset", 50), P("06:00", 10)];
    expect(moveTime(pts, 0, 1000 + 45, SUN)[0].at).toBe("sunset+0:45");
    expect(moveTime(pts, 0, 1000 - 20, SUN)[0].at).toBe("sunset-0:20");
    expect(moveTime(pts, 0, 1000, SUN)[0].at).toBe("sunset");
  });
  it("sets brightness within 1-100", () => {
    expect(setBrightness(base, 1, 0)[1].brightness).toBe(1);
    expect(setBrightness(base, 1, 250)[1].brightness).toBe(100);
    expect(setBrightness(base, 1, 42.4)[1].brightness).toBe(42);
  });
  it("setAt accepts valid text only", () => {
    expect(setAt(base, 0, "sunrise+30m")[0].at).toBe("sunrise+0:30");
    expect(setAt(base, 0, "garbage")).toBe(base);
  });
  it("colour temp is optional and bounded", () => {
    const withCt = setColorTemp(base, 0, 99999);
    expect(withCt[0].color_temp).toBe(10000);
    expect("color_temp" in setColorTemp(withCt, 0, null)[0]).toBe(false);
  });
  it("adds into a free slot; removal keeps at least two", () => {
    expect(addPoint(base, 8 * 60, 70).at(-1)).toEqual({ at: "08:05", brightness: 70 });
    expect(removePoint(base, 0)).toHaveLength(2);
    expect(removePoint(removePoint(base, 0), 0)).toHaveLength(2);
  });
  it("sorts by effective minute, anchors included", () => {
    const pts = [P("sunset+0:30", 5), P("06:00", 1), P("sunrise", 2)];
    expect(sortPoints(pts, SUN).map((p) => p.at)).toEqual(["06:00", "sunrise", "sunset+0:30"]);
    expect(minuteOf(P("sunset+0:30", 5), SUN)).toBe(1030);
  });
  it("seeds from the current curve", () => {
    const samples = Array.from({ length: 289 }, (_, i) => ({ minute: i * 5, brightness_pct: i * 5 < 600 ? 10 : 80, color_temp_kelvin: 3000 }));
    expect(seedFromCurve(samples)).toEqual([P("06:00", 10), P("12:00", 80), P("18:00", 80), P("22:00", 80)]);
  });
});

describe("chart y inverse", () => {
  const box = { totalMinutes: 1440, width: 1000, height: 300, padLeft: 44, padRight: 24, padTop: 14, padBottom: 58 } as ChartBox;
  it("inverts yForPct", () => {
    for (const p of [1, 10, 50, 100]) expect(pctForY(yForPct(p, box), box)).toBe(p);
    expect(pctForY(-500, box)).toBe(100);
    expect(pctForY(9999, box)).toBe(1);
  });
});
