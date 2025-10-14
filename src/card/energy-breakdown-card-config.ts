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
  hide_background?: boolean;
  header_current_show?: boolean;
  header_day_show?: boolean;
  header_current_icon?: string;
  header_day_icon?: string;
  header_current_title_hide?: boolean;
  header_day_title_hide?: boolean;
  breakdown_show?: boolean;
  breakdown_show_untracked?: boolean;
  breakdown_show_zero_values?: boolean;
  breakdown_sort?: "name-asc" | "name-desc" | "value-asc" | "value-desc";
}

export const energyBreakdownCardConfigStruct = assign(
  lovelaceCardConfigStruct,
  object({
    power_entity: optional(string()),
    hide_background: optional(boolean()),
    header_current_show: optional(defaulted(boolean(), true)),
    header_day_show: optional(defaulted(boolean(), true)),
    header_current_icon: optional(string()),
    header_day_icon: optional(string()),
    header_current_title_hide: optional(boolean()),
    header_day_title_hide: optional(boolean()),
    breakdown_show: optional(defaulted(boolean(), true)),
    breakdown_show_untracked: optional(defaulted(boolean(), true)),
    breakdown_show_zero_values: optional(defaulted(boolean(), false)),
    breakdown_sort: optional(defaulted(string(), "name-asc")),
  })
);
