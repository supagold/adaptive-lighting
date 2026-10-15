// Pure geometry for the day chart (SVG path strings), testable without a DOM.
import type { Sample } from "./types";
import { xForMinute, type Axis } from "./time";

export interface ChartBox extends Axis {
  height: number;
  padTop: number;
  padBottom: number;
}

export function yForPct(pct: number, box: ChartBox): number {
  const span = box.height - box.padTop - box.padBottom;
  const p = Math.min(Math.max(pct, 0), 100);
  return box.padTop + (1 - p / 100) * span;
}

/** SVG path for the brightness line. */
export function brightnessPath(samples: Sample[], box: ChartBox): string {
  return samples
    .map((s, i) => `${i ? "L" : "M"}${xForMinute(s.minute, box).toFixed(1)},${yForPct(s.brightness_pct, box).toFixed(1)}`)
    .join("");
}

/** Gradient stops for the colour strip: the light colour across the day. */
export function colorStops(samples: Sample[], every = 3): Array<{ offset: number; rgb: string }> {
  if (!samples.length) return [];
  const total = samples[samples.length - 1].minute || 1;
  const out = [];
  for (let i = 0; i < samples.length; i += every) {
    const s = samples[i];
    out.push({ offset: s.minute / total, rgb: `rgb(${s.rgb_color.join(",")})` });
  }
  const last = samples[samples.length - 1];
  if (out[out.length - 1].offset !== 1) out.push({ offset: 1, rgb: `rgb(${last.rgb_color.join(",")})` });
  return out;
}

/** Hour gridlines that exist on this day (handles 23/25 h days). */
export function hourTicks(total: number, step = 3): number[] {
  const ticks = [];
  for (let m = 0; m <= total; m += step * 60) ticks.push(m);
  return ticks;
}
