import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildMonthList,
  daysInMonth,
  formatDateKey,
  fromMonthIndex,
  getCurrentWeekBounds,
  getLocalDateKey,
  getMonthCountForDateRange,
  getRangeEndDate,
  getRangeStartDate,
  toMonthIndex,
} from "../dist/lib/dateRanges.js";

const fixedNow = new Date(2026, 4, 7, 13, 30, 0);

describe("date range helpers", () => {
  it("formats local date keys", () => {
    assert.equal(formatDateKey(2026, 5, 7), "2026-05-07");
    assert.equal(getLocalDateKey(fixedNow), "2026-05-07");
  });

  it("calculates month indexes round-trip", () => {
    assert.equal(toMonthIndex(2026, 5), 24316);
    assert.deepEqual(fromMonthIndex(24316), { year: 2026, month: 5 });
  });

  it("handles leap-year month lengths", () => {
    assert.equal(daysInMonth(2024, 2), 29);
    assert.equal(daysInMonth(2026, 2), 28);
  });

  it("uses Monday as the current-week start", () => {
    assert.deepEqual(getCurrentWeekBounds(fixedNow), {
      startDate: "2026-05-04",
      endDate: "2026-05-07",
    });
    assert.deepEqual(getCurrentWeekBounds(new Date(2026, 4, 10, 8, 0, 0)), {
      startDate: "2026-05-04",
      endDate: "2026-05-10",
    });
  });

  it("calculates start dates for supported ranges", () => {
    assert.equal(getRangeStartDate("current_week", 2026, 5, fixedNow), "2026-05-04");
    assert.equal(getRangeStartDate("current_month", 2026, 5, fixedNow), "2026-05-01");
    assert.equal(getRangeStartDate("previous_month", 2026, 5, fixedNow), "2026-04-01");
    assert.equal(getRangeStartDate("last_2_months", 2026, 5, fixedNow), "2026-04-01");
    assert.equal(getRangeStartDate("last_6_months", 2026, 5, fixedNow), "2025-12-01");
    assert.equal(getRangeStartDate("last_12_months", 2026, 5, fixedNow), "2025-06-01");
    assert.equal(getRangeStartDate("all", 2026, 5, fixedNow), "2016-06-01");
  });

  it("calculates end dates for active and previous ranges", () => {
    assert.equal(getRangeEndDate("current_month", 2026, 5, fixedNow), "2026-05-07");
    assert.equal(getRangeEndDate("current_week", 2026, 5, fixedNow), "2026-05-07");
    assert.equal(getRangeEndDate("previous_month", 2026, 5, fixedNow), "2026-04-30");
  });

  it("calculates inclusive month counts for date ranges", () => {
    assert.equal(getMonthCountForDateRange("2026-05-01", 2026, 5), 1);
    assert.equal(getMonthCountForDateRange("2026-04-01", 2026, 5), 2);
    assert.equal(getMonthCountForDateRange("2025-12-01", 2026, 5), 6);
  });

  it("builds inclusive month lists and falls back when start is after end", () => {
    assert.deepEqual(buildMonthList({ year: 2026, month: 3 }, { year: 2026, month: 5 }), [
      { year: 2026, month: 3 },
      { year: 2026, month: 4 },
      { year: 2026, month: 5 },
    ]);
    assert.deepEqual(buildMonthList({ year: 2026, month: 6 }, { year: 2026, month: 5 }), [
      { year: 2026, month: 5 },
    ]);
  });
});
