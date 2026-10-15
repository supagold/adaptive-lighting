# Fork changelog

## 1.32.0-homeops.1 (unreleased)

Based on upstream v1.32.0.

- Extract `compute_light_service_data()` from `prepare_adaptation_data` (no behaviour change;
  upstream suite: 467 passed before and after). New unit tests for each branch.
- Extract `build_sun_light_settings()` from `_set_changeable_settings` (no behaviour change).
- Simulator engine + websocket API: `adaptive_lighting/sim/profiles`, `/curve`, `/point`. Tested
  against a live switch: simulated values equal the switch's own for saved and unsaved options.
- Real-light preview: `adaptive_lighting/sim/preview` (subscription) + `/preview/set`. Restores
  each light's exact state and manual-control flags on release, disconnect, timeout, unload or
  HA stop. 12 tests; full suite 521 passed.
- Drop `ulid-transform` from manifest requirements (provided by HA core; fixes hassfest).
- Fork CI: matrix trimmed to prod / latest stable / dev; HACS validation enabled on the fork.
