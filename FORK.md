# homeops fork of Adaptive Lighting

Private fork of [basnijholt/adaptive-lighting](https://github.com/basnijholt/adaptive-lighting)
for one household. It keeps **every** upstream feature and adds an in-Home-Assistant
simulator: a sidebar panel that graphs each profile's day, previews any moment (on screen,
optionally on the real lights), plays the day back, and saves changes through the options flow.

Project page, decisions and status: homeops wiki, *Adaptive Lighting Fork + Simulator*.

## Branches and versions

| Branch | Purpose |
|---|---|
| `main` | Mirror of upstream `main`. Never commit here. |
| `homeops` | Default branch. Upstream release tag + fork changes. |

Versions are `<upstream version>-homeops.<n>`, e.g. `1.32.0-homeops.1`, tagged `v1.32.0-homeops.1`.
Semver ranks a pre-release *below* its base (`1.32.0-homeops.1 < 1.32.0`), so HACS must track
only this fork, not upstream too, or it will offer "upgrading" to plain upstream.

## What the fork changes in upstream files

Keep this list exact. It's what to check when merging an upstream release.

| File | Change |
|---|---|
| `custom_components/adaptive_lighting/switch.py` | Per-light step of `AdaptiveSwitch.prepare_adaptation_data` moved verbatim into module function `compute_light_service_data()` (pure, reused by the simulator). `Mapping` added to the `TYPE_CHECKING` imports. |
| `custom_components/adaptive_lighting/manifest.json` | `version` → fork version. |
| `hacs.json` | `name` → "Adaptive Lighting (homeops fork)". |
| `.github/workflows/pytest.yaml` | Runs on `homeops`; matrix = prod HA version, latest stable, `dev` (allowed to fail). |
| `.github/workflows/hassfest.yaml`, `validate.yml` | Run on `homeops`; HACS validation allowed on this fork. |

Workflows disabled on the fork in GitHub settings (files untouched): `docs`, `docker-build`,
`release-drafter`, `update-test-matrix`, `main-to-master-sync`, `toc`, `markdown-code-runner`.

New files: `FORK.md`, `CHANGELOG-FORK.md`, `tests/test_light_service_data.py`, and from later
phases `custom_components/adaptive_lighting/sim/`, `frontend-src/`, `tests/test_sim_*.py`.

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

## Syncing an upstream release

1. `git fetch upstream --tags && git push origin upstream/main:main`
2. `git checkout homeops && git merge v<new>` (merge the release tag, not upstream `main`)
3. Resolve conflicts, using the table above as the list of places where they can occur.
4. Run the full test suite, bump `manifest.json` to `<new>-homeops.1`, update `CHANGELOG-FORK.md`.
5. Push, wait for CI to pass, tag, and publish a pre-release. Deploy to staging HA before prod.
