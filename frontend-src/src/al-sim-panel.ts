// Adaptive Lighting simulator panel (homeops fork).
//
// Everything numeric comes from the integration via websocket (adaptive_lighting/sim/*):
// this file draws and edits, it never computes the curve itself. Options are read from
// and saved through HA's own options flow, like the Settings UI.
//
// Accessibility: Charlie is colourblind. Nothing is encoded red/green: state is shown with
// text and the theme's primary colour; warnings use the theme's warning (amber) colour.

import { LitElement, css, html, nothing, svg, type PropertyValues } from "lit";
import type { Curve, Errors, PerLight, Point, Profile } from "./lib/types";
import { clock12, hourLabel12, isoForMinute, minuteForX, nearestIndex, snap, totalMinutes, xForMinute } from "./lib/time";
import { brightnessPath, colorStops, hourTicks, yForPct, type ChartBox } from "./lib/chart";
import { LatestThrottle, Playback } from "./lib/playback";
import { buildPayload, changes, coerce, parseForm, savedValues, show, type Field, type Form } from "./lib/options";

interface Hass {
  connection: {
    sendMessagePromise<T>(msg: Record<string, unknown>): Promise<T>;
    subscribeMessage<T>(cb: (msg: T) => void, msg: Record<string, unknown>): Promise<() => Promise<void>>;
  };
  callApi<T>(method: string, path: string, body?: unknown): Promise<T>;
}

type PreviewState = "off" | "starting" | "active";

const BOX: ChartBox = { totalMinutes: 1440, width: 1000, height: 300, padLeft: 44, padRight: 24, padTop: 14, padBottom: 58 };
const STRIP_H = 18;
const DURATIONS = [15, 30, 60, 120];
const SUN_LABELS: Record<string, string> = { sunrise: "sunrise", sunset: "sunset", solar_noon: "noon", solar_midnight: "midnight" };

export class AlSimPanel extends LitElement {
  static properties = {
    hass: { attribute: false },
    narrow: { type: Boolean },
    profiles: { state: true },
    selected: { state: true },
    form: { state: true },
    edited: { state: true },
    fieldErrors: { state: true },
    serverErrors: { state: true },
    curve: { state: true },
    date: { state: true },
    sleep: { state: true },
    minute: { state: true },
    playing: { state: true },
    duration: { state: true },
    point: { state: true },
    preview: { state: true },
    message: { state: true },
    confirming: { state: true },
    busy: { state: true },
    chartWidth: { state: true },
  };

  declare hass: Hass;
  declare narrow: boolean;
  declare profiles: Profile[];
  declare selected: string;
  declare form: Form | null;
  declare edited: Record<string, unknown>;
  declare fieldErrors: Errors;
  declare serverErrors: Errors;
  declare curve: Curve | null;
  declare date: string;
  declare sleep: boolean;
  declare minute: number;
  declare playing: boolean;
  declare duration: number;
  declare point: Point | null;
  declare preview: PreviewState;
  declare message: string;
  declare confirming: boolean;
  declare busy: boolean;
  declare chartWidth: number;

  private playback: Playback;
  private curveTimer: ReturnType<typeof setTimeout> | null = null;
  private pointTimer: ReturnType<typeof setTimeout> | null = null;
  private unsubPreview: (() => Promise<void>) | null = null;
  private previewSender: LatestThrottle<string>;
  private loaded = false;
  private resize = new ResizeObserver((entries) => {
    // Draw the chart at its real pixel width so text stays ~12px on phones.
    const w = Math.round(entries[0].contentRect.width);
    if (w > 0 && Math.abs(w - this.chartWidth) > 4) this.chartWidth = Math.min(Math.max(w, 300), 1400);
  });

