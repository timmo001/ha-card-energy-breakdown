import type { LitElement } from "lit";
import { Selector } from "./ha-selector";

interface HaDurationData {
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
}

export type HaFormSchema =
  | HaFormConstantSchema
  | HaFormStringSchema
  | HaFormIntegerSchema
  | HaFormFloatSchema
  | HaFormBooleanSchema
  | HaFormSelectSchema
  | HaFormMultiSelectSchema
  | HaFormTimeSchema
  | HaFormSelector
  | HaFormGridSchema
  | HaFormExpandableSchema
  | HaFormOptionalActionsSchema;

interface HaFormBaseSchema {
  name: string;
  // This value is applied if no data is submitted for this field
  default?: HaFormData;
  required?: boolean;
  disabled?: boolean;
  description?: {
    suffix?: string;
    // This value will be set initially when form is loaded
    suggested_value?: HaFormData;
  };
  context?: Record<string, string>;
}

interface HaFormGridSchema extends HaFormBaseSchema {
  type: "grid";
  flatten?: boolean;
  column_min_width?: string;
  schema: readonly HaFormSchema[];
}

interface HaFormExpandableSchema extends HaFormBaseSchema {
  type: "expandable";
  flatten?: boolean;
  title?: string;
  icon?: string;
  iconPath?: string;
  expanded?: boolean;
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  schema: readonly HaFormSchema[];
}

interface HaFormOptionalActionsSchema extends HaFormBaseSchema {
  type: "optional_actions";
  flatten?: boolean;
  schema: readonly HaFormSchema[];
}

interface HaFormSelector extends HaFormBaseSchema {
  type?: never;
  selector: Selector;
}

interface HaFormConstantSchema extends HaFormBaseSchema {
  type: "constant";
  value?: string;
}

interface HaFormIntegerSchema extends HaFormBaseSchema {
  type: "integer";
  default?: HaFormIntegerData;
  valueMin?: number;
  valueMax?: number;
}

interface HaFormSelectSchema extends HaFormBaseSchema {
  type: "select";
  options: readonly (readonly [string, string])[];
}

interface HaFormMultiSelectSchema extends HaFormBaseSchema {
  type: "multi_select";
  options:
    | Record<string, string>
    | readonly string[]
    | readonly (readonly [string, string])[];
}

interface HaFormFloatSchema extends HaFormBaseSchema {
  type: "float";
}

interface HaFormStringSchema extends HaFormBaseSchema {
  type: "string";
  format?: string;
  autocomplete?: string;
  autofocus?: boolean;
}

interface HaFormBooleanSchema extends HaFormBaseSchema {
  type: "boolean";
}

interface HaFormTimeSchema extends HaFormBaseSchema {
  type: "positive_time_period_dict";
}

// Type utility to unionize a schema array by flattening any grid schemas
type SchemaUnion<
  SchemaArray extends readonly HaFormSchema[],
  Schema = SchemaArray[number],
> = Schema extends
  | HaFormGridSchema
  | HaFormExpandableSchema
  | HaFormOptionalActionsSchema
  ? SchemaUnion<Schema["schema"]> | Schema
  : Schema;

type HaFormDataContainer = Record<string, HaFormData>;

type HaFormData =
  | HaFormStringData
  | HaFormIntegerData
  | HaFormFloatData
  | HaFormBooleanData
  | HaFormSelectData
  | HaFormMultiSelectData
  | HaFormTimeData;

type HaFormStringData = string;
type HaFormIntegerData = number;
type HaFormFloatData = number;
type HaFormBooleanData = boolean;
type HaFormSelectData = string;
type HaFormMultiSelectData = string[];
type HaFormTimeData = HaDurationData;

interface HaFormElement extends LitElement {
  schema: HaFormSchema | readonly HaFormSchema[];
  data?: HaFormDataContainer | HaFormData;
  label?: string;
}
