import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildEnergyTotals } from "../dist/lib/energyTotals.js";

const makeRow = (overrides = {}) => ({
  day: 1,
  date: "2026-04-01",
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

describe("energy totals helper", () => {
  it("sums dashboard daily rows using the public table columns", () => {
    const totals = buildEnergyTotals([
      makeRow({
        pv_production: 57.09,
        self_consumption: 31.29,
        daily_feedin: 25.8,
        home_usage: 27.4,
        grid_consumption: 0.2,
        daily_charged_energy_total: 11.9,
        daily_discharged_energy_total: 9.9,
      }),
      makeRow({
        pv_production: 58.12,
        self_consumption: 33.14,
        daily_feedin: 24.98,
        home_usage: 30.04,
        grid_consumption: 0.36,
        daily_charged_energy_total: 14.82,
        daily_discharged_energy_total: 11.54,
      }),
    ]);

    assert.deepEqual(totals, {
      solarProductionKwh: 115.21,
      homeUsageKwh: 57.44,
      energyGoingIntoBatteryKwh: 26.72,
      energyComingOutOfBatteryKwh: 21.44,
      returnToGridKwh: 50.78,
      gridConsumptionKwh: 0.56,
      selfConsumptionKwh: 64.43,
    });
  });

  it("rounds floating point sums to two decimals", () => {
    const totals = buildEnergyTotals([
      makeRow({ pv_production: 0.1, home_usage: 0.2 }),
      makeRow({ pv_production: 0.2, home_usage: 0.1 }),
    ]);

    assert.equal(totals.solarProductionKwh, 0.3);
    assert.equal(totals.homeUsageKwh, 0.3);
  });
});
