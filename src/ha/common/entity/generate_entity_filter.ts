import type { HassEntity } from "home-assistant-js-websocket";
import type { HomeAssistant } from "../../types";
import { ensureArray } from "../array/ensure-array";
import { computeDomain } from "./compute_domain";
import { getEntityContext } from "./context/get_entity_context";

type EntityCategory = "none" | "config" | "diagnostic";

export interface EntityFilter {
  domain?: string | string[];
  device_class?: string | string[];
  device?: string | string[];
  area?: string | string[];
  floor?: string | string[];
  label?: string | string[];
  entity_category?: EntityCategory | EntityCategory[];
  hidden_platform?: string | string[];
}

export type EntityFilterFunc = (entityId: string) => boolean;

export const generateEntityFilter = (
  hass: HomeAssistant,
  filter: EntityFilter
): EntityFilterFunc => {
  console.log("[Entity Filter] Creating filter with:", filter);
  
  const domains = filter.domain
    ? new Set(ensureArray(filter.domain))
    : undefined;
  const deviceClasses = filter.device_class
    ? new Set(ensureArray(filter.device_class))
    : undefined;
  const floors = filter.floor ? new Set(ensureArray(filter.floor)) : undefined;
  const areas = filter.area ? new Set(ensureArray(filter.area)) : undefined;
  const devices = filter.device
    ? new Set(ensureArray(filter.device))
    : undefined;
  const entityCategories = filter.entity_category
    ? new Set(ensureArray(filter.entity_category))
    : undefined;
  const labels = filter.label ? new Set(ensureArray(filter.label)) : undefined;
  const hiddenPlatforms = filter.hidden_platform
    ? new Set(ensureArray(filter.hidden_platform))
    : undefined;

  console.log("[Entity Filter] Processed filters:", {
    domains: domains ? Array.from(domains) : undefined,
    deviceClasses: deviceClasses ? Array.from(deviceClasses) : undefined,
    floors: floors ? Array.from(floors) : undefined,
    areas: areas ? Array.from(areas) : undefined,
    devices: devices ? Array.from(devices) : undefined,
    entityCategories: entityCategories
      ? Array.from(entityCategories)
      : undefined,
    labels: labels ? Array.from(labels) : undefined,
    hiddenPlatforms: hiddenPlatforms ? Array.from(hiddenPlatforms) : undefined,
  });

  return (entityId: string) => {
    const stateObj = hass.states[entityId] as HassEntity | undefined;
    if (!stateObj) {
      console.log(`[Entity Filter] Entity ${entityId} not found in states`);
      return false;
    }
    
    if (domains) {
      const domain = computeDomain(entityId);
      if (!domains.has(domain)) {
        console.log(
          `[Entity Filter] Entity ${entityId} domain ${domain} not in required domains:`,
          Array.from(domains)
        );
        return false;
      }
    }
    
    if (deviceClasses) {
      const dc = stateObj.attributes.device_class || "none";
      if (!deviceClasses.has(dc)) {
        console.log(
          `[Entity Filter] Entity ${entityId} device_class ${dc} not in required device_classes:`,
          Array.from(deviceClasses)
        );
        return false;
      }
    }

    const { area, floor, device, entity } = getEntityContext(
      stateObj,
      hass.entities,
      hass.devices,
      hass.areas,
      hass.floors
    );

    console.log(`[Entity Filter] Entity ${entityId} context:`, {
      entity: entity
        ? {
            entity_id: entity.entity_id,
            area_id: entity.area_id,
            device_id: entity.device_id,
          }
        : null,
      device: device ? { id: device.id, area_id: device.area_id } : null,
      area: area ? { area_id: area.area_id, name: area.name } : null,
      floor: floor ? { floor_id: floor.floor_id, name: floor.name } : null,
    });

    if (entity && entity.hidden) {
      console.log(`[Entity Filter] Entity ${entityId} is hidden`);
      return false;
    }

    if (floors) {
      if (!floor || !floors.has(floor.floor_id)) {
        console.log(
          `[Entity Filter] Entity ${entityId} floor ${floor?.floor_id} not in required floors:`,
          Array.from(floors)
        );
        return false;
      }
    }
    
    if (areas) {
      if (!area) {
        console.log(
          `[Entity Filter] Entity ${entityId} has no area, required areas:`,
          Array.from(areas)
        );
        return false;
      }
      if (!areas.has(area.area_id)) {
        console.log(
          `[Entity Filter] Entity ${entityId} area ${area.area_id} not in required areas:`,
          Array.from(areas)
        );
        return false;
      }
    }

    if (devices) {
      if (!device) {
        console.log(
          `[Entity Filter] Entity ${entityId} has no device, required devices:`,
          Array.from(devices)
        );
        return false;
      }
      if (!devices.has(device.id)) {
        console.log(
          `[Entity Filter] Entity ${entityId} device ${device.id} not in required devices:`,
          Array.from(devices)
        );
        return false;
      }
    }

    if (labels) {
      if (!entity) {
        console.log(
          `[Entity Filter] Entity ${entityId} has no entity registry entry for label check`
        );
        return false;
      }
      if (!entity.labels.some((label) => labels.has(label))) {
        console.log(
          `[Entity Filter] Entity ${entityId} labels ${entity.labels} not in required labels:`,
          Array.from(labels)
        );
        return false;
      }
    }

    if (entityCategories) {
      if (!entity) {
        console.log(
          `[Entity Filter] Entity ${entityId} has no entity registry entry for category check`
        );
        return false;
      }
      const category = entity?.entity_category || "none";
      if (!entityCategories.has(category)) {
        console.log(
          `[Entity Filter] Entity ${entityId} category ${category} not in required categories:`,
          Array.from(entityCategories)
        );
        return false;
      }
    }
    
    if (hiddenPlatforms) {
      if (!entity) {
        console.log(
          `[Entity Filter] Entity ${entityId} has no entity registry entry for hidden platform check`
        );
        return false;
      }
      if (entity.platform && hiddenPlatforms.has(entity.platform)) {
        console.log(
          `[Entity Filter] Entity ${entityId} platform ${entity.platform} is in hidden platforms:`,
          Array.from(hiddenPlatforms)
        );
        return false;
      }
    }

    console.log(`[Entity Filter] Entity ${entityId} passed all filters`);
    return true;
  };
};
