const validRanges = new Set([
  "current_week",
  "current_month",
  "previous_month",
  "last_2_months",
  "last_3_months",
  "last_6_months",
  "last_12_months",
  "all",
]);

export class BadRequestError extends Error {}

export const parseYear = (value: unknown, fallback: number): number => {
  const year = Number(value ?? fallback);

  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    throw new BadRequestError("year must be an integer between 2000 and 2100.");
  }

  return year;
};

export const parseMonth = (value: unknown, fallback: number): number => {
  const month = Number(value ?? fallback);

  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new BadRequestError("month must be an integer between 1 and 12.");
  }

  return month;
};

export const parseRange = (value: unknown): string => {
  const range = String(value ?? "current_month");

  if (!validRanges.has(range)) {
    throw new BadRequestError("range must be one of the supported dashboard ranges.");
  }

  return range;
};
