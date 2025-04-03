// utils/numberFormatters.ts

import Decimal from "decimal.js";

/**
 * Formats a number into a compact form (e.g., 1K, 1M).
 *
 * @param number - The number to format.
 * @returns The formatted number as a string.
 */
export const compactNumberFormatter = (number?: number | bigint): string =>
  Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 2,
  }).format(number ?? 0);

/**
 * Formats a number with a fixed number of fraction digits.
 *
 * @param number - The number to format.
 * @param fractionDigits - The number of fraction digits (defaults to 2 if not provided).
 * @returns The formatted number as a string.
 */
export const numberFormatter = (number?: number | bigint, fractionDigits?: number): string =>
  Intl.NumberFormat("en-US", {
    notation: "standard",
    minimumFractionDigits: fractionDigits ?? 2,
    maximumFractionDigits: fractionDigits ?? 2,
  }).format(number ?? 0);

/**
 * Formats a number representing latency into seconds.
 *
 * @param number - The latency value to format.
 * @returns The formatted latency as a string with unit "sec".
 */
export const latencyFormatter = (number?: number | bigint): string =>
  Intl.NumberFormat("en-US", {
    style: "unit",
    unit: "second",
    unitDisplay: "narrow",
    notation: "compact",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number ?? 0);

/**
 * Formats a number (or Decimal) as a USD currency string.
 *
 * @param number - The number or Decimal instance to format.
 * @param minimumFractionDigits - The minimum fraction digits (default is 2).
 * @param maximumFractionDigits - The maximum fraction digits (default is 6).
 * @returns The formatted currency string.
 */
export const usdFormatter = (
  number?: number | bigint | Decimal,
  minimumFractionDigits: number = 2,
  maximumFractionDigits: number = 6
): string => {
  const numberToFormat = number instanceof Decimal ? number.toNumber() : number;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(numberToFormat ?? 0);
};

/**
 * Generates a random integer between the specified min and max (inclusive).
 *
 * @param min - The minimum value.
 * @param max - The maximum value.
 * @returns A random integer between min and max.
 */
export function randomIntFromInterval(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
