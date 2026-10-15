// The options form: parsed from HA's own options flow (same source as the HA UI and
// scripts/al_options.py), edited locally, diffed, and nested back for submit.

export interface Field {
  name: string;
  section: string | null; // null = top level, else e.g. "advanced"
  kind: "boolean" | "integer" | "float" | "string" | "select" | "entity" | "color_rgb";
  min?: number;
  max?: number;
  options?: string[];
  value: unknown; // current saved value (the form's default)
}

export interface Form {
  flowId: string;
  sections: string[];
  fields: Field[];
}

interface SchemaItem {
  name: string;
  type?: string;
  valueMin?: number;
  valueMax?: number;
  default?: unknown;
  selector?: Record<string, { options?: string[] }>;
  schema?: SchemaItem[];
}

function toField(item: SchemaItem, section: string | null): Field {
  let kind: Field["kind"] = "string";
  let options: string[] | undefined;
  if (item.selector) {
    const key = Object.keys(item.selector)[0];
    if (key === "select") {
      kind = "select";
      options = item.selector.select.options;
    } else if (key === "entity") kind = "entity";
    else if (key === "color_rgb") kind = "color_rgb";
  } else if (item.type === "boolean" || item.type === "integer" || item.type === "float") {
    kind = item.type;
  }
  return { name: item.name, section, kind, min: item.valueMin, max: item.valueMax, options, value: item.default };
}

export function parseForm(flow: { flow_id: string; data_schema: SchemaItem[] | null }): Form {
  if (!flow.data_schema) throw new Error("This profile has no editable options (YAML-configured?)");
  const form: Form = { flowId: flow.flow_id, sections: [], fields: [] };
  for (const item of flow.data_schema) {
    if (item.type === "expandable") {
      form.sections.push(item.name);
      for (const sub of item.schema ?? []) form.fields.push(toField(sub, item.name));
    } else {
      form.fields.push(toField(item, null));
    }
  }
  return form;
}

export function savedValues(form: Form): Record<string, unknown> {
  return Object.fromEntries(form.fields.map((f) => [f.name, f.value]));
}

function same(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/** Fields whose edited value differs from the saved one. */
export function changes(saved: Record<string, unknown>, edited: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(edited)) if (!same(saved[k], v)) out[k] = v;
  return out;
}

/** Full submit payload: every field, advanced ones nested under their section. */
export function buildPayload(form: Form, values: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = Object.fromEntries(form.sections.map((s) => [s, {}]));
  for (const f of form.fields) {
    const v = f.name in values ? values[f.name] : f.value;
    if (f.section) (out[f.section] as Record<string, unknown>)[f.name] = v;
    else out[f.name] = v;
  }
  return out;
}

/** Turn an input's text into the field's type; returns [value, error]. */
export function coerce(f: Field, raw: string | boolean): [unknown, string | null] {
  if (f.kind === "boolean") return [Boolean(raw), null];
  const text = String(raw).trim();
  if (f.kind === "integer" || f.kind === "float") {
    if (text === "") return [null, "required"];
    const n = f.kind === "integer" ? Number(text) : parseFloat(text);
    if (!Number.isFinite(n) || (f.kind === "integer" && !Number.isInteger(n))) return [text, `expected ${f.kind === "integer" ? "a whole number" : "a number"}`];
    if (f.min !== undefined && n < f.min) return [n, `minimum ${f.min}`];
    if (f.max !== undefined && n > f.max) return [n, `maximum ${f.max}`];
    return [n, null];
  }
  if (f.kind === "select") return f.options?.includes(text) ? [text, null] : [text, "not an allowed value"];
  if (f.kind === "entity") return [text.split(",").map((s) => s.trim()).filter(Boolean), null];
  if (f.kind === "color_rgb") {
    const parts = text.split(",").map((s) => Number(s.trim()));
    if (parts.length !== 3 || parts.some((p) => !Number.isInteger(p) || p < 0 || p > 255)) return [text, "expected R,G,B (0-255)"];
    return [parts, null];
  }
  return [text, null]; // times like 19:30, or None
}

/** Human text for a value in the diff view. */
export function show(v: unknown): string {
  if (v === null || v === undefined) return "—";
  if (Array.isArray(v)) return v.join(", ");
  return String(v);
}
