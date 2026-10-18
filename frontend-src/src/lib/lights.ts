// The panel's light list: which lights a profile has (saved vs. being edited) and
// which ones the preview drives (mute/solo). Mute/solo is preview-only state: it is
// never saved and does not change how Adaptive Lighting runs the lights.

export interface Mix {
  muted: ReadonlySet<string>;
  solo: ReadonlySet<string>;
}

export const emptyMix = (): Mix => ({ muted: new Set(), solo: new Set() });

export type LightStatus = "active" | "solo" | "muted" | "not-soloed";

export interface LightRow {
  id: string;
  saved: boolean; // in the saved profile; only these can be previewed on the real light
  status: LightStatus;
  active: boolean; // driven by the swatches and the real-light preview
}

/** A `lights` option value (array, or the text-box fallback's comma list) as ids. */
export function asLightList(value: unknown): string[] {
  const raw = Array.isArray(value) ? value : typeof value === "string" ? value.split(",") : [];
  const out: string[] = [];
  for (const v of raw) {
    const id = String(v).trim();
    if (id && !out.includes(id)) out.push(id);
  }
  return out;
}

/** Solo wins: while anything is soloed, only soloed lights play, muted or not. */
export function lightStatus(id: string, mix: Mix): LightStatus {
  if (mix.solo.size) return mix.solo.has(id) ? "solo" : "not-soloed";
  return mix.muted.has(id) ? "muted" : "active";
}

export function toggle(set: ReadonlySet<string>, id: string): Set<string> {
  const next = new Set(set);
  if (!next.delete(id)) next.add(id);
  return next;
}

/** Forget mute/solo for lights that are no longer in the list. */
export function pruneMix(mix: Mix, lights: string[]): Mix {
  const keep = (s: ReadonlySet<string>) => new Set([...s].filter((id) => lights.includes(id)));
  return { muted: keep(mix.muted), solo: keep(mix.solo) };
}

export function lightRows(saved: string[], effective: string[], mix: Mix): LightRow[] {
  return effective.map((id) => {
    const status = lightStatus(id, mix);
    return { id, saved: saved.includes(id), status, active: status === "active" || status === "solo" };
  });
}

/** Lights the real-light preview should drive: active, shown, and in the saved profile. */
export function previewLights(saved: string[], effective: string[], mix: Mix): string[] {
  return lightRows(saved, effective, mix)
    .filter((r) => r.active && r.saved)
    .map((r) => r.id);
}

export function sameLights(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((id) => b.includes(id));
}
