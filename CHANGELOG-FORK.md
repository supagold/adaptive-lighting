# Fork changelog

## 1.32.0-homeops.6

- **Schedule curve.** New option `schedule` (JSON text): a list of points `{"at", "brightness", "color_temp"?}`.
  `at` is a clock time (`"08:00"`) or a sun anchor (`"sunrise"`, `"sunset+30m"`). Brightness fades
  linearly between points and wraps over midnight, so any number of levels at any times works.
  While set it replaces `brightness_mode` and the min/max brightness; a point's `color_temp` is
  used when both neighbours have one, otherwise the sun-based colour. Sleep mode still wins.
  Profiles without a schedule behave exactly as before. New module `schedule.py`; the curve code
  in `color_and_brightness.py` has one new branch. 31 new tests (565 total pass).
- Simulator `curve` result includes `schedule` (each point with its resolved time that day).
- Panel: **Schedule** card ("Use a schedule" seeds four points from the current curve). Drag a dot
  on the chart: left/right changes the time in 5-minute steps (Shift = 1 minute), up/down the
  brightness, with a tooltip showing the time and % while dragging. A diamond is tied to
  sunrise or sunset. Rows below edit the same points (clock time or sunrise/sunset with offset,
  brightness, optional colour temperature), add a point at the playhead, remove a point
  (minimum two). Keyboard: arrows move a focused dot, Delete removes it.
  The save dialog summarises schedule changes.
- Fix (found by the browser check): listing profiles failed when the stored schedule was the text "None".

## 1.32.0-homeops.5

- Panel: every option label has a help tooltip (hover, keyboard focus or tap on the ⓘ) in plain
  language. Covers all 42 options; a unit test fails if one is missing. Frontend only.

## 1.32.0-homeops.4

- Panel: **+ New profile**. A draft starts as a copy of the selected profile's curve with its
  lights cleared. Pick lights with HA's light picker, set the curve, name it; the chart updates
  live and nothing exists until **Create**. Create runs HA's config flow (empty entry), then the
  options flow with every option. If the options step fails the half-made entry is deleted.
  A duplicate name is refused. A light already controlled by another profile is flagged.
  Frontend only; no new websocket commands.

## 1.32.0-homeops.3

- Panel: the Lights option uses Home Assistant's own light picker (search, add, remove), with
  the text box as a fallback if the picker can't be loaded. Unsaved additions show in the chart
  and light cards at once, tagged "unsaved"; Save writes them like any other option.
- Panel: clicking a light's name or swatch opens HA's more-info dialog for it.
- Panel: per-light **M**ute / **S**olo for the preview only (never saved). Solo wins over mute.
  Pressed state = fill + a text tag, never colour alone.
- `adaptive_lighting/sim/preview/lights`: change a running preview's lights. A light leaving the
  set is handed back at once, exactly as at session end. Full suite: 534 passed.
- `adaptive_lighting/sim/preview` with an explicit empty `lights` list now takes over nothing
  (it used to take over every light).
- Panel: after Save, wait for the profile to finish reloading, so the preview toggle isn't left
  disabled.

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
