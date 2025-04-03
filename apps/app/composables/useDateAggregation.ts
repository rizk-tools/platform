// useDateAggregation.ts
import { addMinutes } from "date-fns";
import { z } from "zod";

// If you don't have a dedicated date picker package in Vue, you can define DateRange:
export interface DateRange {
  from: Date | null;
  to: Date | null;
}

// Replace this with your actual DateTrunc type or adjust as needed.
export type DateTrunc = "minute" | "hour" | "day" | "week" | "month";

// Constant for minutes in a day
const MINUTES_IN_DAY = 24 * 60;

export const DEFAULT_DASHBOARD_AGGREGATION_SELECTION = "24 hours" as const;
export const DASHBOARD_AGGREGATION_PLACEHOLDER = "Custom" as const;

export const DASHBOARD_AGGREGATION_OPTIONS = [
  "5 min",
  "30 min",
  "1 hour",
  "3 hours",
  "24 hours",
  "7 days",
  "1 month",
  "3 months",
  "1 year",
] as const;

export const TABLE_AGGREGATION_OPTIONS = [
  "30 min",
  "1 hour",
  "6 hours",
  "24 hours",
  "3 days",
  "7 days",
  "14 days",
  "1 month",
  "3 months",
  "All time",
] as const;

export type DashboardAggregationOption = (typeof DASHBOARD_AGGREGATION_OPTIONS)[number];
export type TableAggregationOption = (typeof TABLE_AGGREGATION_OPTIONS)[number];

export interface DashboardDateRange {
  from: Date;
  to: Date;
}

export interface TableDateRange {
  from: Date;
}

export type DateRangeAggregationOption = DashboardAggregationOption | TableAggregationOption;
export type DashboardDateRangeOptions =
  | DashboardAggregationOption
  | typeof DASHBOARD_AGGREGATION_PLACEHOLDER;
export type TableDateRangeOptions = TableAggregationOption;

export type DashboardAggregationSettings = Record<
  DashboardAggregationOption,
  {
    date_trunc: DateTrunc;
    minutes: number;
  }
>;

export const dateTimeAggregationOptions = [
  ...TABLE_AGGREGATION_OPTIONS,
  ...DASHBOARD_AGGREGATION_OPTIONS,
] as const;

export const dashboardAggregationSettings: DashboardAggregationSettings = {
  "1 year": {
    date_trunc: "month",
    minutes: 365 * MINUTES_IN_DAY,
  },
  "3 months": {
    date_trunc: "week",
    minutes: 3 * 30 * MINUTES_IN_DAY,
  },
  "1 month": {
    date_trunc: "day",
    minutes: 30 * MINUTES_IN_DAY,
  },
  "7 days": {
    date_trunc: "day",
    minutes: 7 * MINUTES_IN_DAY,
  },
  "24 hours": {
    date_trunc: "hour",
    minutes: 24 * 60,
  },
  "3 hours": {
    date_trunc: "hour",
    minutes: 3 * 60,
  },
  "1 hour": {
    date_trunc: "minute",
    minutes: 60,
  },
  "30 min": {
    date_trunc: "minute",
    minutes: 30,
  },
  "5 min": {
    date_trunc: "minute",
    minutes: 5,
  },
};

export const SelectedTimeOptionSchema = z
  .discriminatedUnion("filterSource", [
    z.object({
      filterSource: z.literal("TABLE"),
      option: z.enum(TABLE_AGGREGATION_OPTIONS),
    }),
    z.object({
      filterSource: z.literal("DASHBOARD"),
      option: z.enum(DASHBOARD_AGGREGATION_OPTIONS),
    }),
  ])
  .optional();

export type SelectedTimeOption = z.infer<typeof SelectedTimeOptionSchema>;

const TABLE_AGGREGATION_SETTINGS = new Map<TableAggregationOption, number | null>([
  ["3 months", 3 * 30 * MINUTES_IN_DAY],
  ["1 month", 30 * MINUTES_IN_DAY],
  ["14 days", 14 * MINUTES_IN_DAY],
  ["7 days", 7 * MINUTES_IN_DAY],
  ["3 days", 3 * MINUTES_IN_DAY],
  ["24 hours", 24 * 60],
  ["6 hours", 6 * 60],
  ["1 hour", 60],
  ["30 min", 30],
  ["All time", null],
]);

