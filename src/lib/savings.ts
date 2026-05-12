import type { DashboardDailyRow, SavingsSummary } from "../types/foxcloud.js";

import { roundEnergy } from "./energyMath.js";

export interface ElectricityTariff {
  currency: string;
  peakRate: number;
  offPeakRate: number;
  peakStart: string;
  peakEnd: string;
  feedInRate: number;
}

const parseMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const minutesInWindow = (start: number, end: number): number => {
  if (end >= start) {
    return end - start + 1;
  }

  return 24 * 60 - start + end + 1;
};

const roundMoney = (value: number): number =>
  Math.round((value + Number.EPSILON) * 100) / 100;

export const getWeightedImportRate = (tariff: ElectricityTariff): number => {
  const peakMinutes = minutesInWindow(parseMinutes(tariff.peakStart), parseMinutes(tariff.peakEnd));
  const offPeakMinutes = 24 * 60 - peakMinutes;
  const weightedRate =
    (peakMinutes * tariff.peakRate + offPeakMinutes * tariff.offPeakRate) / (24 * 60);

  return roundEnergy(weightedRate, 4);
};

export const calculateSavings = (
  rows: DashboardDailyRow[],
  tariff: ElectricityTariff,
): SavingsSummary => {
  const avoidedGridImportKwh = roundEnergy(
    rows.reduce(
      (total, row) => total + Math.max(Number(row.home_usage ?? 0) - Number(row.grid_consumption ?? 0), 0),
      0,
    ),
  );
  const exportedKwh = roundEnergy(
    rows.reduce((total, row) => total + Math.max(Number(row.daily_feedin ?? 0), 0), 0),
  );
  const blendedImportRate = getWeightedImportRate(tariff);
  const estimatedSavings = roundMoney(avoidedGridImportKwh * blendedImportRate);
  const exportCredit = roundMoney(exportedKwh * tariff.feedInRate);

  return {
    currency: tariff.currency,
    avoidedGridImportKwh,
    exportedKwh,
    estimatedSavings,
    exportCredit,
    estimatedTotalBenefit: roundMoney(estimatedSavings + exportCredit),
    importRateMode: "weighted_daily_estimate",
    blendedImportRate,
    peakRate: tariff.peakRate,
    offPeakRate: tariff.offPeakRate,
    peakWindow: `${tariff.peakStart}-${tariff.peakEnd}`,
    feedInRate: tariff.feedInRate,
  };
};
