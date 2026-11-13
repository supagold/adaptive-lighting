// Schedule curve editing: the list of points a profile fades between (the `schedule` option, JSON
// text). Pure logic, no DOM. A point is a clock time ("08:00") or a sun anchor ("sunset+0:30").

export interface SchedulePoint {
  at: string;
  brightness: number;
  color_temp?: number;
}

export type At = { kind: "clock"; minutes: number } | { kind: "sun"; anchor: "sunrise" | "sunset"; offset: number };

export const SNAP_MIN = 5;
export const MAX_POINTS = 64;

export function parseAt(text: string): At | null {
  const v = text.trim().toLowerCase();
  let m = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(v);
  if (m) {
    const h = Number(m[1]);
    const mi = Number(m[2]);
    return h < 24 && mi < 60 ? { kind: "clock", minutes: h * 60 + mi } : null;
  }
  m = /^(sunrise|sunset)(?:([+-])(?:(\d{1,3})(m|h)|(\d{1,2}):(\d{2})))?$/.exec(v);
  if (!m) return null;
  let offset = 0;
  if (m[2]) {
    const amount = m[3] ? Number(m[3]) * (m[4] === "h" ? 60 : 1) : Number(m[5]) * 60 + Number(m[6]);
    offset = m[2] === "-" ? -amount : amount;
  }
  return { kind: "sun", anchor: m[1] as "sunrise" | "sunset", offset };
}

export function formatAt(at: At): string {
  if (at.kind === "clock") {
    const h = Math.floor(at.minutes / 60);
    return `${String(h).padStart(2, "0")}:${String(at.minutes % 60).padStart(2, "0")}`;
  }
  if (at.offset === 0) return at.anchor;
  const a = Math.abs(at.offset);
  return `${at.anchor}${at.offset > 0 ? "+" : "-"}${Math.floor(a / 60)}:${String(a % 60).padStart(2, "0")}`;
}

/** The option value ("None", "", null or JSON text) as points; null when no schedule is set. */
export function parseSchedule(value: unknown): SchedulePoint[] | null {
  if (typeof value !== "string" || !value.trim() || value.trim() === "None") return null;
  try {
    const raw = JSON.parse(value);
    if (!Array.isArray(raw)) return null;
    return raw.map((p) => ({ at: String(p.at), brightness: Number(p.brightness), ...(p.color_temp != null ? { color_temp: Number(p.color_temp) } : {}) }));
  } catch {
    return null;
  }
}

export function toOption(points: SchedulePoint[] | null): string {
  return points ? JSON.stringify(points.map((p) => ({ at: p.at, brightness: p.brightness, ...(p.color_temp != null ? { color_temp: p.color_temp } : {}) }))) : "None";
}

/** Minute of day a point sits at, given the day's sun times (minutes since midnight) for anchors. */
export function minuteOf(p: SchedulePoint, sun: { sunrise?: number; sunset?: number }): number {
  const at = parseAt(p.at);
  if (!at) return 0;
  if (at.kind === "clock") return at.minutes;
  return (sun[at.anchor] ?? (at.anchor === "sunrise" ? 360 : 1080)) + at.offset;
}

export function sortPoints(points: SchedulePoint[], sun: { sunrise?: number; sunset?: number }): SchedulePoint[] {
  return [...points].sort((a, b) => minuteOf(a, sun) - minuteOf(b, sun));
}

const clampPct = (n: number) => Math.min(Math.max(Math.round(n), 1), 100);

