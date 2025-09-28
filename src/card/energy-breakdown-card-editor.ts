import { html, LitElement, nothing, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import memoizeOne from "memoize-one";
import { assert } from "superstruct";
import { configElementStyle, HomeAssistant } from "../ha";
import { CARD_EDITOR_NAME, CARD_NAME } from "./const";
import { HaFormSchema } from "../utils/form/ha-form";
import {
  EnergyBreakdownCardConfig,
  energyBreakdownCardConfigStruct,
} from "./energy-breakdown-card-config";

@customElement(CARD_EDITOR_NAME)
export class EnergyBreakdownCardEditor extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: EnergyBreakdownCardConfig;

  private _schema = memoizeOne(
    () =>
      [
        {
          name: "power_entity",
          selector: {
            entity: {
              filter: [{ domain: "sensor", device_class: "power" }],
            },
          },
        },

        {
          name: "visibility",
          flatten: true,
          type: "expandable",
          iconPath: "mdi:eye-off",
          schema: [
            {
              name: "",
              type: "grid",
              schema: [
                {
                  name: "header_current_show",
                  selector: {
                    boolean: {},
                  },
                },
                {
                  name: "header_day_show",
                  selector: {
                    boolean: {},
                  },
                },
              ],
            },
            {
              name: "",
              type: "grid",
              schema: [
                {
                  name: "header_current_icon",
                  selector: {
                    icon: {},
                  },
                },
                {
                  name: "header_day_icon",
                  selector: {
                    icon: {},
                  },
                },
              ],
            },
            {
              name: "",
              type: "grid",
              schema: [
                {
                  name: "header_current_title_hide",
                  selector: {
                    boolean: {},
                  },
                },
                {
                  name: "header_day_title_hide",
                  selector: {
                    boolean: {},
                  },
                },
              ],
            },
          ],
        },
      ] as const satisfies readonly HaFormSchema[]
  );

  public setConfig(config: EnergyBreakdownCardConfig): void {
    assert(config, energyBreakdownCardConfigStruct);

    this._config = {
      header_current_show: true,
      header_day_show: true,
      ...config,
    };
  }

  protected render() {
    if (!this.hass || !this._config) {
      return nothing;
    }

    const schema = this._schema();

    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${schema}
        .computeLabel=${this._computeLabelCallback}
        .computeHelper=${this._computeHelperCallback}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
  }

  private _valueChanged(ev: CustomEvent): void {
    const newConfig = ev.detail.value as EnergyBreakdownCardConfig;

    const config: EnergyBreakdownCardConfig = {
      ...newConfig,
      type: `custom:${CARD_NAME}`,
    };

    this.dispatchEvent(
      new CustomEvent("config-changed", { detail: { config } })
    );
  }

  private _computeHelperCallback = (
    schema: HaFormSchema
  ): string | undefined => {
    switch (schema.name) {
      case "power_entity":
        return "The entity to use for current power usage";
      case "header_current_icon":
        return "The icon to display for the power entity";
      case "header_day_icon":
        return "The icon to display for the daily energy consumption";
      case "header_current_show":
        return "Show current power usage in the header";
      case "header_day_show":
        return "Show total energy consumption for the day so far";
      case "header_current_title_hide":
        return "Hide the 'Current' label below the power usage display";
      case "header_day_title_hide":
        return "Hide the 'Today' label below the daily energy display";
      default:
        return undefined;
    }
  };

  private _computeLabelCallback = (schema: HaFormSchema) => {
    switch (schema.name) {
      case "power_entity":
        return "Power Entity";
      case "appearance":
        return "Appearance";
      case "visibility":
        return "Header";
      case "header_current_icon":
        return "Power Icon";
      case "header_day_icon":
        return "Today Icon";
      case "header_current_show":
        return "Current";
      case "header_day_show":
        return "Day";
      case "header_current_title_hide":
        return "Hide 'Current'";
      case "header_day_title_hide":
        return "Hide 'Today'";
      default:
        return undefined;
    }
  };

  static get styles() {
    return [
      configElementStyle,
      css`
        ha-form {
          display: block;
          margin-bottom: 24px;
        }
      `,
    ];
  }
}