  constructor() {
    super();
    this.profiles = [];
    this.selected = "";
    this.form = null;
    this.edited = {};
    this.fieldErrors = {};
    this.serverErrors = {};
    this.curve = null;
    this.date = "";
    this.sleep = false;
    this.minute = 12 * 60;
    this.playing = false;
    this.duration = 30;
    this.point = null;
    this.preview = "off";
    this.message = "";
    this.confirming = false;
    this.busy = false;
    this.chartWidth = 1000;
    this.playback = new Playback(1440, 30_000, (m, playing) => {
      this.minute = m;
      this.playing = playing;
      this.schedulePoint(playing ? 120 : 0);
    });
    this.playback.minute = this.minute; // start where the panel's playhead is (12:00)
    this.previewSender = new LatestThrottle<string>(1000, (at) => void this.sendPreview(at));
  }

  // ------------------------------------------------------------- lifecycle
  protected updated(changed: PropertyValues): void {
    if (changed.has("hass") && this.hass && !this.loaded) {
      this.loaded = true;
      void this.loadProfiles();
    }
  }

  protected firstUpdated(): void {
    const card = this.renderRoot.querySelector(".chartcard");
    if (card) this.resize.observe(card);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.resize.disconnect();
    this.playback.pause();
    void this.stopPreview();
  }

  private ws<T>(msg: Record<string, unknown>): Promise<T> {
    return this.hass.connection.sendMessagePromise<T>(msg);
  }

  // ---------------------------------------------------------------- loading
  private async loadProfiles(keepSelection = false): Promise<void> {
    try {
      const res = await this.ws<{ profiles: Profile[] }>({ type: "adaptive_lighting/sim/profiles" });
      this.profiles = res.profiles;
      const still = keepSelection && this.profiles.some((p) => p.entry_id === this.selected);
      const first = this.profiles.find((p) => p.lights.length) ?? this.profiles[0];
      if (!still && first) await this.selectProfile(first.entry_id);
      else if (still) await this.selectProfile(this.selected);
    } catch (err) {
      this.message = `Could not load profiles: ${(err as Error).message ?? err}`;
    }
  }

  private async selectProfile(entryId: string): Promise<void> {
    await this.stopPreview();
    this.playback.pause();
    this.selected = entryId;
    this.edited = {};
    this.fieldErrors = {};
    this.serverErrors = {};
    this.confirming = false;
    this.form = await this.readForm(entryId);
    await this.refreshCurve();
  }

  /** Read the options form (types, limits, current values) and close the flow again. */
  private async readForm(entryId: string): Promise<Form | null> {
    let flowId: string | null = null;
    try {
      const flow = await this.hass.callApi<{ flow_id: string; data_schema: never }>("POST", "config/config_entries/options/flow", { handler: entryId });
      flowId = flow.flow_id;
      return parseForm(flow);
    } catch (err) {
      this.message = `Could not read options: ${(err as Error).message ?? err}`;
      return null;
    } finally {
      if (flowId) await this.hass.callApi("DELETE", `config/config_entries/options/flow/${flowId}`).catch(() => undefined);
    }
  }

  private get overrides(): Record<string, unknown> {
    return this.form ? changes(savedValues(this.form), this.edited) : {};
  }

  private async refreshCurve(): Promise<void> {
    if (!this.selected) return;
    const msg: Record<string, unknown> = {
      type: "adaptive_lighting/sim/curve",
      entry_id: this.selected,
      overrides: this.overrides,
      sleep: this.sleep,
    };
    if (this.date) msg.date = this.date;
    const res = await this.ws<Curve & { errors?: Errors }>(msg);
    if (res.errors) {
      this.serverErrors = res.errors;
      return;
    }
    this.serverErrors = {};
    this.curve = res;
    this.date = res.date;
    const total = totalMinutes(res.samples);
    this.playback.totalMinutes = total;
    if (this.minute > total) this.minute = total;
    this.schedulePoint(0);
  }

  private scheduleCurve(): void {
    if (this.curveTimer) clearTimeout(this.curveTimer);
    this.curveTimer = setTimeout(() => void this.refreshCurve(), 250);
  }

  private schedulePoint(delay: number): void {
    if (this.pointTimer) return;
    this.pointTimer = setTimeout(() => {
      this.pointTimer = null;
      void this.refreshPoint();
    }, delay);
  }

