import {
  assign,
  boolean,
  defaulted,
  object,
  optional,
  string,
} from "superstruct";
import { LovelaceCardConfig } from "../ha";
import { lovelaceCardConfigStruct } from "../shared/config/lovelace-card-config";

export interface EnergyBreakdownCardConfig extends LovelaceCardConfig {
  power_entity?: string;
  power_icon?: string;
  header_current?: boolean;
  header_day?: boolean;
  today_icon?: string;
  hide_current_title?: boolean;
  hide_daily_title?: boolean;
}

export const energyBreakdownCardConfigStruct = assign(
  lovelaceCardConfigStruct,
  object({
    power_entity: optional(string()),
    power_icon: optional(string()),
    today_icon: optional(string()),
    header_day: optional(defaulted(boolean(), true)),
    header_current: optional(defaulted(boolean(), true)),
    hide_current_title: optional(boolean()),
    hide_daily_title: optional(boolean()),
  })
);
