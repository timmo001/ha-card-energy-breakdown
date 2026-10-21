import type { HomeAssistant } from "../types";

export interface DeviceConsumptionEnergyPreference {
  // This is an ever increasing value
  stat_consumption: string;
  stat_rate?: string;
  name?: string;
  included_in_stat?: string;
}

export interface EnergyPreferences {
  device_consumption: DeviceConsumptionEnergyPreference[];
}

export const getEnergyPreferences = (hass: HomeAssistant) =>
  hass.callWS<EnergyPreferences>({
    type: "energy/get_prefs",
  });
