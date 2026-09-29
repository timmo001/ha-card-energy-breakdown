import { HassEntity } from "home-assistant-js-websocket";

const UNAVAILABLE = "unavailable";

const UNKNOWN = "unknown";

const UNAVAILABLE_STATES = [UNAVAILABLE, UNKNOWN] as const;

// Helper function for literal includes without external dependency
const arrayLiteralIncludes =
  <T extends readonly unknown[]>(array: T) =>
  (value: unknown): value is T[number] =>
    array.some((item) => item === value);

export const isUnavailableState = arrayLiteralIncludes(UNAVAILABLE_STATES);

export function isNumericState(stateObj: HassEntity): boolean {
  const value = Number(stateObj.state);

  return Number.isFinite(value);
}
