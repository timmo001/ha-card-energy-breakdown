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
          name: "appearance",
          flatten: true,
          type: "expandable",
          iconPath: "mdi:eye",
          schema: [
            {
              name: "",
              type: "grid",
              schema: [
                {
                  name: "power_icon",
                  selector: {
                    icon: {},
                  },
                },
              ],
            },
          ],
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
                  name: "hide_day_total",
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
                  name: "hide_current_title",
                  selector: {
                    boolean: {},
                  },
                },
                {
                  name: "hide_daily_title",
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
      case "power_icon":
        return "The icon to display for the power entity";
      case "hide_day_total":
        return "Hide total energy consumption for the day so far";
      case "hide_current_title":
        return "Hide the 'Current' label below the power usage display";
      case "hide_daily_title":
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
        return "Visibility";
      case "power_icon":
        return "Power Icon";
      case "hide_day_total":
        return "Hide Day Total";
      case "hide_current_title":
        return "Hide 'Current'";
      case "hide_daily_title":
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