  private async refreshPoint(): Promise<void> {
    if (!this.curve?.samples.length) return;
    const at = isoForMinute(this.curve.samples, this.minute);
    const res = await this.ws<Point & { errors?: Errors }>({
      type: "adaptive_lighting/sim/point",
      entry_id: this.selected,
      overrides: this.overrides,
      at,
      sleep: this.sleep,
    });
    if (!res.errors) this.point = res;
    if (this.preview === "active") this.previewSender.push(at);
  }

  // ---------------------------------------------------------------- preview
  private async togglePreview(): Promise<void> {
    if (this.preview === "off") await this.startPreview();
    else await this.stopPreview();
  }

  private async startPreview(): Promise<void> {
    this.preview = "starting";
    try {
      this.unsubPreview = await this.hass.connection.subscribeMessage<{ status: string; reason?: string }>(
        (ev) => {
          if (ev.status === "active") {
            this.preview = "active";
            this.schedulePoint(0);
          } else if (ev.status === "ended") {
            this.preview = "off";
            this.unsubPreview = null;
            this.previewSender.cancel();
            this.message = ev.reason === "timeout" ? "Preview timed out; lights are back to normal." : `Preview ended (${ev.reason}).`;
          }
        },
        { type: "adaptive_lighting/sim/preview", entry_id: this.selected, timeout_s: 600 },
      );
    } catch (err) {
      this.preview = "off";
      this.message = `Couldn't start preview: ${(err as Error).message ?? err}`;
    }
  }

  private async stopPreview(): Promise<void> {
    this.previewSender.cancel();
    const unsub = this.unsubPreview;
    this.unsubPreview = null;
    this.preview = "off";
    if (unsub) await unsub().catch(() => undefined);
  }

  private async sendPreview(at: string): Promise<void> {
    if (this.preview !== "active") return;
    await this.ws({
      type: "adaptive_lighting/sim/preview/set",
      entry_id: this.selected,
      overrides: this.overrides,
      at,
      sleep: this.sleep,
      transition_s: 1,
    }).catch(() => undefined);
  }

  // ---------------------------------------------------------------- editing
  private onField(f: Field, raw: string | boolean): void {
    const [value, error] = coerce(f, raw);
    const errors = { ...this.fieldErrors };
    if (error) errors[f.name] = error;
    else delete errors[f.name];
    this.fieldErrors = errors;
    if (!error) {
      this.edited = { ...this.edited, [f.name]: value };
      this.scheduleCurve();
    }
  }

  private discard(): void {
    this.edited = {};
    this.fieldErrors = {};
    this.confirming = false;
    this.scheduleCurve();
  }

  private async apply(): Promise<void> {
    if (!this.form) return;
    const pending = this.overrides;
    this.busy = true;
    let flowId: string | null = null;
    let done = false;
    try {
      const fresh = await this.hass.callApi<{ flow_id: string; data_schema: never }>("POST", "config/config_entries/options/flow", { handler: this.selected });
      flowId = fresh.flow_id;
      const freshForm = parseForm(fresh);
      const before = savedValues(this.form);
      const now = savedValues(freshForm);
      const moved = Object.keys(now).filter((k) => !(k in pending) && JSON.stringify(now[k]) !== JSON.stringify(before[k]));
      if (moved.length) {
        this.message = `This profile was changed elsewhere since you opened it (${moved.join(", ")}). Reload before saving.`;
        return;
      }
      const result = await this.hass.callApi<{ type: string; errors?: Errors }>(
        "POST",
        `config/config_entries/options/flow/${flowId}`,
        buildPayload(freshForm, { ...now, ...pending }),
      );
      if (result.type !== "create_entry") {
        this.message = `Home Assistant rejected the options: ${JSON.stringify(result.errors ?? result)}`;
        return;
      }
      done = true;
      this.message = `Saved ${Object.keys(pending).length} change(s) to ${this.profileTitle}.`;
      this.confirming = false;
      await this.loadProfiles(true);
    } catch (err) {
      this.message = `Save failed: ${(err as Error).message ?? err}`;
    } finally {
      if (flowId && !done) await this.hass.callApi("DELETE", `config/config_entries/options/flow/${flowId}`).catch(() => undefined);
      this.busy = false;
    }
  }

