import { describe, expect, it } from "vitest";
import { createProfile, sharedLights } from "../src/lib/create";

const SCHEMA = [
  { name: "lights", selector: { entity: {} }, default: [] },
  { name: "min_brightness", type: "integer", default: 1 },
  { type: "expandable", name: "advanced", schema: [{ name: "interval", type: "integer", default: 90 }] },
];

type Call = [string, string, unknown?];

function fake(script: Record<string, unknown | ((b: unknown) => unknown)>) {
  const calls: Call[] = [];
  const api = async <T,>(method: string, path: string, body?: unknown): Promise<T> => {
    calls.push([method, path, body]);
    const hit = script[`${method} ${path}`];
    if (hit === undefined) throw new Error(`unexpected ${method} ${path}`);
    const out = typeof hit === "function" ? (hit as (b: unknown) => unknown)(body) : hit;
    if (out instanceof Error) throw out;
    return out as T;
  };
  return { api, calls };
}

const CREATE_OK = {
  "POST config/config_entries/flow": { type: "form", step_id: "menu", flow_id: "f1" },
  "POST config/config_entries/flow/f1": (b: unknown) =>
    (b as { action?: string }).action ? { type: "form", step_id: "user", flow_id: "f1" } : { type: "create_entry", result: "NEW1" },
  "POST config/config_entries/options/flow": { flow_id: "o1", data_schema: SCHEMA },
};

describe("create profile", () => {
  it("creates the entry, then saves every option with advanced nested", async () => {
    const { api, calls } = fake({
      ...CREATE_OK,
      "POST config/config_entries/options/flow/o1": { type: "create_entry" },
    });
    const res = await createProfile(api, "Hall", { lights: ["light.a"], min_brightness: 20, interval: 90 });
    expect(res).toEqual({ ok: true, entryId: "NEW1" });
    expect(calls[1][2]).toEqual({ action: "new" });
    expect(calls[2][2]).toEqual({ name: "Hall" });
    expect(calls[4][2]).toEqual({ lights: ["light.a"], min_brightness: 20, advanced: { interval: 90 } });
    expect(calls.some((c) => c[0] === "DELETE")).toBe(false);
  });

  it("goes straight to the name step when there is no menu", async () => {
    const { api, calls } = fake({
      "POST config/config_entries/flow": { type: "form", step_id: "user", flow_id: "f1" },
      "POST config/config_entries/flow/f1": { type: "create_entry", result: { entry_id: "NEW2" } },
      "POST config/config_entries/options/flow": { flow_id: "o1", data_schema: SCHEMA },
      "POST config/config_entries/options/flow/o1": { type: "create_entry" },
    });
    expect(await createProfile(api, "X", {})).toEqual({ ok: true, entryId: "NEW2" });
    expect(calls[1][2]).toEqual({ name: "X" });
  });

  it("reports a duplicate name and creates nothing", async () => {
    const { api, calls } = fake({
      "POST config/config_entries/flow": { type: "form", step_id: "menu", flow_id: "f1" },
      "POST config/config_entries/flow/f1": (b: unknown) =>
        (b as { action?: string }).action ? { type: "form", step_id: "user", flow_id: "f1" } : { type: "abort", reason: "already_configured" },
    });
    const res = await createProfile(api, "Hall", {});
    expect(res).toEqual({ ok: false, error: 'A profile named "Hall" already exists.' });
    expect(calls.some((c) => c[0] === "DELETE")).toBe(false);
  });

  it("deletes the half-made entry when the options step is rejected", async () => {
    const { api, calls } = fake({
      ...CREATE_OK,
      "POST config/config_entries/options/flow/o1": { type: "form", errors: { min_brightness: "bad" } },
      "DELETE config/config_entries/options/flow/o1": {},
      "DELETE config/config_entries/entry/NEW1": {},
    });
    const res = await createProfile(api, "Hall", {});
    expect(res.ok).toBe(false);
    expect(res.ok === false && res.error).toContain("The new profile was removed.");
    expect(calls.map((c) => `${c[0]} ${c[1]}`)).toContain("DELETE config/config_entries/entry/NEW1");
  });

  it("still reports failure if the cleanup delete also fails", async () => {
    const { api } = fake({
      ...CREATE_OK,
      "POST config/config_entries/options/flow/o1": new Error("boom"),
    });
    const res = await createProfile(api, "Hall", {});
    expect(res.ok).toBe(false);
  });
});

describe("shared lights", () => {
  const profiles = [
    { entry_id: "a", title: "Great Room", lights: [{ entity_id: "light.x" }, { entity_id: "light.y" }] },
    { entry_id: "b", title: "Bonus", lights: [{ entity_id: "light.y" }] },
  ];
  it("lists lights another profile controls", () => {
    expect(sharedLights(profiles, ["light.y", "light.z"], null)).toEqual({ "light.y": ["Great Room", "Bonus"] });
  });
  it("ignores the profile being edited", () => {
    expect(sharedLights(profiles, ["light.y"], "a")).toEqual({ "light.y": ["Bonus"] });
  });
});
