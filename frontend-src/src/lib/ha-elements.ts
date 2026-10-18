// Borrowing Home Assistant's own UI from a custom panel. Verified against HA frontend
// 20260527.7 (HA 2026.6): `ha-selector` is not loaded until something needs it.
// `ha-form` imports it, and the button card's editor uses `ha-form`, so loading
// that editor through the card helpers registers it. More-info is the root's
// `hass-more-info` listener (src/state/more-info-mixin.ts).

let selectorReady: Promise<boolean> | null = null;

/** Resolve true once `ha-selector` is defined, false if it can't be loaded in time. */
export function ensureHaSelector(timeoutMs = 5000): Promise<boolean> {
  if (customElements.get("ha-selector")) return Promise.resolve(true);
  selectorReady ??= Promise.race([
    (async () => {
      const helpers = await (window as unknown as { loadCardHelpers?: () => Promise<{ createCardElement(c: object): HTMLElement }> }).loadCardHelpers?.();
      if (!helpers) return false;
      helpers.createCardElement({ type: "button", entity: "sun.sun" });
      await customElements.whenDefined("hui-button-card");
      const card = customElements.get("hui-button-card") as unknown as { getConfigElement?: () => Promise<unknown> };
      await card.getConfigElement?.();
      await customElements.whenDefined("ha-selector");
      return true;
    })().catch(() => false),
    new Promise<boolean>((resolve) => setTimeout(() => resolve(false), timeoutMs)),
  ]);
  return selectorReady;
}

/** Open HA's standard more-info dialog for an entity. */
export function openMoreInfo(from: HTMLElement, entityId: string): void {
  from.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId }, bubbles: true, composed: true }));
}