  private get profileTitle(): string {
    return this.profiles.find((p) => p.entry_id === this.selected)?.title ?? "";
  }

  // ------------------------------------------------------------------ chart
  private onChartPointer(ev: PointerEvent): void {
    if (ev.type === "pointermove" && ev.buttons === 0) return;
    const svgEl = ev.currentTarget as SVGSVGElement;
    const rect = svgEl.getBoundingClientRect();
    const box = this.box(this.playback.totalMinutes);
    const x = ((ev.clientX - rect.left) / rect.width) * box.width;
    this.playback.seek(snap(minuteForX(x, box)));
    if (ev.type === "pointerdown") svgEl.setPointerCapture(ev.pointerId);
  }

  private onChartKey(ev: KeyboardEvent): void {
    const step = ev.shiftKey ? 60 : 15;
    if (ev.key === "ArrowRight") this.playback.seek(this.minute + step);
    else if (ev.key === "ArrowLeft") this.playback.seek(this.minute - step);
    else if (ev.key === " ") this.playback.toggle();
    else return;
    ev.preventDefault();
  }

  private box(total: number): ChartBox {
    const narrow = this.chartWidth < 600;
    return { ...BOX, width: this.chartWidth, height: narrow ? 240 : BOX.height, totalMinutes: total };
  }

  private renderChart() {
    const samples = this.curve?.samples ?? [];
    const box = this.box(totalMinutes(samples));
    const narrow = box.width < 600;
    const profile = this.profiles.find((p) => p.entry_id === this.selected);
    const anyColour = (profile?.lights ?? []).some((l) => l.features?.includes("color") || l.features?.includes("color_temp"));
    const stripY = box.height - box.padBottom + 22;
    const idx = nearestIndex(samples, this.minute);
    const cur = idx >= 0 ? samples[idx] : null;
    const px = xForMinute(this.minute, box);
    const stops = colorStops(samples);
    const sun = Object.entries(this.curve?.sun ?? {});
    const dayStart = samples.length ? Date.parse(samples[0].t) : 0;
    // Exact time at the playhead (not snapped to the 5-min samples), for the tooltip.
    const playheadIso = samples.length ? isoForMinute(samples, Math.round(this.minute)) : "";
    return html`
      <svg
        class="chart"
        viewBox="0 0 ${box.width} ${box.height}"
        role="slider"
        tabindex="0"
        aria-label="Time of day. Arrow keys move 15 minutes, space plays."
        aria-valuemin="0"
        aria-valuemax=${box.totalMinutes}
        aria-valuenow=${Math.round(this.minute)}
        aria-valuetext=${playheadIso ? clock12(playheadIso) : ""}
        @pointerdown=${this.onChartPointer}
        @pointermove=${this.onChartPointer}
        @keydown=${this.onChartKey}
      >
        <defs>
          <linearGradient id="ct" x1="0" x2="1">
            ${stops.map((s) => svg`<stop offset=${s.offset} stop-color=${s.rgb}></stop>`)}
          </linearGradient>
        </defs>
        ${[0, 25, 50, 75, 100].map(
          (p) => svg`
            <line class="grid" x1=${box.padLeft} x2=${box.width - box.padRight} y1=${yForPct(p, box)} y2=${yForPct(p, box)}></line>
            <text class="axis" x=${box.padLeft - 6} y=${yForPct(p, box) + 4} text-anchor="end">${p}%</text>`,
        )}
        ${hourTicks(box.totalMinutes, narrow ? 6 : 3).map(
          (m) => svg`
            <line class="grid" x1=${xForMinute(m, box)} x2=${xForMinute(m, box)} y1=${box.padTop} y2=${box.height - box.padBottom}></line>
            <text class="axis" x=${xForMinute(m, box)} y=${box.height - box.padBottom + 14} text-anchor="middle">${samples.length ? hourLabel12(samples[nearestIndex(samples, m)].t, narrow) : ""}</text>`,
        )}
        ${sun.map(([name, iso]) => {
          const m = (Date.parse(iso) - dayStart) / 60_000;
          if (m < 0 || m > box.totalMinutes) return nothing;
          const x = xForMinute(m, box);
          return svg`
            <line class="sun" x1=${x} x2=${x} y1=${box.padTop} y2=${box.height - box.padBottom}></line>
            ${narrow && (name === "solar_noon" || name === "solar_midnight") ? nothing : svg`<text class="sunlabel" x=${x + 3} y=${box.padTop + 10}>${narrow ? "" : `${SUN_LABELS[name] ?? name} `}${clock12(iso)}</text>`}`;
        })}
        <path class="line" d=${brightnessPath(samples, box)}></path>
        <rect x=${box.padLeft} y=${stripY} width=${box.width - box.padLeft - box.padRight} height=${STRIP_H} rx="3" fill="url(#ct)" opacity=${anyColour ? 1 : 0.25}></rect>
        <text class="axis" x=${box.padLeft - 6} y=${stripY + 13} text-anchor="end">colour</text>
        ${anyColour ? nothing : svg`<text class="axis" x=${box.padLeft + 8} y=${stripY + 13}>not used: these lights are dimmer-only</text>`}
        <line class="playhead" x1=${px} x2=${px} y1=${box.padTop} y2=${stripY + STRIP_H}></line>
        ${cur ? svg`<circle class="dot" cx=${px} cy=${yForPct(cur.brightness_pct, box)} r="6"></circle>` : nothing}
        ${cur ? this.renderTip(clock12(playheadIso), px, yForPct(cur.brightness_pct, box), box) : nothing}
      </svg>
    `;
  }

