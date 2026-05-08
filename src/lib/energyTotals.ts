import type { DashboardDailyRow, EnergyTotals } from "../types/foxcloud.js";

import { roundEnergy } from "./energyMath.js";

export const buildEnergyTotals = (rows: DashboardDailyRow[]): EnergyTotals => {
  const sum = (key: keyof DashboardDailyRow): number =>
    roundEnergy(rows.reduce((total, row) => total + Number(row[key] ?? 0), 0));

  return {
    solarProductionKwh: sum("pv_production"),
    homeUsageKwh: sum("home_usage"),
    energyGoingIntoBatteryKwh: sum("daily_charged_energy_total"),
    energyComingOutOfBatteryKwh: sum("daily_discharged_energy_total"),
    returnToGridKwh: sum("daily_feedin"),
    gridConsumptionKwh: sum("grid_consumption"),
    selfConsumptionKwh: sum("self_consumption"),
  };
};
