import { html, LitElement, nothing, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import memoizeOne from "memoize-one";
import { assert } from "superstruct";
import { HomeAssistant } from "../ha";
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
          name: "power_icon",
          selector: {
            icon: {},
          },
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
        return "An entity to current power usage";
      case "power_icon":
        return "An icon to display for the power entity";
      default:
        return undefined;
    }
  };

  private _computeLabelCallback = (schema: HaFormSchema) => {
    switch (schema.name) {
      case "power_entity":
        return "Power Entity";
      case "power_icon":
        return "Power Icon";
      default:
        return undefined;
    }
  };

  static get styles() {
    return [
      css`
        ha-form {
          display: block;
          margin-bottom: 24px;
        }
      `,
    ];
  }
}
