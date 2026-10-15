"""Sidebar panel registration for the simulator (homeops fork).

Serves the built bundle from `frontend/` and registers an admin-only sidebar panel once per
HA run. The integration declares http/frontend/panel_custom as *after_dependencies* (load
order, and hassfest wants imported components declared). They aren't hard requirements, so
this waits for the frontend if it isn't loaded yet, and does nothing in environments without
a web server (e.g. upstream's test harness).
"""

# Relative parent imports are required. HA loads this package under the
# custom_components namespace, while upstream's tests load it through a symlink
# under homeassistant.components; an absolute import would break one of the two.
# ruff: noqa: TID252

from __future__ import annotations

import logging
from pathlib import Path
from typing import TYPE_CHECKING

from homeassistant.const import EVENT_COMPONENT_LOADED
from homeassistant.loader import async_get_integration

from ..const import DOMAIN

if TYPE_CHECKING:
    from homeassistant.core import Event, HomeAssistant

_LOGGER = logging.getLogger(__name__)

PANEL_URL_PATH = "adaptive-lighting"
STATIC_URL = "/adaptive_lighting_sim"
WEBCOMPONENT = "al-sim-panel"
BUNDLE = "al-sim-panel.js"
FRONTEND_DIR = Path(__file__).parent.parent / "frontend"
SIDEBAR_TITLE = "Adaptive Lighting"
SIDEBAR_ICON = "mdi:theme-light-dark"


async def async_register_panel(hass: HomeAssistant) -> bool:
    """Register static files + panel. Returns True if registered (now or earlier)."""
    from homeassistant.components import frontend, panel_custom
    from homeassistant.components.http import StaticPathConfig

    if PANEL_URL_PATH in hass.data.get(frontend.DATA_PANELS, {}):
        return True
    if not (FRONTEND_DIR / BUNDLE).is_file():
        _LOGGER.warning("Simulator panel bundle missing: %s", FRONTEND_DIR / BUNDLE)
        return False
    version = (await async_get_integration(hass, DOMAIN)).version
    await hass.http.async_register_static_paths(
        [StaticPathConfig(STATIC_URL, str(FRONTEND_DIR), cache_headers=False)],
    )
    await panel_custom.async_register_panel(
        hass,
        frontend_url_path=PANEL_URL_PATH,
        webcomponent_name=WEBCOMPONENT,
        sidebar_title=SIDEBAR_TITLE,
        sidebar_icon=SIDEBAR_ICON,
        module_url=f"{STATIC_URL}/{BUNDLE}?v={version}",
        embed_iframe=False,
        require_admin=True,
    )
    _LOGGER.debug("Simulator panel registered at /%s (v%s)", PANEL_URL_PATH, version)
    return True


def _ready(hass: HomeAssistant) -> bool:
    # Only `frontend` must be loaded: panel_custom.async_register_panel is a stateless
    # wrapper around frontend.async_register_built_in_panel, and HA does not load the
    # panel_custom component by default (after_dependencies orders, never loads).
    return hass.http is not None and "frontend" in hass.config.components


async def async_setup_panel(hass: HomeAssistant) -> None:
    """Register the panel now, or as soon as the frontend is loaded."""
    if _ready(hass):
        await async_register_panel(hass)
        return
    if hass.http is None:
        return  # no web server (tests, safe mode): nothing to serve a panel from

    async def _on_loaded(event: Event) -> None:
        if event.data.get("component") == "frontend" and _ready(hass):
            remove()
            await async_register_panel(hass)

    remove = hass.bus.async_listen(EVENT_COMPONENT_LOADED, _on_loaded)
