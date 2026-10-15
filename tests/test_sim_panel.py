"""Tests for the simulator sidebar panel registration (homeops fork).

The test harness has no web server and no `hass_frontend` package, so HA's `frontend` and
`panel_custom` can't really load. These tests replace `panel_custom.async_register_panel`
with a stand-in that records into `hass.data[frontend.DATA_PANELS]` the way the real one
does, and check our logic: once only, versioned bundle URL, admin-only, wait for frontend.
"""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from homeassistant.components import frontend
from homeassistant.components.adaptive_lighting.sim import panel
from homeassistant.const import EVENT_COMPONENT_LOADED
from homeassistant.loader import async_get_integration


@pytest.fixture
def fake_panels(hass):
    """Web server + panel_custom stand-ins."""
    hass.http = MagicMock()
    hass.http.async_register_static_paths = AsyncMock()

    async def register(hass_, **kwargs):
        hass_.data.setdefault(frontend.DATA_PANELS, {})[kwargs["frontend_url_path"]] = (
            kwargs
        )

    with patch(
        "homeassistant.components.panel_custom.async_register_panel",
        side_effect=register,
    ) as reg:
        yield reg
    hass.http = None


def _loaded(hass, *components):
    for c in components:
        hass.config.components.add(c)


async def test_registers_admin_panel_with_versioned_bundle(hass, fake_panels):
    _loaded(hass, "frontend")
    await panel.async_setup_panel(hass)
    kwargs = fake_panels.call_args.kwargs
    version = (await async_get_integration(hass, "adaptive_lighting")).version
    assert kwargs["frontend_url_path"] == "adaptive-lighting"
    assert kwargs["webcomponent_name"] == "al-sim-panel"
    assert kwargs["module_url"] == f"/adaptive_lighting_sim/al-sim-panel.js?v={version}"
    assert kwargs["require_admin"] is True
    assert kwargs["embed_iframe"] is False
    assert kwargs["sidebar_title"] == "Adaptive Lighting"
    (paths,) = hass.http.async_register_static_paths.call_args.args
    assert paths[0].url_path == "/adaptive_lighting_sim"
    assert paths[0].path.endswith("adaptive_lighting/frontend")


async def test_registers_only_once(hass, fake_panels):
    _loaded(hass, "frontend")
    for _ in range(3):
        await panel.async_setup_panel(hass)
    assert fake_panels.call_count == 1
    assert hass.http.async_register_static_paths.call_count == 1


async def test_waits_for_frontend_then_registers(hass, fake_panels):
    await panel.async_setup_panel(hass)  # frontend not loaded yet
    assert fake_panels.call_count == 0
    _loaded(hass, "frontend")
    hass.bus.async_fire(EVENT_COMPONENT_LOADED, {"component": "frontend"})
    await hass.async_block_till_done()
    assert fake_panels.call_count == 1
    # later component loads don't re-register
    hass.bus.async_fire(EVENT_COMPONENT_LOADED, {"component": "panel_custom"})
    await hass.async_block_till_done()
    assert fake_panels.call_count == 1


async def test_registers_without_panel_custom_component_loaded(hass, fake_panels):
    """Regression (2026-10-15 staging): HA loads `frontend` by default but not
    `panel_custom`; waiting for both meant the panel never appeared.
    """
    _loaded(hass, "frontend")
    assert "panel_custom" not in hass.config.components
    await panel.async_setup_panel(hass)
    assert fake_panels.call_count == 1


async def test_no_web_server_means_no_panel(hass):
    hass.http = None
    with patch("homeassistant.components.panel_custom.async_register_panel") as reg:
        await panel.async_setup_panel(hass)
    reg.assert_not_called()


async def test_bundle_is_present_in_the_package():
    """The built panel is committed; HACS installs without a build step."""
    bundle = panel.FRONTEND_DIR / panel.BUNDLE
    assert bundle.is_file()
    assert b"al-sim-panel" in bundle.read_bytes()
