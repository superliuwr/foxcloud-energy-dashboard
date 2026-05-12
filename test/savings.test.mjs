import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  calculateSavings,
  getWeightedImportRate,
} from "../dist/lib/savings.js";

const tariff = {
  currency: "AUD",
  peakStart: "15:00",
  peakEnd: "20:59",
  peakRate: 0.3,
  offPeakRate: 0.24,
  feedInRate: 0,
};

const makeRow = (overrides = {}) => ({
  day: 1,
  date: "2026-05-01",
  generation: 0,
  pv_production: 0,
  pv_energy_total: 0,
  daily_feedin: 0,
  self_consumption: 0,
  home_usage: 0,
  grid_consumption: 0,
  daily_charged_energy_total: 0,
  daily_discharged_energy_total: 0,
  solarProductionLabel: "PV produced",
  returnToGridLabel: "Return to grid",
  batteryChargeLabel: "Energy going into the battery",
  batteryDischargeLabel: "Energy coming out of the battery",
  ...overrides,
});

describe("savings helpers", () => {
  it("calculates weighted daily tariff rate from peak and off-peak windows", () => {
    assert.equal(getWeightedImportRate(tariff), 0.255);
  });

  it("estimates avoided import savings from daily dashboard rows", () => {
    const savings = calculateSavings([
      makeRow({ home_usage: 20, grid_consumption: 2, daily_feedin: 5 }),
      makeRow({ home_usage: 10, grid_consumption: 1, daily_feedin: 3 }),
    ], tariff);

    assert.equal(savings.currency, "AUD");
    assert.equal(savings.avoidedGridImportKwh, 27);
    assert.equal(savings.exportedKwh, 8);
    assert.equal(savings.estimatedSavings, 6.89);
    assert.equal(savings.estimatedTotalBenefit, 6.89);
    assert.equal(savings.peakWindow, "15:00-20:59");
  });

  it("adds feed-in credit when a feed-in rate is configured", () => {
    const savings = calculateSavings([
      makeRow({ home_usage: 10, grid_consumption: 5, daily_feedin: 4 }),
    ], {
      ...tariff,
      feedInRate: 0.05,
    });

    assert.equal(savings.estimatedSavings, 1.28);
    assert.equal(savings.exportCredit, 0.2);
    assert.equal(savings.estimatedTotalBenefit, 1.48);
  });
});
