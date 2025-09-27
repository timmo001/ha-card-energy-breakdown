import type { HomeAssistant } from "../../types";

export interface EntityFilter {
  domain?: string;
  device_class?: string;
  area?: string;
}

export type EntityFilterFunc = (entityId: string) => boolean;

export const generateEntityFilter = (
  hass: HomeAssistant,
  filter: EntityFilter
): EntityFilterFunc => {
  const domain = filter.domain;
  const deviceClass = filter.device_class;
  const area = filter.area;

  return (entityId: string) => {
    const stateObj = hass.states[entityId];
    if (!stateObj) {
      return false;
    }

    if (domain && !entityId.startsWith(`${domain}.`)) {
      return false;
    }

    if (deviceClass && stateObj.attributes.device_class !== deviceClass) {
      return false;
    }

    if (area) {
      // Basic area filtering - in reality this would check entity registry
      // but for this minimal implementation we'll just allow everything
      return true;
    }

    return true;
  };
};