/** Move point `i` to `minute` (snapped). Clock points keep clock times; anchors change their offset. */
export function moveTime(points: SchedulePoint[], i: number, minute: number, sun: { sunrise?: number; sunset?: number }, step = SNAP_MIN): SchedulePoint[] {
  const at = parseAt(points[i].at);
  if (!at) return points;
  const snapped = Math.round(minute / step) * step;
  let next: string;
  if (at.kind === "sun") {
    const base = sun[at.anchor] ?? (at.anchor === "sunrise" ? 360 : 1080);
    next = formatAt({ kind: "sun", anchor: at.anchor, offset: snapped - Math.round(base) });
  } else {
    let m = Math.min(Math.max(snapped, 0), 1435);
    const taken = new Set(points.flatMap((p, j) => (j === i ? [] : [parseAt(p.at)])).flatMap((a) => (a && a.kind === "clock" ? [a.minutes] : [])));
    while (taken.has(m) && m < 1435) m += step;
    while (taken.has(m) && m > 0) m -= step;
    next = formatAt({ kind: "clock", minutes: m });
  }
  return points.map((p, j) => (j === i ? { ...p, at: next } : p));
}

export function setBrightness(points: SchedulePoint[], i: number, pct: number): SchedulePoint[] {
  return points.map((p, j) => (j === i ? { ...p, brightness: clampPct(pct) } : p));
}

export function setAt(points: SchedulePoint[], i: number, text: string): SchedulePoint[] {
  return parseAt(text) ? points.map((p, j) => (j === i ? { ...p, at: formatAt(parseAt(text)!) } : p)) : points;
}

export function setColorTemp(points: SchedulePoint[], i: number, kelvin: number | null): SchedulePoint[] {
  return points.map((p, j) => {
    if (j !== i) return p;
    const { color_temp: _drop, ...rest } = p;
    return kelvin == null ? rest : { ...rest, color_temp: Math.min(Math.max(Math.round(kelvin), 1000), 10000) };
  });
}

/** Add a clock point at `minute` (snapped, moved to a free slot) with brightness `pct`. */
export function addPoint(points: SchedulePoint[], minute: number, pct: number, step = SNAP_MIN): SchedulePoint[] {
  if (points.length >= MAX_POINTS) return points;
  const taken = new Set(points.flatMap((p) => { const a = parseAt(p.at); return a && a.kind === "clock" ? [a.minutes] : []; }));
  let m = Math.min(Math.max(Math.round(minute / step) * step, 0), 1435);
  while (taken.has(m) && m < 1435) m += step;
  while (taken.has(m) && m > 0) m -= step;
  return [...points, { at: formatAt({ kind: "clock", minutes: m }), brightness: clampPct(pct) }];
}

/** Remove point `i`; a schedule needs at least two points, so this is a no-op at two. */
export function removePoint(points: SchedulePoint[], i: number): SchedulePoint[] {
  return points.length <= 2 ? points : points.filter((_, j) => j !== i);
}

/** Starting schedule that approximates the current curve: its value every 6 hours (samples every N min). */
export function seedFromCurve(samples: Array<{ minute: number; brightness_pct: number; color_temp_kelvin: number }>): SchedulePoint[] {
  const at = (minute: number) => samples.reduce((best, s) => (Math.abs(s.minute - minute) < Math.abs(best.minute - minute) ? s : best), samples[0]);
  return [360, 720, 1080, 1320].map((m) => ({ at: formatAt({ kind: "clock", minutes: m }), brightness: clampPct(at(m).brightness_pct) }));
}

/** Plain-language description of a point's time for the tooltip, e.g. "sunset + 30 min". */
export function describeAt(text: string): string {
  const at = parseAt(text);
  if (!at || at.kind === "clock") return "";
  if (at.offset === 0) return at.anchor;
  return `${at.anchor} ${at.offset > 0 ? "+" : "−"} ${Math.abs(at.offset)} min`;
}

/** 12-hour clock text for a minute of the day, e.g. 1215 -> "8:15 PM". */
export function minuteLabel(minute: number): string {
  const m = ((Math.round(minute) % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m % 60).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

/** One-line summary of a schedule option value for the save dialog. */
export function scheduleSummary(value: unknown): string {
  const pts = parseSchedule(value);
  if (!pts) return "off (sunrise/sunset curve)";
  return pts.map((p) => `${p.at} ${p.brightness}%`).join(" · ");
}