  /** Time label beside the playhead dot: above it, or below when the dot is near the top. */
  private renderTip(text: string, px: number, dotY: number, box: ChartBox) {
    const w = text.length * 7.2 + 14;
    const h = 22;
    const minX = box.padLeft;
    const maxX = box.width - box.padRight - w;
    const x = Math.min(Math.max(px - w / 2, minX), maxX);
    const above = dotY - 12 - h;
    const y = above >= box.padTop + 14 ? above : dotY + 12;
    return svg`
      <g class="tip" pointer-events="none">
        <rect x=${x} y=${y} width=${w} height=${h} rx="5"></rect>
        <text x=${x + w / 2} y=${y + 15} text-anchor="middle">${text}</text>
      </g>`;
  }

  // ------------------------------------------------------------- point view
  private renderPoint() {
    const p = this.point;
    if (!p) return html`<p class="muted">Pick a time on the chart.</p>`;
    const profile = this.profiles.find((x) => x.entry_id === this.selected);
    const s = p.settings;
    return html`
      <div class="now">
        <span class="time">${clock12(p.t)}</span>
        <span>${s.brightness_pct.toFixed(0)}% brightness</span>
        <span>${s.color_temp_kelvin} K</span>
        ${this.sleep ? html`<span class="tag">sleep mode</span>` : nothing}
      </div>
      <div class="lights">
        ${(profile?.lights ?? []).map((l) => this.renderLight(l.entity_id, l.name ?? l.entity_id, p.per_light[l.entity_id]))}
      </div>
      <p class="muted small">Swatches show colour and relative brightness; a screen can't show how bright a bulb really is.</p>
    `;
  }

  private renderLight(id: string, name: string, d: PerLight | undefined) {
    if (!d || d.error) return html`<div class="light"><div class="swatch none"></div><div><b>${name}</b><br /><span class="warn">${d?.error ?? "no data"}</span></div></div>`;
    const pct = d.brightness !== undefined ? Math.round((d.brightness / 255) * 100) : null;
    const rgb = d.display_rgb ?? [255, 244, 229]; // brightness-only: neutral warm white
    const level = pct === null ? 1 : 0.15 + 0.85 * (pct / 100);
    const color = `rgb(${rgb.map((c) => Math.round(c * level)).join(",")})`;
    const kind = d.rgb_color ? `RGB ${d.rgb_color.join(", ")}` : d.color_temp_kelvin ? `${d.color_temp_kelvin} K` : "dimmer only";
    return html`
      <div class="light" title=${id}>
        <div class="swatch" style="background:${color}"></div>
        <div><b>${name}</b><br /><span>${pct ?? "—"}% · ${kind}</span></div>
      </div>
    `;
  }

