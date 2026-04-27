import { ActionConfig } from "../../ha";

export type Selector =
  | ActionSelector
  | AddonSelector
  | AreaSelector
  | AreasDisplaySelector
  | AttributeSelector
  | BooleanSelector
  | ButtonToggleSelector
  | ColorRGBSelector
  | ColorTempSelector
  | ConditionSelector
  | ConversationAgentSelector
  | ConfigEntrySelector
  | ConstantSelector
  | CountrySelector
  | DateSelector
  | DateTimeSelector
  | DeviceSelector
  | FloorSelector
  | LegacyDeviceSelector
  | DurationSelector
  | EntitySelector
  | LegacyEntitySelector
  | FileSelector
  | IconSelector
  | LabelSelector
  | ImageSelector
  | BackgroundSelector
  | LanguageSelector
  | LocationSelector
  | MediaSelector
  | NavigationSelector
  | NumberSelector
  | ObjectSelector
  | AssistPipelineSelector
  | QRCodeSelector
  | SelectSelector
  | SelectorSelector
  | StateSelector
  | StatisticSelector
  | StringSelector
  | STTSelector
  | TargetSelector
  | TemplateSelector
  | ThemeSelector
  | TimeSelector
  | TriggerSelector
  | TTSSelector
  | TTSVoiceSelector
  | UiActionSelector
  | UiColorSelector
  | UiStateContentSelector
  | BackupLocationSelector;

interface ActionSelector {
  action: {} | null;
}

interface AddonSelector {
  addon: {
    name?: string;
    slug?: string;
  } | null;
}

interface AreaSelector {
  area: {
    entity?: EntitySelectorFilter | readonly EntitySelectorFilter[];
    device?: DeviceSelectorFilter | readonly DeviceSelectorFilter[];
    multiple?: boolean;
  } | null;
}

interface AreasDisplaySelector {
  areas_display: {} | null;
}

interface AttributeSelector {
  attribute: {
    entity_id?: string;
    hide_attributes?: readonly string[];
  } | null;
}

interface BooleanSelector {
  boolean: {} | null;
}

interface ButtonToggleSelector {
  button_toggle: {
    options: readonly string[] | readonly SelectOption[];
    translation_key?: string;
    sort?: boolean;
  } | null;
}

interface ColorRGBSelector {
  color_rgb: {} | null;
}

interface ColorTempSelector {
  color_temp: {
    unit?: "kelvin" | "mired";
    min?: number;
    max?: number;
    min_mireds?: number;
    max_mireds?: number;
  } | null;
}

interface ConditionSelector {
  condition: {} | null;
}

interface ConversationAgentSelector {
  conversation_agent: { language?: string } | null;
}

interface ConfigEntrySelector {
  config_entry: {
    integration?: string;
  } | null;
}

interface ConstantSelector {
  constant: {
    value: string | number | boolean;
    label?: string;
    translation_key?: string;
  } | null;
}

interface CountrySelector {
  country: {
    countries: string[];
    no_sort?: boolean;
  } | null;
}

interface DateSelector {
  date: {} | null;
}

interface DateTimeSelector {
  datetime: {} | null;
}

interface DeviceSelectorFilter {
  integration?: string;
  manufacturer?: string;
  model?: string;
  model_id?: string;
}

interface DeviceSelector {
  device: {
    filter?: DeviceSelectorFilter | readonly DeviceSelectorFilter[];
    entity?: EntitySelectorFilter | readonly EntitySelectorFilter[];
    multiple?: boolean;
  } | null;
}

interface FloorSelector {
  floor: {
    entity?: EntitySelectorFilter | readonly EntitySelectorFilter[];
    device?: DeviceSelectorFilter | readonly DeviceSelectorFilter[];
    multiple?: boolean;
  } | null;
}

interface LegacyDeviceSelector {
  device: DeviceSelector["device"] & {
    /**
     * @deprecated Use filter instead
     */
    integration?: DeviceSelectorFilter["integration"];
    /**
     * @deprecated Use filter instead
     */
    manufacturer?: DeviceSelectorFilter["manufacturer"];
    /**
     * @deprecated Use filter instead
     */
    model?: DeviceSelectorFilter["model"];
  };
}

interface DurationSelector {
  duration: {
    enable_day?: boolean;
    enable_millisecond?: boolean;
  } | null;
}

interface EntitySelectorFilter {
  integration?: string;
  domain?: string | readonly string[];
  device_class?: string | readonly string[];
  supported_features?: number | [number];
}

interface EntitySelector {
  entity: {
    multiple?: boolean;
    include_entities?: string[];
    exclude_entities?: string[];
    filter?: EntitySelectorFilter | readonly EntitySelectorFilter[];
  } | null;
}