/**
 * Checks if a given dashboard aggregation option is available based on the provided day limit.
 *
 * @param option - The dashboard aggregation option.
 * @param limitDays - The limit in days or false if no limit.
 * @returns Whether the option is available.
 */
export const isDashboardOptionAvailable = ({
  option,
  limitDays,
}: {
  option: DashboardAggregationOption;
  limitDays: number | false;
}): boolean => {
  if (limitDays === false) return true;
  const { minutes } = dashboardAggregationSettings[option];
  return limitDays >= minutes / MINUTES_IN_DAY;
};

/**
 * Checks if a given table aggregation option is available based on the provided day limit.
 *
 * @param option - The table aggregation option.
 * @param limitDays - The limit in days or false if no limit.
 * @returns Whether the option is available.
 */
export const isTableOptionAvailable = ({
  option,
  limitDays,
}: {
  option: TableAggregationOption;
  limitDays: number | false;
}): boolean => {
  if (limitDays === false) return true;
  const durationMinutes = TABLE_AGGREGATION_SETTINGS.get(option);
  if (durationMinutes === null || durationMinutes === undefined) return false;
  return limitDays >= durationMinutes / MINUTES_IN_DAY;
};

/**
 * Computes a past date based on the selected time option.
 *
 * @param selectedTimeOption - The selected time option.
 * @returns A Date instance adjusted backwards by the specified minutes or undefined if unavailable.
 */
export const getDateFromOption = (selectedTimeOption: SelectedTimeOption): Date | undefined => {
  if (!selectedTimeOption) return undefined;
  const now = new Date();
  const { filterSource, option } = selectedTimeOption;

  if (filterSource === "TABLE") {
    const minutes = TABLE_AGGREGATION_SETTINGS.get(option);
    if (minutes === undefined || minutes === null) return undefined;
    return addMinutes(now, -minutes);
  }

  if (filterSource === "DASHBOARD") {
    const settings = dashboardAggregationSettings[option as DashboardAggregationOption];
    return addMinutes(now, -settings.minutes);
  }

  return undefined;
};

/**
 * Validates if the provided string is a valid dashboard aggregation option.
 *
 * @param value - The value to validate.
 * @returns True if valid; otherwise, false.
 */
export function isValidDashboardAggregationOption(
  value?: string
): value is DashboardAggregationOption {
  return Boolean(value && (DASHBOARD_AGGREGATION_OPTIONS as readonly string[]).includes(value));
}

/**
 * Validates if the provided string is a valid table aggregation option.
 *
 * @param value - The value to validate.
 * @returns True if valid; otherwise, false.
 */
export function isValidTableAggregationOption(value?: string): value is TableAggregationOption {
  return Boolean(value && (TABLE_AGGREGATION_OPTIONS as readonly string[]).includes(value));
}

/**
 * Finds the closest dashboard aggregation option based on a given date range.
 *
 * @param dateRange - The date range with defined 'from' and 'to' dates.
 * @returns The closest matching dashboard aggregation option or undefined if invalid.
 */
export const findClosestDashboardInterval = (
  dateRange: DateRange
): DashboardAggregationOption | undefined => {
  if (!dateRange.from || !dateRange.to) return undefined;
  const duration = dateRange.to.getTime() - dateRange.from.getTime();

  const diffs = DASHBOARD_AGGREGATION_OPTIONS.map((interval) => {
    const { minutes } = dashboardAggregationSettings[interval];
    return {
      interval,
      diff: Math.abs(duration - minutes * 60 * 1000),
    };
  });

  diffs.sort((a, b) => a.diff - b.diff);
  return diffs[0]?.interval;
};

export default function useDateAggregation() {
  return {
    // Expose constants and functions for use in Vue components
    DEFAULT_DASHBOARD_AGGREGATION_SELECTION,
    DASHBOARD_AGGREGATION_PLACEHOLDER,
    DASHBOARD_AGGREGATION_OPTIONS,
    TABLE_AGGREGATION_OPTIONS,
    dateTimeAggregationOptions,
    dashboardAggregationSettings,
    isDashboardOptionAvailable,
    isTableOptionAvailable,
    getDateFromOption,
    isValidDashboardAggregationOption,
    isValidTableAggregationOption,
    findClosestDashboardInterval,
    SelectedTimeOptionSchema,
  };
}