  // ------------------------------------------------------------ options UI
  private renderField(f: Field) {
    const value = f.name in this.edited ? this.edited[f.name] : f.value;
    const changed = f.name in this.overrides;
    const err = this.fieldErrors[f.name] ?? this.serverErrors[f.name];
    const label = f.name.replaceAll("_", " ");
    let input;
    if (f.kind === "boolean") {
      input = html`<input type="checkbox" .checked=${Boolean(value)} @change=${(e: Event) => this.onField(f, (e.target as HTMLInputElement).checked)} />`;
    } else if (f.kind === "select") {
      input = html`<select @change=${(e: Event) => this.onField(f, (e.target as HTMLSelectElement).value)}>
        ${f.options?.map((o) => html`<option value=${o} ?selected=${o === value}>${o}</option>`)}
      </select>`;
    } else if (f.kind === "integer" || f.kind === "float") {
      input = html`<input type="number" .value=${String(value ?? "")} min=${f.min ?? nothing} max=${f.max ?? nothing} step=${f.kind === "integer" ? 1 : "any"}
        @input=${(e: Event) => this.onField(f, (e.target as HTMLInputElement).value)} />`;
    } else {
      input = html`<input type="text" .value=${show(value) === "—" ? "" : Array.isArray(value) ? value.join(", ") : String(value)}
        @change=${(e: Event) => this.onField(f, (e.target as HTMLInputElement).value)} />`;
    }
    return html`
      <label class="field ${changed ? "changed" : ""} ${err ? "error" : ""}">
        <span>${label}${changed ? html` <em>(edited)</em>` : nothing}</span>
        ${input}
        ${err ? html`<span class="warn">⚠ ${err}</span>` : nothing}
      </label>
    `;
  }

  private renderOptionsCard() {
    if (!this.form) return html`<p class="muted">Options unavailable.</p>`;
    const basic = this.form.fields.filter((f) => !f.section);
    const pending = this.overrides;
    const n = Object.keys(pending).length;
    const saved = savedValues(this.form);
    return html`
      <div class="fields">${basic.map((f) => this.renderField(f))}</div>
      ${this.form.sections.map(
        (sec) => html`<details>
          <summary>${sec} options</summary>
          <div class="fields">${this.form!.fields.filter((f) => f.section === sec).map((f) => this.renderField(f))}</div>
        </details>`,
      )}
      <div class="actions">
        <span class="muted">${n ? `${n} unsaved change(s), already shown in the chart` : "No unsaved changes"}</span>
        <button ?disabled=${!n || this.busy} @click=${this.discard}>Discard</button>
        <button class="primary" ?disabled=${!n || this.busy || Object.keys(this.fieldErrors).length > 0} @click=${() => (this.confirming = true)}>Save…</button>
      </div>
      ${this.confirming
        ? html`<div class="confirm" role="dialog" aria-label="Confirm changes">
            <b>Save these changes to ${this.profileTitle}?</b>
            <table>
              ${Object.entries(pending).map(([k, v]) => html`<tr><td>${k.replaceAll("_", " ")}</td><td>${show(saved[k])}</td><td>→</td><td><b>${show(v)}</b></td></tr>`)}
            </table>
            <div class="actions">
              <button @click=${() => (this.confirming = false)}>Cancel</button>
              <button class="primary" ?disabled=${this.busy} @click=${this.apply}>${this.busy ? "Saving…" : "Save to profile"}</button>
            </div>
          </div>`
        : nothing}
    `;
  }