interface LegacyEntitySelector {
  entity: EntitySelector["entity"] & {
    /**
     * @deprecated Use filter instead
     */
    integration?: EntitySelectorFilter["integration"];
    /**
     * @deprecated Use filter instead
     */
    domain?: EntitySelectorFilter["domain"];
    /**
     * @deprecated Use filter instead
     */
    device_class?: EntitySelectorFilter["device_class"];
  };
}

interface StatisticSelector {
  statistic: {
    device_class?: string;
    multiple?: boolean;
  };
}

interface FileSelector {
  file: {
    accept: string;
  } | null;
}

interface IconSelector {
  icon: {
    placeholder?: string;
    fallbackPath?: string;
  } | null;
}

interface CropOptions {
  round: boolean;
  type?: "image/jpeg" | "image/png";
  quality?: number;
  aspectRatio?: number;
}

interface ImageSelector {
  image: { original?: boolean; crop?: CropOptions } | null;
}

interface BackgroundSelector {
  background: { original?: boolean; crop?: CropOptions } | null;
}

interface LabelSelector {
  label: {
    multiple?: boolean;
  };
}

interface LanguageSelector {
  language: {
    languages?: string[];
    native_name?: boolean;
    no_sort?: boolean;
  } | null;
}

interface LocationSelector {
  location: {
    radius?: boolean;
    radius_readonly?: boolean;
    icon?: string;
  } | null;
}

interface LocationSelectorValue {
  latitude: number;
  longitude: number;
  radius?: number;
}

interface MediaSelector {
  media: {} | null;
}

interface MediaSelectorValue {
  entity_id?: string;
  media_content_id?: string;
  media_content_type?: string;
  metadata?: {
    title?: string;
    thumbnail?: string | null;
    media_class?: string;
    children_media_class?: string | null;
    navigateIds?: { media_content_type: string; media_content_id: string }[];
  };
}

interface NavigationSelector {
  navigation: {} | null;
}

interface NumberSelector {
  number: {
    min?: number;
    max?: number;
    step?: number | "any";
    mode?: "box" | "slider";
    unit_of_measurement?: string;
    slider_ticks?: boolean;
  } | null;
}

interface ObjectSelector {
  object: {} | null;
}

interface AssistPipelineSelector {
  assist_pipeline: {
    include_last_used?: boolean;
  } | null;
}

interface SelectBoxOptionImage {
  src: string;
  src_dark?: string;
  flip_rtl?: boolean;
}

interface SelectOption {
  value: any;
  label: string;
  description?: string;
  image?: string | SelectBoxOptionImage;
  disabled?: boolean;
}

interface SelectSelector {
  select: {
    multiple?: boolean;
    custom_value?: boolean;
    mode?: "list" | "dropdown" | "box";
    options: readonly string[] | readonly SelectOption[];
    translation_key?: string;
    sort?: boolean;
    reorder?: boolean;
    box_max_columns?: number;
  } | null;
}

interface SelectorSelector {
  selector: {} | null;
}

interface StateSelector {
  state: {
    extra_options?: { label: string; value: any }[];
    entity_id?: string;
    attribute?: string;
  } | null;
}

interface BackupLocationSelector {
  backup_location: {} | null;
}

interface QRCodeSelector {
  qr_code: {
    data: string;
    scale?: number;
    error_correction_level?: "low" | "medium" | "quartile" | "high";
    center_image?: string;
  } | null;
}

interface StringSelector {
  text: {
    multiline?: boolean;
    type?:
      | "number"
      | "text"
      | "search"
      | "tel"
      | "url"
      | "email"
      | "password"
      | "date"
      | "month"
      | "week"
      | "time"
      | "datetime-local"
      | "color";
    prefix?: string;
    suffix?: string;
    autocomplete?: string;
    multiple?: true;
  } | null;
}

interface STTSelector {
  stt: { language?: string } | null;
}

interface TargetSelector {
  target: {
    entity?: EntitySelectorFilter | readonly EntitySelectorFilter[];
    device?: DeviceSelectorFilter | readonly DeviceSelectorFilter[];
  } | null;
}

interface TemplateSelector {
  template: {} | null;
}

interface ThemeSelector {
  theme: { include_default?: boolean } | null;
}
interface TimeSelector {
  time: { no_second?: boolean } | null;
}

interface TriggerSelector {
  trigger: {} | null;
}

interface TTSSelector {
  tts: { language?: string } | null;
}

interface TTSVoiceSelector {
  tts_voice: { engineId?: string; language?: string } | null;
}

type UiAction = Exclude<ActionConfig["action"], "fire-dom-event">;

interface UiActionSelector {
  ui_action: {
    actions?: UiAction[];
    default_action?: UiAction;
  } | null;
}

interface UiColorSelector {
  ui_color: {
    default_color?: string;
    include_none?: boolean;
    include_state?: boolean;
  } | null;
}

interface UiStateContentSelector {
  ui_state_content: {
    entity_id?: string;
    allow_name?: boolean;
  } | null;
}
