import { LitElement } from "lit";
import { HomeAssistant } from "../../types";

export function computeRTL(hass: HomeAssistant) {
  const lang = hass.language || "en";
  if (hass.translationMetadata.translations[lang]) {
    return hass.translationMetadata.translations[lang].isRTL || false;
  }
  return false;
}

function computeRTLDirection(hass: HomeAssistant) {
  return emitRTLDirection(computeRTL(hass));
}

function emitRTLDirection(rtl: boolean) {
  return rtl ? "rtl" : "ltr";
}

function computeDirectionStyles(isRTL: boolean, element: LitElement) {
  const direction: string = emitRTLDirection(isRTL);
  setDirectionStyles(direction, element);
}

function setDirectionStyles(direction: string, element: LitElement) {
  element.style.direction = direction;
  element.style.setProperty("--direction", direction);
  element.style.setProperty(
    "--float-start",
    direction === "ltr" ? "left" : "right"
  );
  element.style.setProperty(
    "--float-end",
    direction === "ltr" ? "right" : "left"
  );
}
