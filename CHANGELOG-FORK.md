# Fork changelog

## 1.32.0-homeops.1 (unreleased)

Based on upstream v1.32.0.

- Extract `compute_light_service_data()` from `prepare_adaptation_data` (no behaviour change;
  upstream suite: 467 passed before and after). New unit tests for each branch.
- Extract `build_sun_light_settings()` from `_set_changeable_settings` (no behaviour change).
- Simulator engine + websocket API: `adaptive_lighting/sim/profiles`, `/curve`, `/point`. Tested
  against a live switch: simulated values equal the switch's own for saved and unsaved options.
- Drop `ulid-transform` from manifest requirements (provided by HA core; fixes hassfest).
- Fork CI: matrix trimmed to prod / latest stable / dev; HACS validation enabled on the fork.
