"""In-HA simulator for Adaptive Lighting profiles (homeops fork). See FORK.md."""

from __future__ import annotations

from typing import TYPE_CHECKING

from homeassistant.const import EVENT_HOMEASSISTANT_STOP

from . import api, panel, preview

if TYPE_CHECKING:
    from homeassistant.core import Event, HomeAssistant

DATA_SIM = "adaptive_lighting_sim"


async def async_setup(hass: HomeAssistant) -> None:
    """Set up the simulator once per HA run (called from the integration's async_setup)."""
    if hass.data.get(DATA_SIM):
        return
    api.async_register(hass)

    async def _end_previews(_event: Event) -> None:
        await preview.async_end_all(hass, "ha_stop")

    hass.bus.async_listen_once(EVENT_HOMEASSISTANT_STOP, _end_previews)
    hass.data[DATA_SIM] = True
    await panel.async_setup_panel(hass)
