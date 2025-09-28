import { css, CSSResultGroup, html, nothing, PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import memoizeOne from "memoize-one";
import { assert } from "superstruct";
import {
  computeAreaName,
  fireEvent,
  formatNumber,
  generateEntityFilter,
  haStyleScrollbar,
  HomeAssistant,
  isNumericState,
  LovelaceCard,
  LovelaceCardEditor,
} from "../ha";
import { BaseElement } from "../utils/base-element";
import { cardStyle } from "../utils/card-styles";
import { registerCustomCard } from "../utils/custom-cards";
import {
  CARD_DESCRIPTION,
  CARD_NAME_FRIENDLY,
  CARD_EDITOR_NAME,
  CARD_NAME,
} from "./const";
import {
  EnergyBreakdownCardConfig,
  energyBreakdownCardConfigStruct,
} from "./energy-breakdown-card-config";

interface Breakdown {
  id: string;
  name: string;
  value: number;
}

declare global {
  interface HASSDomEvents {
    "hass-more-info": { entityId: string };
  }
}

registerCustomCard({
  type: CARD_NAME,
  name: CARD_NAME_FRIENDLY,
  description: CARD_DESCRIPTION,
});

@customElement(CARD_NAME)
export class EnergyBreakdownCard extends BaseElement implements LovelaceCard {
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    await import("./energy-breakdown-card-editor");
    return document.createElement(CARD_EDITOR_NAME) as LovelaceCardEditor;
  }

  public setConfig(config: EnergyBreakdownCardConfig): void {
    assert(config, energyBreakdownCardConfigStruct);
    this._config = {
      header_current_show: true,
      header_day_show: true,
      breakdown_show_untracked: true,
      breakdown_show_zero_values: false,
      breakdown_sort: "name-asc",
      ...config,
    };
    if (this.hass && this._config?.header_day_show) {
      this._fetchDayTotal();
    }
    setTimeout(() => this.requestUpdate(), 0);
  }

  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private _config?: any;

  protected willUpdate(changedProps: PropertyValues): void {
    super.willUpdate(changedProps);
    if (
      (changedProps.has("hass") || changedProps.has("_config")) &&
      this._config?.header_day_show &&
      this.hass
    ) {
      this._fetchDayTotal();
    }
  }

  @state() private _navigationStack: {
    type: "area" | "entity";
    id?: string;
    name?: string;
  }[] = [];

  @state() private _currentView: "areas" | "entities" = "areas";

  @state() private _dayTotal: number | null = null;

  public static async getStubConfig(
    hass: HomeAssistant
  ): Promise<EnergyBreakdownCardConfig> {
    const powerSensors = Object.keys(hass.states).filter(
      generateEntityFilter(hass, {
        domain: "sensor",
        device_class: "power",
      })
    );
    if (powerSensors.length === 0) {
      return { type: `custom:${CARD_NAME}` };
    }

    const validStates = powerSensors
      .map((id) => hass.states[id])
      .filter((st) => st && isNumericState(st) && !isNaN(Number(st.state)));
    if (validStates.length === 0) {
      return { type: `custom:${CARD_NAME}` };
    }

    const highest = validStates.reduce((best, st) =>
      Number(st.state) > Number(best.state) ? st : best
    );

    return {
      type: `custom:${CARD_NAME}`,
      power_entity: highest.entity_id,
    };
  }

  public getCardSize(): number {
    return 3;
  }

  private async _fetchDayTotal(): Promise<void> {
    if (!this._config?.header_day_show || !this.hass) {
      this._dayTotal = null;
      return;
    }

    try {
      // Get all energy sensors (device_class: energy, state_class: total_increasing)
      const energySensors = Object.keys(this.hass.states).filter((entityId) => {
        const state = this.hass.states[entityId];
        return (
          state &&
          state.attributes.device_class === "energy" &&
          state.attributes.state_class === "total_increasing"
        );
      });

      if (energySensors.length === 0) {
        this._dayTotal = null;
        return;
      }

      // Get start of current day
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      // Fetch statistics for today using WebSocket API
      const stats = await this.hass.callWS<{
        [entityId: string]: Array<{
          start: number;
          end: number;
          change?: number | null;
        }>;
      }>({
        type: "recorder/statistics_during_period",
        start_time: startOfDay.toISOString(),
        end_time: new Date().toISOString(),
        statistic_ids: energySensors,
        period: "hour",
        units: { energy: "kWh" },
        types: ["change"],
      });

      // Calculate total energy consumption for the day
      let totalEnergy = 0;
      for (const entityStats of Object.values(stats)) {
        for (const stat of entityStats) {
          if (stat.change !== null && stat.change !== undefined) {
            totalEnergy += stat.change;
          }
        }
      }

      this._dayTotal = totalEnergy;
    } catch (error) {
      console.error("Error fetching day total energy:", error);
      this._dayTotal = null;
    }
  }

  public getGridOptions(): any {
    return {
      columns: 6,
      rows: 3,
      min_columns: 4,
      min_rows: 1,
    };
  }

  protected render() {
    if (!this._config || !this.hass) {
      return nothing;
    }

    const entityId = this._config.power_entity;
    const currentStateObj = entityId ? this.hass.states[entityId] : undefined;

    const powerEntityCompatible = currentStateObj
      ? currentStateObj.attributes.device_class === "power"
      : true;
    if (!powerEntityCompatible) {
      return html`<ha-alert alert-type="error">
        Invalid power entity
      </ha-alert>`;
    }

    const uom = currentStateObj?.attributes.unit_of_measurement;
    const powerEntityIcon = this._config.header_current_icon?.length
      ? this._config.header_current_icon
      : "mdi:lightning-bolt";

    const todayIcon = this._config.header_day_icon?.length
      ? this._config.header_day_icon
      : "mdi:calendar-today";

    const _computeBreakdown = memoizeOne(
      (
        hass: any,
        powerEntityId?: string,
        powerEntityState?: string,
        config?: any
      ): Breakdown[] => {
        let breakdowns = Object.values(hass.areas)
          .map((area: any): Breakdown | null => {
            const areaName = computeAreaName(area);
            if (!areaName) {
              return null;
            }

            const powerEntityIds = Object.keys(hass.states).filter(
              generateEntityFilter(hass, {
                domain: "sensor",
                device_class: "power",
                area: area.area_id,
              })
            );

            const validPowerEntities = powerEntityIds
              .map((id) => hass.states[id])
              .filter(
                (st) =>
                  st &&
                  st.entity_id !== powerEntityId &&
                  isNumericState(st) &&
                  !isNaN(Number(st.state))
              );

            const sum = validPowerEntities.reduce(
              (acc, entity) => acc + Number(entity.state),
              0
            );

            // Only show areas that have power sensors
            if (validPowerEntities.length > 0) {
              return {
                id: area.area_id,
                name: areaName,
                value: sum,
              };
            }

            return null;
          })
          .filter((bd): bd is Breakdown => bd !== null);

        if (powerEntityState && config?.breakdown_show_untracked !== false) {
          const untrackedValue =
            Number(powerEntityState) -
            breakdowns.reduce((acc, bd) => acc + bd.value, 0);
          if (untrackedValue > 0 || config?.breakdown_show_zero_values) {
            breakdowns.push({
              id: "untracked",
              name: "Untracked",
              value: untrackedValue,
            });
          }
        }

        // Filter out zero values if option is disabled
        if (config?.breakdown_show_zero_values === false) {
          breakdowns = breakdowns.filter((bd) => bd.value > 0);
        }

        // Sort breakdowns
        const sortOption = config?.breakdown_sort || "name-asc";
        const [sortBy, sortOrder] = sortOption.split("-");

        breakdowns.sort((a, b) => {
          let comparison = 0;
          if (sortBy === "value") {
            comparison = a.value - b.value;
          } else {
            comparison = a.name.localeCompare(b.name);
          }
          return sortOrder === "desc" ? -comparison : comparison;
        });

        return breakdowns;
      }
    );

    const breakdown = _computeBreakdown(
      this.hass,
      entityId,
      currentStateObj?.state,
      this._config
    );
    const gridRows = Number(this._config.grid_options?.rows ?? 3);

    const _computeEntityBreakdown = memoizeOne(
      (
        hass: any,
        areaId: string,
        powerEntityId?: string,
        config?: any
      ): Breakdown[] => {
        const powerEntityIds = Object.keys(hass.states).filter(
          generateEntityFilter(hass, {
            domain: "sensor",
            device_class: "power",
            area: areaId,
          })
        );

        const validPowerEntities = powerEntityIds
          .map((id) => hass.states[id])
          .filter(
            (st) =>
              st &&
              st.entity_id !== powerEntityId &&
              isNumericState(st) &&
              !isNaN(Number(st.state))
          );

        let entities = validPowerEntities.map((entity) => ({
          id: entity.entity_id,
          name: hass.states[entity.entity_id]?.attributes.friendly_name ?? "",
          value: Number(entity.state),
        }));

        // Filter out zero values if option is disabled
        if (config?.breakdown_show_zero_values === false) {
          entities = entities.filter((entity) => entity.value > 0);
        }

        return entities.sort((a, b) => b.value - a.value);
      }
    );

    const currentNavigation =
      this._navigationStack[this._navigationStack.length - 1];
    const showBackButton =
      this._currentView === "entities" && currentNavigation;

    return html`<ha-card>
      ${this._config?.header_current_show || this._config?.header_day_show
        ? html`
            <div
              class=${classMap({
                heading: true,
                "reduced-padding": gridRows < 3,
                "single-row": gridRows === 1,
                "with-day-total": this._config?.header_day_show,
              })}
              @click=${this._handleHeadingClick}
            >
              ${this._config?.header_current_show
                ? html`
                    <div class="power-section">
                      <div class="section-value">
                        <ha-icon
                          class="icon"
                          .icon=${powerEntityIcon}
                        ></ha-icon>
                        <span class="value"
                          >${currentStateObj
                            ? formatNumber(
                                currentStateObj.state,
                                this.hass.locale,
                                {
                                  maximumFractionDigits: 1,
                                }
                              )
                            : "--.-"}</span
                        >
                        <span class="measurement"
                          >${currentStateObj ? uom : "W"}</span
                        >
                      </div>
                      ${!this._config?.header_current_title_hide
                        ? html`<div class="section-label">Current</div>`
                        : nothing}
                    </div>
                  `
                : nothing}
              ${this._config?.header_day_show
                ? html`
                    <div class="day-total-section">
                      <div class="section-value">
                        <ha-icon class="icon" .icon=${todayIcon}></ha-icon>
                        <span class="value"
                          >${this._dayTotal !== null
                            ? formatNumber(this._dayTotal, this.hass.locale, {
                                maximumFractionDigits: 1,
                              })
                            : "--.-"}</span
                        >
                        <span class="measurement">kWh</span>
                      </div>
                      ${!this._config?.header_day_title_hide
                        ? html`<div class="section-label">Today</div>`
                        : nothing}
                    </div>
                  `
                : nothing}
            </div>
          `
        : nothing}
      ${gridRows > 1 || !currentStateObj
        ? html`
            <div class="breakdown ha-scrollbar">
              ${showBackButton
                ? html`
                    <div class="navigation-header">
                      <ha-icon-button-arrow-prev
                        @click=${this._goBack}
                        .hass=${this.hass}
                      ></ha-icon-button-arrow-prev>
                      <span class="navigation-title"
                        >${currentNavigation?.name}</span
                      >
                    </div>
                  `
                : nothing}
              <ha-md-list>
                ${this._currentView === "areas"
                  ? breakdown.map(
                      (area, idx) => html`
                        ${breakdown.length > 1 &&
                        idx === breakdown.length - 1 &&
                        area.id !== "untracked"
                          ? html`<ha-md-divider
                              role="separator"
                              tabindex="-1"
                            ></ha-md-divider>`
                          : nothing}
                        <ha-md-list-item
                          class=${classMap({
                            "untracked-item": area.id === "untracked",
                          })}
                          type="button"
                          @click=${area.id !== "untracked"
                            ? this._createAreaClickHandler(area)
                            : undefined}
                        >
                          <span slot="headline">${area.name}</span>
                          <span class="meta" slot="end"
                            >${formatNumber(area.value, this.hass.locale, {
                              maximumFractionDigits: 1,
                            })}
                            W</span
                          >
                        </ha-md-list-item>
                      `
                    )
                  : currentNavigation?.id
                    ? _computeEntityBreakdown(
                        this.hass,
                        currentNavigation.id,
                        entityId,
                        this._config
                      ).map(
                        (entity) => html`
                          <ha-md-list-item
                            type="button"
                            @click=${this._createEntityClickHandler(entity)}
                          >
                            <span slot="headline">${entity.name}</span>
                            <span class="meta" slot="end"
                              >${formatNumber(entity.value, this.hass.locale, {
                                maximumFractionDigits: 1,
                              })}
                              ${uom ?? ""}</span
                            >
                          </ha-md-list-item>
                        `
                      )
                    : nothing}
              </ha-md-list>
            </div>
          `
        : nothing}
    </ha-card>`;
  }

  private _handleHeadingClick(): void {
    if (!this._config?.power_entity) return;
    fireEvent(this, "hass-more-info", { entityId: this._config.power_entity });
  }

  private _handleAreaClick(area: Breakdown): void {
    if (area.id === "untracked") return;

    this._navigationStack.push({
      type: "area",
      id: area.id,
      name: area.name,
    });
    this._currentView = "entities";
  }

  private _handleEntityClick(entity: Breakdown): void {
    if (!entity.id) return;
    fireEvent(this, "hass-more-info", { entityId: entity.id });
  }

  private _createAreaClickHandler(area: Breakdown) {
    return () => this._handleAreaClick(area);
  }

  private _createEntityClickHandler(entity: Breakdown) {
    return () => this._handleEntityClick(entity);
  }

  private _goBack(): void {
    if (this._navigationStack.length > 0) {
      this._navigationStack.pop();
      this._currentView = "areas";
    }
  }

  static get styles(): CSSResultGroup {
    return [
      super.styles,
      cardStyle,
      haStyleScrollbar,
      css`
        ha-card {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          gap: 8px;
        }

        .heading {
          width: fit-content;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px 12px 0;
          gap: 2px;
          pointer-events: all;
          cursor: pointer;
          line-height: var(--ha-line-height-normal);
        }

        .heading.with-day-total {
          justify-content: space-around;
          width: 100%;
          gap: 16px;
        }

        .power-section,
        .day-total-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .section-label {
          font-size: var(--ha-font-size-body-2);
          color: var(--secondary-text-color);
          line-height: var(--ha-line-height-body-2);
          text-align: center;
        }

        .section-value {
          display: flex;
          align-items: center;
          gap: 2px;
        }

        .section-value .icon {
          --mdc-icon-size: var(--ha-font-size-3xl);
        }

        .section-value .value {
          font-size: var(--ha-font-size-5xl);
          font-weight: var(--ha-font-weight-light);
          color: var(--primary-text-color);
        }

        .section-value .measurement {
          padding-bottom: 10px;
          align-self: flex-end;
          font-size: var(--ha-font-size-xl);
          color: var(--secondary-text-color);
        }
        .heading.reduced-padding {
          padding: 8px 8px 0;
        }
        .heading.reduced-padding {
          line-height: var(--ha-line-height-condensed);
        }

        .heading .icon {
          --mdc-icon-size: var(--ha-font-size-3xl);
        }
        .heading.single-row .icon {
          --mdc-icon-size: var(--ha-font-size-2xl);
        }

        .heading .value {
          font-size: var(--ha-font-size-5xl);
          font-weight: var(--ha-font-weight-light);
        }
        .heading.single-row .value {
          font-size: var(--ha-font-size-4xl);
        }

        .heading .measurement {
          padding-bottom: 10px;
          align-self: flex-end;
          font-size: var(--ha-font-size-xl);
          color: var(--secondary-text-color);
        }
        .heading.single-row .measurement {
          padding-bottom: 8px;
          font-size: var(--ha-font-size-l);
        }

        .breakdown {
          flex: 1 1 auto;
          min-height: 0;
          overflow: auto;
          width: 100%;
        }

        .breakdown ha-md-list {
          --md-list-item-label-text-line-height: var(
            --ha-line-height-condensed
          );
          --md-list-item-one-line-container-height: 16px;
          --md-list-item-top-space: 8px;
          --md-list-item-bottom-space: 8px;
          padding: 0;
        }

        .breakdown ha-md-list-item.untracked-item {
          pointer-events: none;
        }

        .navigation-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 8px 2px;
          border-bottom: 1px solid var(--divider-color);
          background-color: var(--card-background-color);
          position: sticky;
          top: 0;
          z-index: 1;
        }

        .navigation-header ha-icon-button-arrow-prev {
          --mdc-icon-button-size: 32px;
          --mdc-icon-size: 20px;
        }

        .navigation-title {
          font-size: var(--ha-font-size-body-1);
          font-weight: var(--ha-font-weight-medium);
          color: var(--primary-text-color);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          flex: 1;
        }

        .meta {
          color: var(--secondary-text-color);
        }
      `,
    ];
  }
}

console.log("%c ⚡ Energy Breakdown Card", "color: #007bff; font-weight: bold");
