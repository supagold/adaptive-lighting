// Creating a new profile from the panel: HA's own config flow makes the (empty) entry,
// then the same options flow the panel already uses for editing sets lights and curve.
// If the options step fails, the half-made entry is deleted so no empty profile is left.

import { buildPayload, parseForm } from "./options";

type CallApi = <T>(method: string, path: string, body?: unknown) => Promise<T>;

interface FlowResult {
  type: string;
  flow_id?: string;
  step_id?: string;
  reason?: string;
  result?: string | { entry_id?: string };
  errors?: Record<string, string>;
}

export type CreateResult = { ok: true; entryId: string } | { ok: false; error: string };

const entryIdOf = (r: FlowResult): string | null =>
  typeof r.result === "string" ? r.result : (r.result?.entry_id ?? null);

/** Lights in `lights` that another profile (not `exceptEntryId`) already controls. */
export function sharedLights(
  profiles: { entry_id: string; title: string; lights: { entity_id: string }[] }[],
  lights: string[],
  exceptEntryId: string | null,
): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const p of profiles) {
    if (p.entry_id === exceptEntryId) continue;
    for (const l of p.lights) {
      if (lights.includes(l.entity_id)) (out[l.entity_id] ??= []).push(p.title);
    }
  }
  return out;
}

/** Create profile `name`, then save `values` (every option) into it. */
export async function createProfile(callApi: CallApi, name: string, values: Record<string, unknown>): Promise<CreateResult> {
  let flowId: string | null = null;
  let entryId: string | null = null;
  try {
    let step = await callApi<FlowResult>("POST", "config/config_entries/flow", { handler: "adaptive_lighting" });
    flowId = step.flow_id ?? null;
    if (step.type === "form" && step.step_id === "menu") step = await callApi<FlowResult>("POST", `config/config_entries/flow/${flowId}`, { action: "new" });
    if (step.type === "form" && step.step_id === "user") step = await callApi<FlowResult>("POST", `config/config_entries/flow/${flowId}`, { name });
    if (step.type === "abort") {
      flowId = null;
      return { ok: false, error: step.reason === "already_configured" ? `A profile named "${name}" already exists.` : `Home Assistant refused: ${step.reason}` };
    }
    if (step.type !== "create_entry") return { ok: false, error: `Unexpected step: ${step.type} ${step.step_id ?? ""}` };
    flowId = null; // finished
    entryId = entryIdOf(step);
    if (!entryId) return { ok: false, error: "Home Assistant did not return the new profile's id." };
  } catch (err) {
    if (flowId) await callApi("DELETE", `config/config_entries/flow/${flowId}`).catch(() => undefined);
    return { ok: false, error: `Could not create the profile: ${(err as Error).message ?? err}` };
  }

  let optionsFlow: string | null = null;
  try {
    const fresh = await callApi<{ flow_id: string; data_schema: never }>("POST", "config/config_entries/options/flow", { handler: entryId });
    optionsFlow = fresh.flow_id;
    const result = await callApi<{ type: string; errors?: Record<string, string> }>(
      "POST",
      `config/config_entries/options/flow/${optionsFlow}`,
      buildPayload(parseForm(fresh), values),
    );
    if (result.type !== "create_entry") throw new Error(`Home Assistant rejected the options: ${JSON.stringify(result.errors ?? result)}`);
    return { ok: true, entryId };
  } catch (err) {
    if (optionsFlow) await callApi("DELETE", `config/config_entries/options/flow/${optionsFlow}`).catch(() => undefined);
    await callApi("DELETE", `config/config_entries/entry/${entryId}`).catch(() => undefined);
    return { ok: false, error: `${(err as Error).message ?? err} The new profile was removed.` };
  }
}
