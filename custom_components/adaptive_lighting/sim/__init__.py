"""In-HA simulator for Adaptive Lighting profiles (homeops fork). See FORK.md."""

from __future__ import annotations

from typing import TYPE_CHECKING

from . import api

if TYPE_CHECKING:
    from homeassistant.core import HomeAssistant

DATA_SIM = "adaptive_lighting_sim"


async def async_setup(hass: HomeAssistant) -> None:
    """Set up the simulator once per HA run (called from the integration's async_setup)."""
    if hass.data.get(DATA_SIM):
        return
    api.async_register(hass)
    hass.data[DATA_SIM] = True
