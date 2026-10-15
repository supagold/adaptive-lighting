# homeops fork of Adaptive Lighting

Private fork of [basnijholt/adaptive-lighting](https://github.com/basnijholt/adaptive-lighting)
for one household. It keeps **every** upstream feature and adds an in-Home-Assistant
simulator: a sidebar panel that graphs each profile's day, previews any moment (on screen,
optionally on the real lights), plays the day back, and saves changes through the options flow.

Project page, decisions and status: homeops wiki, *Adaptive Lighting Fork + Simulator*.

## Branches and versions

| Branch | Purpose |
|---|---|
| `main` | Left as it was when forked. Never push to it: pushing would trigger upstream's workflows there. Upstream comes in via release tags from the `upstream` remote. |
| `homeops` | Default branch. Upstream release tag + fork changes. |

Versions are `<upstream version>-homeops.<n>`, e.g. `1.32.0-homeops.1`, tagged `v1.32.0-homeops.1`.
Semver ranks a pre-release *below* its base (`1.32.0-homeops.1 < 1.32.0`), so HACS must track
only this fork, not upstream too, or it will offer "upgrading" to plain upstream.

## What the fork changes in upstream files

Keep this list exact. It's what to check when merging an upstream release.

| File | Change |
|---|---|
| `custom_components/adaptive_lighting/switch.py` | (1) Per-light step of `AdaptiveSwitch.prepare_adaptation_data` moved verbatim into module function `compute_light_service_data()`. (2) `SunLightSettings(...)` construction in `_set_changeable_settings` moved verbatim into module function `build_sun_light_settings(hass, name, data)`. Both are reused by the simulator so it computes exactly what the switch does. `Mapping` added to the `TYPE_CHECKING` imports. |
| `custom_components/adaptive_lighting/__init__.py` | `from . import sim`; `await sim.async_setup(hass)` at the end of `async_setup` (registers the simulator's websocket API and panel once per HA run). |
| `custom_components/adaptive_lighting/manifest.json` | `version` → fork version; `after_dependencies: [frontend, http, panel_custom]` (load order for the panel; not hard requirements); `ulid-transform` dropped from `requirements` (HA core ships it — `ulid-transform==2.2.9` in HA 2026.6.4 — and hassfest rejects listing it; upstream's own hassfest fails on this). |
| `hacs.json` | `name` → "Adaptive Lighting (homeops fork)". |
| `.gitignore` | `frontend-src/node_modules/`. |
| `.github/workflows/pytest.yaml` | Runs on `homeops`; matrix = prod HA version, latest stable, `dev` (allowed to fail). |
| `.github/workflows/hassfest.yaml`, `validate.yml` | Run on `homeops`; HACS validation allowed on this fork. |
| `.github/workflows/frontend.yaml` (new) | Panel: type-check, Vitest, build, and fail if the committed bundle differs from the build. |

Workflows **deleted** on `homeops` (upstream project automation: docs site, Docker image,
release drafter, weekly matrix-bump PRs, main→master sync, TOC/markdown bots): `docs.yml`,
`docker-build.yml`, `release-drafter.yml`, `update-test-matrix.yaml`, `main-to-master-sync.yml`,
`toc.yaml`, `markdown-code-runner.yml`. They can't be disabled in settings until they have run
once, and they only make sense for upstream. If a merge brings back changes to them, keep the deletion.

New files: `FORK.md`, `CHANGELOG-FORK.md`, `custom_components/adaptive_lighting/sim/`
(`engine.py`, `api.py`, `preview.py`, `panel.py`, `__init__.py`),
`custom_components/adaptive_lighting/frontend/al-sim-panel.js` (built panel, committed),
`frontend-src/` (its source), `tests/test_light_service_data.py`, `tests/test_sim_api.py`,
`tests/test_sim_preview.py`, `tests/test_sim_panel.py`.

## Simulator websocket API (admin only)

| type | request | result |
|---|---|---|
| `adaptive_lighting/sim/profiles` | – | `{time_zone, profiles: [{entry_id, title, loaded, options (effective), stored_options, error, lights: [{entity_id, name, state, features, supported_color_modes, min/max_color_temp_kelvin}], switches}]}` |
| `adaptive_lighting/sim/curve` | `entry_id`, `overrides` {}, `date` (YYYY-MM-DD, default today), `step_min` 1–60 (5), `sleep` (false) | `{date, sun: {sunrise, sunset, solar_noon, solar_midnight}, samples: [{t, minute, brightness_pct, color_temp_kelvin, rgb_color, sun_position, force_rgb_color}]}` or `{errors: {field: message}}` |
| `adaptive_lighting/sim/point` | `entry_id`, `overrides`, `at` (ISO datetime; local tz if naive), `sleep`, `adapt_brightness`, `adapt_color` | `{t, settings: {…as a sample}, per_light: {entity_id: {brightness, color_temp_kelvin or rgb_color, transition}}}` or `{errors}` |

| `adaptive_lighting/sim/preview` (subscription) | `entry_id`, `lights` (default: all of the profile's), `timeout_s` 10–3600 (600) | result, then events `{status: "active", lights, timeout_s}` and `{status: "ended", reason}` (`timeout` / `unload` / `ha_stop`). Errors: `not_found`, `not_loaded`, `busy` (a light is in another preview). |
| `adaptive_lighting/sim/preview/set` | `entry_id` (one preview per profile per connection), `overrides`, `at`, `sleep`, `transition_s` 0–60 (1) | `{sent: bool, commands: {entity_id: turn_on data}}`; `sent: false` = queued (max 1 command/s per session, newest wins) |

**Preview takeover/restore** (`sim/preview.py`): snapshot each light, then set its manual-control
flags to ALL directly in the manager. This starts no auto-reset timer and fires no event, and the
interval loop skips the light. Commands go out with an Adaptive Lighting context, so manual-change
detection ignores them. Ending (unsubscribe, websocket close, timeout, profile unload, HA stop)
restores each light's exact previous flags. Lights that were off go off. Lights that were adapting
are force re-adapted. Lights that were manual get their snapshot back, and so does every light on
unload / HA stop.

`overrides` are unsaved option values, validated field by field with the options-flow validators.
Unknown `entry_id` → error `not_found`. Only `preview` / `preview/set` touch lights; nothing changes config entries.

## Running the tests locally

Upstream's tests run inside a Home Assistant core checkout:

```bash
git clone --depth 1 --branch 2026.6.4 https://github.com/home-assistant/core.git core
uv venv --python 3.14.2 && source .venv/bin/activate
./scripts/setup-dependencies && ./scripts/setup-symlinks
export PYTHONPATH=$PYTHONPATH:$PWD
cd core && python3 -X dev -m pytest -q --timeout=30 -p no:sugar -n 4 tests/components/adaptive_lighting
```

Baseline at v1.32.0 on HA 2026.6.4: 467 passed.

## The panel

Sidebar **Adaptive Lighting** (admin only), at `/adaptive-lighting`. Source in `frontend-src/`
(TypeScript + Lit, bundled by Vite with Lit included, so no CDN). Build output is committed at
`custom_components/adaptive_lighting/frontend/al-sim-panel.js`, served from
`/adaptive_lighting_sim/`, and cache-busted with `?v=<manifest version>`. **Bump the version
when the bundle changes**, or browsers keep the old one.

```bash
cd frontend-src
npm ci
npm test            # Vitest: time axis (incl. DST days), playback, throttle, options form, chart
npm run build       # type-check + bundle into the integration; commit the result
```

All numbers come from the websocket API. The panel never computes the curve. Options are read
from and saved through HA's options flow (REST), the same path as the Settings UI.

## Syncing an upstream release

1. `git fetch upstream --tags` (`upstream` = https://github.com/basnijholt/adaptive-lighting.git)
2. `git checkout homeops && git merge v<new>` (merge the release tag, not upstream `main`)
3. Resolve conflicts, using the table above as the list of places where they can occur.
4. Run the full test suite, bump `manifest.json` to `<new>-homeops.1`, update `CHANGELOG-FORK.md`.
5. Push, wait for CI to pass, tag, and publish a pre-release. Deploy to staging HA before prod.