  // ----------------------------------------------------------------- render
  render() {
    const profile = this.profiles.find((p) => p.entry_id === this.selected);
    return html`
      <div class="toolbar">
        <h1>Adaptive Lighting</h1>
        <label>Profile
          <select @change=${(e: Event) => void this.selectProfile((e.target as HTMLSelectElement).value)}>
            ${this.profiles.map((p) => html`<option value=${p.entry_id} ?selected=${p.entry_id === this.selected}>${p.title}${p.lights.length ? "" : " (no lights)"}</option>`)}
          </select>
        </label>
        <label>Day <input type="date" .value=${this.date} @change=${(e: Event) => { this.date = (e.target as HTMLInputElement).value; void this.refreshCurve(); }} /></label>
        <label class="inline"><input type="checkbox" .checked=${this.sleep} @change=${(e: Event) => { this.sleep = (e.target as HTMLInputElement).checked; void this.refreshCurve(); }} /> Sleep mode</label>
      </div>
      ${this.message ? html`<div class="banner" role="status">${this.message} <button class="link" @click=${() => (this.message = "")}>dismiss</button></div>` : nothing}
      ${profile?.error ? html`<div class="banner warnbg">⚠ ${profile.error}</div>` : nothing}
      ${profile && !profile.lights.length ? html`<div class="banner">This profile has no lights, so it doesn't control anything.</div>` : nothing}

      <section class="card chartcard">
        ${this.renderChart()}
        <div class="controls">
          <button class="primary" @click=${() => this.playback.toggle()} aria-pressed=${this.playing}>${this.playing ? "❚❚ Pause" : "▶ Play the day"}</button>
          <label>over
            <select @change=${(e: Event) => { this.duration = Number((e.target as HTMLSelectElement).value); this.playback.setDuration(this.duration * 1000); }}>
              ${DURATIONS.map((d) => html`<option value=${d} ?selected=${d === this.duration}>${d} s</option>`)}
            </select>
          </label>
          <span class="spacer"></span>
          <label class="inline preview ${this.preview}">
            <input type="checkbox" .checked=${this.preview !== "off"} ?disabled=${!profile?.loaded || !profile?.lights.length} @change=${this.togglePreview} />
            Preview on real lights
            <span class="tag">${this.preview === "active" ? "ON: lights follow the playhead" : this.preview === "starting" ? "starting…" : "off"}</span>
          </label>
        </div>
      </section>

      <section class="card">${this.renderPoint()}</section>
      <section class="card"><h2>Options</h2>${this.renderOptionsCard()}</section>
    `;
  }

  static styles = css`
    :host {
      display: block;
      padding: 16px;
      max-width: 1100px;
      margin: 0 auto;
      color: var(--primary-text-color);
      background: var(--primary-background-color);
      font-family: var(--paper-font-body1_-_font-family, inherit);
      box-sizing: border-box;
    }
    h1 { font-size: 1.4em; margin: 0 16px 0 0; font-weight: 400; }
    h2 { font-size: 1.1em; margin: 0 0 12px; font-weight: 500; }
    .toolbar { display: flex; flex-wrap: wrap; gap: 12px 20px; align-items: end; margin-bottom: 12px; }
    .toolbar label { display: flex; flex-direction: column; font-size: 0.85em; color: var(--secondary-text-color); gap: 2px; }
    label.inline { flex-direction: row !important; align-items: center; gap: 6px; }
    select, input[type="text"], input[type="number"], input[type="date"] {
      font: inherit; color: var(--primary-text-color); background: var(--card-background-color);
      border: 1px solid var(--divider-color); border-radius: 6px; padding: 6px 8px; min-width: 0;
    }
    .card { background: var(--card-background-color); border-radius: var(--ha-card-border-radius, 12px);
      box-shadow: var(--ha-card-box-shadow, none); border: 1px solid var(--divider-color); padding: 16px; margin-bottom: 16px; }
    .chart { width: 100%; height: auto; touch-action: none; cursor: crosshair; display: block; outline: none; }
    .chart:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; border-radius: 6px; }
    .grid { stroke: var(--divider-color); stroke-width: 1; }
    .axis { fill: var(--secondary-text-color); font-size: 12px; }
    .sun { stroke: var(--secondary-text-color); stroke-dasharray: 4 4; stroke-width: 1; opacity: 0.7; }
    .sunlabel { fill: var(--secondary-text-color); font-size: 11px; }
    .line { fill: none; stroke: var(--primary-color); stroke-width: 3; }
    .playhead { stroke: var(--primary-text-color); stroke-width: 2; }
    .tip rect { fill: var(--primary-text-color); opacity: 0.88; }
    .tip text { fill: var(--card-background-color, #fff); font-size: 12px; font-weight: 600; }
    .dot { fill: var(--card-background-color); stroke: var(--primary-color); stroke-width: 3; }
    .controls { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 16px; margin-top: 12px; }
    .spacer { flex: 1; }
    button { font: inherit; padding: 6px 14px; border-radius: 18px; border: 1px solid var(--divider-color);
      background: var(--card-background-color); color: var(--primary-text-color); cursor: pointer; }
    button.primary { background: var(--primary-color); color: var(--text-primary-color, #fff); border-color: var(--primary-color); }
    button:disabled { opacity: 0.45; cursor: default; }
    button.link { border: none; background: none; color: var(--primary-color); padding: 0 4px; text-decoration: underline; }
    .tag { font-size: 0.8em; padding: 2px 8px; border-radius: 10px; border: 1px solid var(--divider-color); color: var(--secondary-text-color); }
    .preview.active .tag { background: var(--primary-color); color: var(--text-primary-color, #fff); border-color: var(--primary-color); font-weight: 600; }
    .now { display: flex; flex-wrap: wrap; gap: 6px 18px; align-items: baseline; margin-bottom: 12px; }
    .now .time { font-size: 1.8em; font-weight: 300; }
    .lights { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 10px; }
    .light { display: flex; gap: 10px; align-items: center; }
    .swatch { width: 44px; height: 44px; border-radius: 50%; border: 1px solid var(--divider-color); flex: none; }
    .swatch.none { background: repeating-linear-gradient(45deg, var(--divider-color) 0 4px, transparent 4px 8px); }
    .muted { color: var(--secondary-text-color); }
    .small { font-size: 0.8em; margin-bottom: 0; }
    .fields { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 10px 16px; margin-bottom: 12px; }
    .field { display: flex; flex-direction: column; gap: 3px; font-size: 0.9em; }
    .field > span:first-child { color: var(--secondary-text-color); text-transform: capitalize; }
    .field.changed > span:first-child { color: var(--primary-color); font-weight: 600; }
    .field.changed input, .field.changed select { border-color: var(--primary-color); border-width: 2px; }
    .field.error input, .field.error select { border-color: var(--warning-color, #ffa600); border-width: 2px; }
    .field em { font-style: normal; font-weight: 400; }
    .warn { color: var(--warning-color, #b36b00); font-size: 0.85em; }
    details { margin: 4px 0 12px; }
    summary { cursor: pointer; color: var(--primary-color); margin-bottom: 10px; text-transform: capitalize; }
    .actions { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; justify-content: flex-end; }
    .actions .muted { margin-right: auto; }
    .confirm { margin-top: 12px; padding: 12px; border: 2px solid var(--primary-color); border-radius: 10px; }
    .confirm table { border-collapse: collapse; margin: 10px 0; }
    .confirm td { padding: 2px 10px 2px 0; }
    .banner { padding: 10px 14px; border-radius: 8px; margin-bottom: 12px; border: 1px solid var(--divider-color); background: var(--card-background-color); }
    .warnbg { border-color: var(--warning-color, #ffa600); }
    @media (max-width: 600px) {
      :host { padding: 8px; }
      .card { padding: 10px; }
      .now .time { font-size: 1.4em; }
    }
  `;
}

if (!customElements.get("al-sim-panel")) customElements.define("al-sim-panel", AlSimPanel);
