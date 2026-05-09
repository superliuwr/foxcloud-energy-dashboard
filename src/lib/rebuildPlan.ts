import { getRangeEndDate, getRangeStartDate } from "./dateRanges.js";

export type RebuildSource = "foxcloud-history" | "modbus" | "demo";

export interface RebuildPlan {
  requestedDays: number;
  daysToRebuild: number;
  omittedDays: number;
  limited: boolean;
  limitDays: number;
  estimatedHistoryCalls: number;
  source: RebuildSource;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const parseDateKey = (dateKey: string): Date => {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const countInclusiveDays = (startDate: string, endDate: string): number => {
  const start = parseDateKey(startDate).getTime();
  const end = parseDateKey(endDate).getTime();

  if (!Number.isFinite(start) || !Number.isFinite(end) || start > end) {
    return 0;
  }

  return Math.floor((end - start) / MS_PER_DAY) + 1;
};

export const buildRebuildPlan = (
  range: string,
  year: number,
  month: number,
  options: {
    source: RebuildSource;
    limitDays: number;
    now?: Date;
  },
): RebuildPlan => {
  const now = options.now ?? new Date();
  const startDate = getRangeStartDate(range, year, month, now);
  const rawEndDate = getRangeEndDate(range, year, month, now);
  const today = getRangeEndDate("current_month", year, month, now);
  const endDate = rawEndDate > today ? today : rawEndDate;
  const requestedDays = countInclusiveDays(startDate, endDate);
  const daysToRebuild =
    options.source === "foxcloud-history" ? Math.min(requestedDays, options.limitDays) : 0;
  const omittedDays =
    options.source === "foxcloud-history" ? Math.max(0, requestedDays - daysToRebuild) : 0;

  return {
    requestedDays,
    daysToRebuild,
    omittedDays,
    limited: omittedDays > 0,
    limitDays: options.limitDays,
    estimatedHistoryCalls: options.source === "foxcloud-history" ? daysToRebuild : 0,
    source: options.source,
  };
};
