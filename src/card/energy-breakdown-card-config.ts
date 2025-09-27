import { assign, object, optional, string } from "superstruct";
import { LovelaceCardConfig } from "../ha";
import { lovelaceCardConfigStruct } from "../shared/config/lovelace-card-config";

export interface EnergyBreakdownCardConfig extends LovelaceCardConfig {
  power_entity?: string;
  power_icon?: string;
}

export const energyBreakdownCardConfigStruct = assign(
  lovelaceCardConfigStruct,
  object({
    power_entity: optional(string()),
    power_icon: optional(string()),
  })
);
