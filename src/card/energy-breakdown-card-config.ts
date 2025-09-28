import { assign, boolean, object, optional, string } from "superstruct";
import { LovelaceCardConfig } from "../ha";
import { lovelaceCardConfigStruct } from "../shared/config/lovelace-card-config";

export interface EnergyBreakdownCardConfig extends LovelaceCardConfig {
  power_entity?: string;
  power_icon?: string;
  hide_day_total?: boolean;
  hide_current_title?: boolean;
  hide_daily_title?: boolean;
}

export const energyBreakdownCardConfigStruct = assign(
  lovelaceCardConfigStruct,
  object({
    power_entity: optional(string()),
    power_icon: optional(string()),
    hide_day_total: optional(boolean()),
    hide_current_title: optional(boolean()),
    hide_daily_title: optional(boolean()),
  })
);
