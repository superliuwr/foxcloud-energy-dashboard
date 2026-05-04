import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  BadRequestError,
  parseMonth,
  parseRange,
  parseYear,
} from "../dist/lib/requestParams.js";

describe("request parameter parsing", () => {
  it("accepts valid years and falls back when missing", () => {
    assert.equal(parseYear("2026", 2025), 2026);
    assert.equal(parseYear(undefined, 2025), 2025);
  });

  it("rejects invalid years", () => {
    assert.throws(() => parseYear("abc", 2025), BadRequestError);
    assert.throws(() => parseYear("1999", 2025), BadRequestError);
    assert.throws(() => parseYear("2101", 2025), BadRequestError);
  });

  it("accepts valid months and falls back when missing", () => {
    assert.equal(parseMonth("5", 1), 5);
    assert.equal(parseMonth(undefined, 7), 7);
  });

  it("rejects invalid months", () => {
    assert.throws(() => parseMonth("0", 1), BadRequestError);
    assert.throws(() => parseMonth("13", 1), BadRequestError);
    assert.throws(() => parseMonth("abc", 1), BadRequestError);
  });

  it("accepts supported dashboard ranges", () => {
    assert.equal(parseRange("current_month"), "current_month");
    assert.equal(parseRange("last_12_months"), "last_12_months");
    assert.equal(parseRange("all"), "all");
    assert.equal(parseRange(undefined), "current_month");
  });

  it("rejects unsupported dashboard ranges", () => {
    assert.throws(() => parseRange("everything"), BadRequestError);
    assert.throws(() => parseRange(""), BadRequestError);
  });
});
