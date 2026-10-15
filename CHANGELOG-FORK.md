# Fork changelog

## 1.32.0-homeops.2

- Panel: 12-hour clock everywhere (hour axis, sun markers, the time readout).
- Panel: a label beside the playhead dot shows the exact time at the playhead (to the minute,
  also during playback).

## 1.32.0-homeops.1 (released 2026-10-15)

Based on upstream v1.32.0.

- Extract `compute_light_service_data()` from `prepare_adaptation_data` (no behaviour change;
  upstream suite: 467 passed before and after). New unit tests for each branch.
- Extract `build_sun_light_settings()` from `_set_changeable_settings` (no behaviour change).
- Simulator engine + websocket API: `adaptive_lighting/sim/profiles`, `/curve`, `/point`. Tested
  against a live switch: simulated values equal the switch's own for saved and unsaved options.
- Real-light preview: `adaptive_lighting/sim/preview` (subscription) + `/preview/set`. Restores
  each light's exact state and manual-control flags on release, disconnect, timeout, unload or
  HA stop. 12 tests; full suite 521 passed.
- Simulator panel (sidebar "Adaptive Lighting", admin only): profile picker, day chart (brightness
  + colour strip + sun events), click/drag/keyboard scrubbing, per-light swatches, day playback
  (15/30/60/120 s), real-light preview toggle, options editor (live preview of unsaved values,
  diff + save via options flow, stale-change check). `point` now returns `display_rgb` per light.
  20 Vitest tests + 5 registration tests; full suite 527 passed.
- Drop `ulid-transform` from manifest requirements (provided by HA core; fixes hassfest).
- Fork CI: matrix trimmed to prod / latest stable / dev; HACS validation enabled on the fork.
