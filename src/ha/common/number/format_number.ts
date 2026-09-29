import { FrontendLocaleData, NumberFormat } from "../../data/translation";
import { round } from "./round";

const numberFormatToLocale = (
  localeOptions: FrontendLocaleData
): string | string[] | undefined => {
  switch (localeOptions.number_format) {
    case NumberFormat.comma_decimal:
      return ["en-US", "en"]; // Use United States with fallback to English formatting 1,234,567.89
    case NumberFormat.decimal_comma:
      return ["de", "es", "it"]; // Use German with fallback to Spanish then Italian formatting 1.234.567,89
    case NumberFormat.space_comma:
      return ["fr", "sv", "cs"]; // Use French with fallback to Swedish and Czech formatting 1 234 567,89
    case NumberFormat.system:
      return undefined;
    default:
      return localeOptions.language;
  }
};

const formatWithIntl = (
  value: number,
  locale: string | string[] | undefined,
  options: Intl.NumberFormatOptions
): string => {
  try {
    return new Intl.NumberFormat(locale, options).format(value);
  } catch (err: any) {
    // Don't fail when using "TEST" language
    // eslint-disable-next-line no-console
    console.error(err);

    return new Intl.NumberFormat(undefined, options).format(value);
  }
};

/**
 * Formats a number based on the user's preference with thousands separator(s) and decimal character for better legibility.
 *
 * @param num The number to format
 * @param localeOptions The user-selected language and formatting, from `hass.locale`
 * @param options Intl.NumberFormatOptions to use
 */
export const formatNumber = (
  num: number,
  localeOptions?: FrontendLocaleData,
  options?: Intl.NumberFormatOptions
): string => {
  if (
    localeOptions?.number_format !== NumberFormat.none &&
    !Number.isNaN(num)
  ) {
    return formatWithIntl(
      num,
      localeOptions ? numberFormatToLocale(localeOptions) : undefined,
      { maximumFractionDigits: 2, ...options }
    );
  }

  return `${round(num, options?.maximumFractionDigits).toString()}${
    options?.style === "currency" ? ` ${options.currency}` : ""
  }`;
};

/**
 * Formats a numeric string like `formatNumber`, keeping decimal trailing zeros
 * when no fraction digit options are given. Non-numeric strings are returned as-is.
 */
export const formatNumberString = (
  num: string,
  localeOptions?: FrontendLocaleData,
  options?: Intl.NumberFormatOptions
): string => {
  if (
    localeOptions?.number_format === NumberFormat.none ||
    Number.isNaN(Number(num))
  ) {
    return num;
  }

  const formatOptions: Intl.NumberFormatOptions = {
    maximumFractionDigits: 2,
    ...options,
  };

  // Keep decimal trailing zeros if they are present in a string numeric value
  if (
    !options ||
    (options.minimumFractionDigits === undefined &&
      options.maximumFractionDigits === undefined)
  ) {
    const digits = num.includes(".") ? num.split(".")[1].length : 0;
    formatOptions.minimumFractionDigits = digits;
    formatOptions.maximumFractionDigits = digits;
  }

  return formatWithIntl(
    Number(num),
    localeOptions ? numberFormatToLocale(localeOptions) : undefined,
    formatOptions
  );
};
