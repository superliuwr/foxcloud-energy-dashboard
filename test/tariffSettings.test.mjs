import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  normalizeTariffInput,
  TariffValidationError,
} from "../dist/lib/tariffSettings.js";

const fallback = {
  currency: "AUD",
  peakStart: "15:00",
  peakEnd: "20:59",
  peakRate: 0.3,
  offPeakRate: 0.24,
  feedInRate: 0,
};

describe("tariff settings helpers", () => {
  it("normalizes saved tariff values", () => {
    const tariff = normalizeTariffInput({
      currency: "aud",
      peakStart: "3:05",
      peakEnd: "20:30",
      peakRate: "0.31",
      offPeakRate: "0.245",
      feedInRate: "0.05",
    }, fallback);

    assert.deepEqual(tariff, {
      currency: "AUD",
      peakStart: "03:05",
      peakEnd: "20:30",
      peakRate: 0.31,
      offPeakRate: 0.245,
      feedInRate: 0.05,
    });
  });

  it("uses fallback values for omitted fields", () => {
    assert.deepEqual(normalizeTariffInput({}, fallback), fallback);
  });

  it("rejects invalid clock times and rates", () => {
    assert.throws(
      () => normalizeTariffInput({ peakStart: "25:00" }, fallback),
      TariffValidationError,
    );
    assert.throws(
      () => normalizeTariffInput({ peakRate: -0.1 }, fallback),
      TariffValidationError,
    );
    assert.throws(
      () => normalizeTariffInput({ currency: "A$" }, fallback),
      TariffValidationError,
    );
  });
});
