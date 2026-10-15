// Mapping between minutes-of-day and chart x positions, and sample lookup.
import type { Sample } from "./types";

export interface Axis {
  totalMinutes: number; // 1440, or 1380 / 1500 on DST change days
  width: number;
  padLeft: number;
  padRight: number;
}

export function totalMinutes(samples: Sample[]): number {
  return samples.length ? samples[samples.length - 1].minute : 1440;
}

export function xForMinute(minute: number, axis: Axis): number {
  const span = axis.width - axis.padLeft - axis.padRight;
  const m = Math.min(Math.max(minute, 0), axis.totalMinutes);
  return axis.padLeft + (m / axis.totalMinutes) * span;
}

export function minuteForX(x: number, axis: Axis): number {
  const span = axis.width - axis.padLeft - axis.padRight;
  const frac = (x - axis.padLeft) / span;
  return Math.min(Math.max(frac, 0), 1) * axis.totalMinutes;
}

/** Index of the sample closest to `minute` (samples sorted by minute). */
export function nearestIndex(samples: Sample[], minute: number): number {
  if (!samples.length) return -1;
  let lo = 0;
  let hi = samples.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (samples[mid].minute < minute) lo = mid + 1;
    else hi = mid;
  }
  if (lo > 0 && minute - samples[lo - 1].minute <= samples[lo].minute - minute) return lo - 1;
  return lo;
}

/** "HH:MM" wall-clock text of a local ISO timestamp, as HA reported it. */
export function clockText(iso: string): string {
  return iso.slice(11, 16);
}

/** Local ISO timestamp for `minute` on the curve's day, using the nearest sample's offset. */
export function isoForMinute(samples: Sample[], minute: number): string {
  const i = nearestIndex(samples, minute);
  if (i < 0) throw new Error("no samples");
  const base = samples[i];
  const ms = Date.parse(base.t) + (minute - base.minute) * 60_000;
  // Keep the local offset of the nearest sample so HA interprets it in its own zone.
  const offset = base.t.slice(19); // e.g. "-04:00"
  const offMin = offsetMinutes(offset);
  const local = new Date(ms + offMin * 60_000).toISOString().slice(0, 19);
  return local + offset;
}

function offsetMinutes(offset: string): number {
  const m = /^([+-])(\d{2}):(\d{2})$/.exec(offset);
  if (!m) return 0;
  const sign = m[1] === "-" ? -1 : 1;
  return sign * (parseInt(m[2], 10) * 60 + parseInt(m[3], 10));
}

/** Round to the sample grid (default 5 min), for taps/drags; playback stays continuous. */
export function snap(minute: number, step = 5): number {
  return Math.round(minute / step) * step;
}
