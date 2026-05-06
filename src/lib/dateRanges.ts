export interface YearMonth {
  year: number;
  month: number;
}

export interface DateBounds {
  startDate: string;
  endDate: string;
}

export const daysInMonth = (year: number, month: number): number =>
  new Date(year, month, 0).getDate();

export const formatDateKey = (year: number, month: number, day: number): string =>
  `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

export const getLocalDateKey = (date: Date): string =>
  formatDateKey(date.getFullYear(), date.getMonth() + 1, date.getDate());

export const toMonthIndex = (year: number, month: number): number => year * 12 + month - 1;

export const fromMonthIndex = (monthIndex: number): YearMonth => ({
  year: Math.floor(monthIndex / 12),
  month: (monthIndex % 12) + 1,
});

export const getCurrentWeekBounds = (now = new Date()): DateBounds => {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayOfWeek = start.getDay();
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  start.setDate(start.getDate() - daysSinceMonday);

  return {
    startDate: getLocalDateKey(start),
    endDate: getLocalDateKey(now),
  };
};

export const getRangeStartDate = (
  range: string,
  year: number,
  month: number,
  now = new Date(),
  allMonthCount = 120,
): string => {
  const anchor = toMonthIndex(year, month);

  if (range === "current_week") {
    return getCurrentWeekBounds(now).startDate;
  }

  if (range === "previous_month") {
    const previous = fromMonthIndex(anchor - 1);
    return formatDateKey(previous.year, previous.month, 1);
  }

  const monthCounts: Record<string, number> = {
    current_month: 1,
    last_2_months: 2,
    last_3_months: 3,
    last_6_months: 6,
    last_12_months: 12,
    all: allMonthCount,
  };
  const start = fromMonthIndex(anchor - (monthCounts[range] ?? 1) + 1);

  return formatDateKey(start.year, start.month, 1);
};

export const getRangeEndDate = (
  range: string,
  year: number,
  month: number,
  now = new Date(),
): string => {
  if (range === "previous_month") {
    const previous = fromMonthIndex(toMonthIndex(year, month) - 1);
    return formatDateKey(previous.year, previous.month, daysInMonth(previous.year, previous.month));
  }

  return getLocalDateKey(now);
};

export const getMonthCountForDateRange = (
  startDate: string,
  year: number,
  month: number,
): number => {
  const [startYear, startMonth] = startDate.split("-").map(Number);
  return Math.max(1, toMonthIndex(year, month) - toMonthIndex(startYear, startMonth) + 1);
};

export const buildMonthList = (start: YearMonth, end: YearMonth): YearMonth[] => {
  const startIndex = toMonthIndex(start.year, start.month);
  const endIndex = toMonthIndex(end.year, end.month);

  if (startIndex > endIndex) {
    return [end];
  }

  return Array.from({ length: endIndex - startIndex + 1 }, (_, index) =>
    fromMonthIndex(startIndex + index),
  );
};
