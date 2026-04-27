import { env } from "../config/env.js";
import { FoxCloudApiError, FoxCloudClient } from "../lib/foxcloudClient.js";
import type {
  DashboardDailyRow,
  DashboardPayload,
  EnergyRangePayload,
  EnergyTotals,
  FoxCloudDevice,
  FoxCloudHistoryDeviceResult,
  FoxCloudHistorySeries,
  FoxCloudRealtimeDataPoint,
  FoxCloudReportSeries,
} from "../types/foxcloud.js";
import { readLatestDashboardPayload, saveDashboardPayload } from "./cacheStore.js";
import {
  getLatestDailyEnergyUpdate,
  readDailyEnergyRowsByMonth,
  saveDailyEnergyRows,
} from "./sqliteStore.js";

const LIVE_VARIABLES = [
  "pvPower",
  "loadsPower",
  "feedinPower",
  "gridConsumptionPower",
  "batChargePower",
  "batDischargePower",
  "SoC",
  "SoC_1",
  "batTemperature",
  "batTemperature_1",
  "batTemperature_2",
  "invTemperation",
  "inverterTemperature",
] as const;

const REPORT_VARIABLES = [
  "generation",
  "PVEnergyTotal",
  "feedin",
  "loads",
  "gridConsumption",
  "chargeEnergyToTal",
  "dischargeEnergyToTal",
] as const;

const HISTORY_VARIABLES = ["SoC_1", "SoC", "loadsPower", "batDischargePower"] as const;
const ENERGY_HISTORY_VARIABLES = [
  "pvPower",
  "loadsPower",
  "feedinPower",
  "gridConsumptionPower",
  "batChargePower",
  "batDischargePower",
  "generation",
  "PVEnergyTotal",
  "feedin",
  "loads",
  "gridConsumption",
  "chargeEnergyToTal",
  "dischargeEnergyToTal",
] as const;
const CURRENT_MONTH_CACHE_TTL_MS = 10 * 60 * 1000;

const client = new FoxCloudClient({
  apiKey: env.foxCloud.apiKey,
  baseUrl: env.foxCloud.baseUrl,
  timeoutMs: env.foxCloud.timeoutMs,
});

const round = (value: number | null | undefined, decimals = 2): number => {
  const normalized = Number(value ?? 0);
  return Number(normalized.toFixed(decimals));
};

const toStatus = (status: 1 | 2 | 3): "online" | "fault" | "offline" => {
  if (status === 1) {
    return "online";
  }

  if (status === 2) {
    return "fault";
  }

  return "offline";
};

const isValidYearMonth = (year: number, month: number): boolean =>
  Number.isInteger(year) && Number.isInteger(month) && year >= 2020 && month >= 1 && month <= 12;

const daysInMonth = (year: number, month: number): number => new Date(year, month, 0).getDate();

const formatDateKey = (year: number, month: number, day: number): string =>
  `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

const toMonthIndex = (year: number, month: number): number => year * 12 + month - 1;

const fromMonthIndex = (monthIndex: number): { year: number; month: number } => ({
  year: Math.floor(monthIndex / 12),
  month: (monthIndex % 12) + 1,
});

const getRealtimeValue = (data: FoxCloudRealtimeDataPoint[], variable: string): number | null => {
  const match = data.find((item) => item.variable === variable);
  return typeof match?.value === "number" ? match.value : null;
};

const getFirstRealtimeValue = (
  data: FoxCloudRealtimeDataPoint[],
  variables: readonly string[],
): number | null => {
  for (const variable of variables) {
    const value = getRealtimeValue(data, variable);

    if (value !== null) {
      return value;
    }
  }

  return null;
};

const getRealtimeTime = (data: FoxCloudRealtimeDataPoint[]): string | null => {
  return data[0]?.time ?? null;
};

const getSeriesValue = (
  seriesMap: Map<string, FoxCloudReportSeries>,
  variable: string,
  index: number,
): number => {
  const series = seriesMap.get(variable);
  const value = series?.values[index];
  return typeof value === "number" ? round(value) : 0;
};

const findHistorySeries = (
  series: FoxCloudHistorySeries[],
  variables: readonly string[],
): FoxCloudHistorySeries | null => {
  return series.find((item) => variables.includes(item.variable)) ?? null;
};

const toTimeLabel = (rawTime: string): string => {
  const match = rawTime.match(/\b(\d{2}:\d{2}):\d{2}\b/);
  return match?.[1] ?? rawTime;
};

const parseHistoryTime = (rawTime: string): number => {
  const match = rawTime.match(
    /(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/,
  );

  if (!match) {
    const fallback = new Date(rawTime).getTime();
    return Number.isNaN(fallback) ? 0 : fallback;
  }

  const [, year, month, day, hour, minute, second = "0"] = match;
  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
  ).getTime();
};

const getLocalDateKey = (date: Date): string =>
  formatDateKey(date.getFullYear(), date.getMonth() + 1, date.getDate());

const parseYearMonthFromText = (value: string | null | undefined): { year: number; month: number } | null => {
  const match = value?.match(/(\d{4})-(\d{2})/);

  if (!match) {
    return null;
  }

  return {
    year: Number(match[1]),
    month: Number(match[2]),
  };
};

const isCurrentMonth = (year: number, month: number): boolean => {
  const now = new Date();
  return now.getFullYear() === year && now.getMonth() + 1 === month;
};

const expectedCachedRowsForMonth = (year: number, month: number): number => {
  if (isCurrentMonth(year, month)) {
    return new Date().getDate();
  }

  return daysInMonth(year, month);
};

const isFreshCurrentMonthCache = (deviceSn: string, year: number, month: number): boolean => {
  if (!isCurrentMonth(year, month)) {
    return true;
  }

  const latestUpdate = getLatestDailyEnergyUpdate(deviceSn, year, month);

  if (!latestUpdate) {
    return false;
  }

  return Date.now() - new Date(latestUpdate).getTime() < CURRENT_MONTH_CACHE_TTL_MS;
};

const getHistorySeries = (
  historyResults: FoxCloudHistoryDeviceResult[],
  variable: string,
): FoxCloudHistorySeries | null => {
  const series = historyResults[0]?.datas ?? [];
  return series.find((item) => item.variable === variable || item.variable === `${variable}_1`) ?? null;
};

const getHistoryPointsSince = (series: FoxCloudHistorySeries | null, sinceMs: number) => {
  return (series?.data ?? [])
    .map((point) => ({
      timeMs: parseHistoryTime(point.time),
      value: Number(point.value),
    }))
    .filter((point) => point.timeMs >= sinceMs && Number.isFinite(point.value))
    .sort((first, second) => first.timeMs - second.timeMs);
};

const getCumulativeDeltaSince = (
  historyResults: FoxCloudHistoryDeviceResult[],
  variable: string,
  sinceMs: number,
): number => {
  const points = getHistoryPointsSince(getHistorySeries(historyResults, variable), sinceMs);

  if (points.length < 2) {
    return 0;
  }

  return round(Math.max(points[points.length - 1].value - points[0].value, 0));
};

const integratePowerSince = (
  historyResults: FoxCloudHistoryDeviceResult[],
  variable: string,
  sinceMs: number,
): number => {
  const points = getHistoryPointsSince(getHistorySeries(historyResults, variable), sinceMs);

  if (points.length < 2) {
    return 0;
  }

  const totalKwh = points.slice(1).reduce((total, point, index) => {
    const previous = points[index];
    const hours = (point.timeMs - previous.timeMs) / 3_600_000;
    const averageKw = (Math.max(previous.value, 0) + Math.max(point.value, 0)) / 2;
    return total + averageKw * hours;
  }, 0);

  return round(totalKwh);
};

const buildLast24Hours = (historyResults: FoxCloudHistoryDeviceResult[]): DashboardPayload["last24Hours"] => {
  const series = historyResults[0]?.datas ?? [];
  const batteryLevel = findHistorySeries(series, ["SoC_1", "SoC"]);
  const homeUsage = findHistorySeries(series, ["loadsPower"]);
  const batteryDischarge = findHistorySeries(series, ["batDischargePower"]);
  const labels = Array.from(
    new Set(
      [batteryLevel, homeUsage, batteryDischarge]
        .filter((item): item is FoxCloudHistorySeries => Boolean(item))
        .flatMap((item) => item.data.map((point) => point.time)),
    ),
  );
  const valueMap = (item: FoxCloudHistorySeries | null): Map<string, number> =>
    new Map((item?.data ?? []).map((point) => [point.time, round(point.value)]));
  const batteryLevelMap = valueMap(batteryLevel);
  const homeUsageMap = valueMap(homeUsage);
  const batteryDischargeMap = valueMap(batteryDischarge);

  return {
    labels: labels.map(toTimeLabel),
    batteryLevelPercent: labels.map((label) => batteryLevelMap.get(label) ?? null),
    homeUsageKw: labels.map((label) => homeUsageMap.get(label) ?? null),
    batteryDischargeKw: labels.map((label) => batteryDischargeMap.get(label) ?? null),
  };
};

const pickDevice = (devices: FoxCloudDevice[]): FoxCloudDevice => {
  if (devices.length === 0) {
    throw new FoxCloudApiError("No FoxCloud devices were found for this API key.", 404);
  }

  const configuredDevice = env.foxCloud.deviceSn
    ? devices.find((device) => device.deviceSN === env.foxCloud.deviceSn)
    : null;

  if (configuredDevice) {
    return configuredDevice;
  }

  return (
    devices.find((device) => device.hasBattery) ??
    devices.find((device) => device.hasPV) ??
    devices[0]
  );
};

function buildDailyRows(
  year: number,
  month: number,
  reportSeries: FoxCloudReportSeries[],
): DashboardDailyRow[] {
  const seriesMap = new Map(reportSeries.map((series) => [series.variable, series]));
  const totalDays = daysInMonth(year, month);

  return Array.from({ length: totalDays }, (_, index) => {
    const day = index + 1;
    const pvEnergyTotal = getSeriesValue(seriesMap, "PVEnergyTotal", index);
    const returnToGrid = getSeriesValue(seriesMap, "feedin", index);
    const homeUsage = getSeriesValue(seriesMap, "loads", index);
    const gridConsumption = getSeriesValue(seriesMap, "gridConsumption", index);
    const batteryCharged = getSeriesValue(seriesMap, "chargeEnergyToTal", index);
    const batteryDischarged = getSeriesValue(seriesMap, "dischargeEnergyToTal", index);
    const pvProduction = round(
      Math.max(homeUsage + returnToGrid + batteryCharged - batteryDischarged - gridConsumption, 0),
    );

    return {
      day,
      date: formatDateKey(year, month, day),
      generation: getSeriesValue(seriesMap, "generation", index),
      pv_production: pvProduction,
      pv_energy_total: pvEnergyTotal,
      daily_feedin: returnToGrid,
      self_consumption: round(Math.max(pvProduction - returnToGrid, 0)),
      home_usage: homeUsage,
      grid_consumption: gridConsumption,
      daily_charged_energy_total: batteryCharged,
      daily_discharged_energy_total: batteryDischarged,
      solarProductionLabel: "Solar production",
      returnToGridLabel: "Return to grid",
      batteryChargeLabel: "Energy going into the battery",
      batteryDischargeLabel: "Energy coming out of the battery",
    };
  });
}

const filterRowsUpToToday = (rows: DashboardDailyRow[]): DashboardDailyRow[] => {
  const todayKey = getLocalDateKey(new Date());
  return rows.filter((row) => row.date <= todayKey);
};

const readUsableCachedMonthRows = (
  deviceSn: string,
  year: number,
  month: number,
): DashboardDailyRow[] | null => {
  const rows = filterRowsUpToToday(readDailyEnergyRowsByMonth(deviceSn, year, month));

  if (rows.length < expectedCachedRowsForMonth(year, month)) {
    return null;
  }

  if (!isFreshCurrentMonthCache(deviceSn, year, month)) {
    return null;
  }

  return rows;
};

const fetchMonthRowsWithCache = async (
  device: FoxCloudDevice,
  year: number,
  month: number,
  historyResults: FoxCloudHistoryDeviceResult[],
): Promise<DashboardDailyRow[]> => {
  const cachedRows = readUsableCachedMonthRows(device.deviceSN, year, month);

  if (cachedRows) {
    return cachedRows;
  }

  const report = await client.getReport({
    sn: device.deviceSN,
    year,
    month,
    dimension: "month",
    variables: [...REPORT_VARIABLES],
  });
  const rows = applyCurrentDayHistoryOverride(buildDailyRows(year, month, report), historyResults, year, month);

  saveDailyEnergyRows(device.deviceSN, rows);

  return filterRowsUpToToday(rows);
};

const buildTotals = (rows: DashboardDailyRow[]): EnergyTotals => {
  const sum = (key: keyof DashboardDailyRow): number =>
    round(rows.reduce((total, row) => total + Number(row[key] ?? 0), 0));

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

const getRangeStartMonth = async (
  range: string,
  anchorYear: number,
  anchorMonth: number,
  device: FoxCloudDevice,
): Promise<{ year: number; month: number }> => {
  const anchorIndex = toMonthIndex(anchorYear, anchorMonth);
  const fixedRanges: Record<string, number> = {
    current_month: 1,
    last_2_months: 2,
    last_3_months: 3,
    last_6_months: 6,
    last_12_months: 12,
  };

  if (range === "previous_month") {
    return fromMonthIndex(anchorIndex - 1);
  }

  if (range === "all") {
    try {
      const plantDetail = await client.getPlantDetail(device.stationID);
      return parseYearMonthFromText(plantDetail.createDate) ?? { year: anchorYear, month: anchorMonth };
    } catch {
      return fromMonthIndex(anchorIndex - 11);
    }
  }

  const monthCount = fixedRanges[range] ?? 1;
  return fromMonthIndex(anchorIndex - monthCount + 1);
};

const getRangeEndMonth = (range: string, anchorYear: number, anchorMonth: number): { year: number; month: number } => {
  if (range === "previous_month") {
    return fromMonthIndex(toMonthIndex(anchorYear, anchorMonth) - 1);
  }

  return { year: anchorYear, month: anchorMonth };
};

const buildMonthList = (
  start: { year: number; month: number },
  end: { year: number; month: number },
): Array<{ year: number; month: number }> => {
  const startIndex = toMonthIndex(start.year, start.month);
  const endIndex = toMonthIndex(end.year, end.month);

  if (startIndex > endIndex) {
    return [end];
  }

  return Array.from({ length: endIndex - startIndex + 1 }, (_, index) =>
    fromMonthIndex(startIndex + index),
  );
};

function applyCurrentDayHistoryOverride(
  rows: DashboardDailyRow[],
  historyResults: FoxCloudHistoryDeviceResult[],
  year: number,
  month: number,
): DashboardDailyRow[] {
  const now = new Date();
  const isCurrentMonth = now.getFullYear() === year && now.getMonth() + 1 === month;

  if (!isCurrentMonth) {
    return rows;
  }

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const todayIndex = now.getDate() - 1;
  const existing = rows[todayIndex];

  if (!existing) {
    return rows;
  }

  const returnToGrid = getCumulativeDeltaSince(historyResults, "feedin", todayStart);
  const homeUsage = getCumulativeDeltaSince(historyResults, "loads", todayStart);
  const gridConsumption = getCumulativeDeltaSince(historyResults, "gridConsumption", todayStart);
  const batteryCharged = getCumulativeDeltaSince(historyResults, "chargeEnergyToTal", todayStart);
  const batteryDischarged = getCumulativeDeltaSince(historyResults, "dischargeEnergyToTal", todayStart);
  const generation = getCumulativeDeltaSince(historyResults, "generation", todayStart);
  const pvEnergyTotal = getCumulativeDeltaSince(historyResults, "PVEnergyTotal", todayStart);
  const hasHistoryData = [
    returnToGrid,
    homeUsage,
    gridConsumption,
    batteryCharged,
    batteryDischarged,
    generation,
    pvEnergyTotal,
  ].some((value) => value > 0);

  if (!hasHistoryData) {
    return rows;
  }

  const pvProduction = round(
    Math.max(homeUsage + returnToGrid + batteryCharged - batteryDischarged - gridConsumption, 0),
  );
  const updatedRows = [...rows];

  updatedRows[todayIndex] = {
    ...existing,
    generation,
    pv_production: pvProduction,
    pv_energy_total: pvEnergyTotal,
    daily_feedin: returnToGrid,
    self_consumption: round(Math.max(pvProduction - returnToGrid, 0)),
    home_usage: homeUsage,
    grid_consumption: gridConsumption,
    daily_charged_energy_total: batteryCharged,
    daily_discharged_energy_total: batteryDischarged,
  };

  return updatedRows;
}

function buildLastHour(historyResults: FoxCloudHistoryDeviceResult[]): DashboardPayload["lastHour"] {
  const oneHourAgo = Date.now() - 60 * 60 * 1000;

  return {
    solarGeneratedKwh: integratePowerSince(historyResults, "pvPower", oneHourAgo),
    homeUsageKwh: integratePowerSince(historyResults, "loadsPower", oneHourAgo),
    gridImportKwh: integratePowerSince(historyResults, "gridConsumptionPower", oneHourAgo),
    gridExportKwh: integratePowerSince(historyResults, "feedinPower", oneHourAgo),
    batteryChargeKwh: integratePowerSince(historyResults, "batChargePower", oneHourAgo),
    batteryDischargeKwh: integratePowerSince(historyResults, "batDischargePower", oneHourAgo),
  };
}

function pickTodayRow(rows: DashboardDailyRow[], year: number, month: number): DashboardDailyRow {
  const now = new Date();
  const isCurrentMonth = now.getFullYear() === year && now.getMonth() + 1 === month;

  if (isCurrentMonth) {
    return rows[Math.max(now.getDate() - 1, 0)] ?? rows[rows.length - 1];
  }

  const latestPopulated = [...rows]
    .reverse()
    .find((row) =>
      [
        row.generation,
        row.pv_production,
        row.daily_feedin,
        row.self_consumption,
        row.home_usage,
        row.grid_consumption,
        row.daily_charged_energy_total,
        row.daily_discharged_energy_total,
      ].some((value) => value > 0),
    );

  return latestPopulated ?? rows[rows.length - 1];
}

function toPayload(
  device: FoxCloudDevice,
  liveData: FoxCloudRealtimeDataPoint[],
  dailyRows: DashboardDailyRow[],
  historyResults: FoxCloudHistoryDeviceResult[],
  requestedYear: number,
  requestedMonth: number,
): DashboardPayload {
  const todayRow = pickTodayRow(dailyRows, requestedYear, requestedMonth);

  return {
    generatedAt: new Date().toISOString(),
    isStale: false,
    warnings: [],
    source: "live",
    requestedPeriod: {
      year: requestedYear,
      month: requestedMonth,
    },
    device: {
      deviceSN: device.deviceSN,
      stationName: device.stationName,
      deviceType: device.deviceType,
      productType: device.productType,
      hasBattery: device.hasBattery,
      hasPV: device.hasPV,
      status: toStatus(device.status),
    },
    live: {
      solarGeneratedKw: round(getRealtimeValue(liveData, "pvPower")),
      gridImportKw: round(getRealtimeValue(liveData, "gridConsumptionPower")),
      gridExportKw: round(getRealtimeValue(liveData, "feedinPower")),
      homeUsageKw: round(getRealtimeValue(liveData, "loadsPower")),
      batteryChargeKw: round(getRealtimeValue(liveData, "batChargePower")),
      batteryDischargeKw: round(getRealtimeValue(liveData, "batDischargePower")),
      batterySocPercent: getFirstRealtimeValue(liveData, ["SoC", "SoC_1"]),
      batteryTemperatureCelsius: getFirstRealtimeValue(liveData, [
        "batTemperature",
        "batTemperature_1",
        "batTemperature_2",
      ]),
      inverterTemperatureCelsius: getFirstRealtimeValue(liveData, [
        "invTemperation",
        "inverterTemperature",
      ]),
      updatedAt: getRealtimeTime(liveData),
    },
    today: {
      solarProductionKwh: round(todayRow.pv_production),
      selfConsumptionKwh: round(todayRow.self_consumption),
      returnToGridKwh: round(todayRow.daily_feedin),
      homeUsageKwh: round(todayRow.home_usage),
      gridConsumptionKwh: round(todayRow.grid_consumption),
      energyGoingIntoBatteryKwh: round(todayRow.daily_charged_energy_total),
      energyComingOutOfBatteryKwh: round(todayRow.daily_discharged_energy_total),
    },
    lastHour: buildLastHour(historyResults),
    chartSeries: {
      labels: dailyRows.map((row) => String(row.day)),
      solarProduction: dailyRows.map((row) => row.pv_production),
      returnToGrid: dailyRows.map((row) => row.daily_feedin),
      homeUsage: dailyRows.map((row) => row.home_usage),
      gridConsumption: dailyRows.map((row) => row.grid_consumption),
      energyGoingIntoBattery: dailyRows.map((row) => row.daily_charged_energy_total),
      energyComingOutOfBattery: dailyRows.map((row) => row.daily_discharged_energy_total),
    },
    last24Hours: buildLast24Hours(historyResults),
    dailyTable: dailyRows,
  };
}

const demoDevice: FoxCloudDevice = {
  deviceSN: "DEMO-FOX-ESS",
  moduleSN: "DEMO-MODULE",
  stationID: "DEMO-STATION",
  stationName: "Demo Home",
  status: 1,
  hasPV: true,
  hasBattery: true,
  deviceType: "Demo H3",
  productType: "Demo Battery",
};

const demoWave = (seed: number, day: number): number =>
  Math.sin(day * 0.73 + seed) + Math.sin(day * 0.21 + seed * 1.7) * 0.55;

const dayProgressMultiplier = (year: number, month: number, day: number): number => {
  const now = new Date();

  if (now.getFullYear() !== year || now.getMonth() + 1 !== month || now.getDate() !== day) {
    return 1;
  }

  return Math.max((now.getHours() + now.getMinutes() / 60) / 24, 0.05);
};

const buildDemoDailyRows = (year: number, month: number): DashboardDailyRow[] => {
  return Array.from({ length: daysInMonth(year, month) }, (_, index) => {
    const day = index + 1;
    const progress = dayProgressMultiplier(year, month, day);
    const solarProduction = round(Math.max(7, 38 + demoWave(1, day) * 14) * progress);
    const returnToGrid = round(Math.max(0.2, solarProduction * (0.22 + (demoWave(2, day) + 2) * 0.07)));
    const gridConsumption = round(Math.max(0.1, 0.35 + Math.max(demoWave(3, day), 0) * 1.2) * progress);
    const homeUsage = round(Math.max(8, 23 + demoWave(4, day) * 8) * progress);
    const batteryCharged = round(Math.max(1, solarProduction * (0.18 + (demoWave(5, day) + 2) * 0.04)));
    const batteryDischarged = round(Math.max(1, homeUsage * (0.2 + (demoWave(6, day) + 2) * 0.05)));
    const selfConsumption = round(Math.max(solarProduction - returnToGrid, 0));

    return {
      day,
      date: formatDateKey(year, month, day),
      generation: solarProduction,
      pv_production: solarProduction,
      pv_energy_total: solarProduction,
      daily_feedin: returnToGrid,
      self_consumption: selfConsumption,
      home_usage: homeUsage,
      grid_consumption: gridConsumption,
      daily_charged_energy_total: batteryCharged,
      daily_discharged_energy_total: batteryDischarged,
      solarProductionLabel: "Solar production",
      returnToGridLabel: "Return to grid",
      batteryChargeLabel: "Energy going into the battery",
      batteryDischargeLabel: "Energy coming out of the battery",
    };
  });
};

const buildDemoHistory = (): DashboardPayload["last24Hours"] => {
  const now = new Date();
  const points = Array.from({ length: 49 }, (_, index) => {
    const pointDate = new Date(now.getTime() - (48 - index) * 30 * 60 * 1000);
    const hour = pointDate.getHours() + pointDate.getMinutes() / 60;
    const solarWindow = Math.max(Math.sin(((hour - 6) / 12) * Math.PI), 0);
    const home = round(0.7 + Math.max(Math.sin(hour * 0.85), 0) * 1.1 + (hour > 17 && hour < 22 ? 1.3 : 0));
    const discharge = round(hour < 7 || hour > 18 ? Math.max(0.1, home * 0.55) : 0);
    const battery = round(Math.min(100, Math.max(18, 68 + solarWindow * 30 - (hour > 18 ? (hour - 18) * 3 : 0))));

    return {
      label: pointDate.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" }),
      battery,
      home,
      discharge,
    };
  });

  return {
    labels: points.map((point) => point.label),
    batteryLevelPercent: points.map((point) => point.battery),
    homeUsageKw: points.map((point) => point.home),
    batteryDischargeKw: points.map((point) => point.discharge),
  };
};

const buildDemoPayload = (year: number, month: number): DashboardPayload => {
  const now = new Date();
  const hour = now.getHours() + now.getMinutes() / 60;
  const sunlight = Math.max(Math.sin(((hour - 6) / 12) * Math.PI), 0);
  const dailyRows = filterRowsUpToToday(buildDemoDailyRows(year, month));
  const todayRow = pickTodayRow(dailyRows, year, month);
  const solarNow = round(sunlight * 6.2);
  const homeNow = round(0.65 + (hour > 17 && hour < 22 ? 2.1 : 0.55));
  const batteryChargeNow = round(Math.max(solarNow - homeNow, 0) * 0.55);
  const batteryDischargeNow = round(solarNow < homeNow ? (homeNow - solarNow) * 0.7 : 0);
  const gridExportNow = round(Math.max(solarNow - homeNow - batteryChargeNow, 0));
  const gridImportNow = round(Math.max(homeNow - solarNow - batteryDischargeNow, 0));
  const last24Hours = buildDemoHistory();

  return {
    generatedAt: new Date().toISOString(),
    isStale: false,
    warnings: [
      "Demo mode is enabled. These are sample values, not live FoxCloud data.",
    ],
    source: "demo",
    requestedPeriod: { year, month },
    device: {
      deviceSN: demoDevice.deviceSN,
      stationName: demoDevice.stationName,
      deviceType: demoDevice.deviceType,
      productType: demoDevice.productType,
      hasBattery: demoDevice.hasBattery,
      hasPV: demoDevice.hasPV,
      status: toStatus(demoDevice.status),
    },
    live: {
      solarGeneratedKw: solarNow,
      gridImportKw: gridImportNow,
      gridExportKw: gridExportNow,
      homeUsageKw: homeNow,
      batteryChargeKw: batteryChargeNow,
      batteryDischargeKw: batteryDischargeNow,
      batterySocPercent: last24Hours.batteryLevelPercent.at(-1) ?? 80,
      batteryTemperatureCelsius: 25.5,
      inverterTemperatureCelsius: 31.2,
      updatedAt: now.toISOString(),
    },
    today: {
      solarProductionKwh: round(todayRow.pv_production),
      selfConsumptionKwh: round(todayRow.self_consumption),
      returnToGridKwh: round(todayRow.daily_feedin),
      homeUsageKwh: round(todayRow.home_usage),
      gridConsumptionKwh: round(todayRow.grid_consumption),
      energyGoingIntoBatteryKwh: round(todayRow.daily_charged_energy_total),
      energyComingOutOfBatteryKwh: round(todayRow.daily_discharged_energy_total),
    },
    lastHour: {
      solarGeneratedKwh: round(solarNow * 0.7),
      homeUsageKwh: round(homeNow * 0.7),
      gridImportKwh: round(gridImportNow * 0.7),
      gridExportKwh: round(gridExportNow * 0.7),
      batteryChargeKwh: round(batteryChargeNow * 0.7),
      batteryDischargeKwh: round(batteryDischargeNow * 0.7),
    },
    chartSeries: {
      labels: dailyRows.map((row) => String(row.day)),
      solarProduction: dailyRows.map((row) => row.pv_production),
      returnToGrid: dailyRows.map((row) => row.daily_feedin),
      homeUsage: dailyRows.map((row) => row.home_usage),
      gridConsumption: dailyRows.map((row) => row.grid_consumption),
      energyGoingIntoBattery: dailyRows.map((row) => row.daily_charged_energy_total),
      energyComingOutOfBattery: dailyRows.map((row) => row.daily_discharged_energy_total),
    },
    last24Hours,
    dailyTable: dailyRows,
  };
};

const getDemoRangeStartMonth = (range: string, anchorYear: number, anchorMonth: number): { year: number; month: number } => {
  const anchorIndex = toMonthIndex(anchorYear, anchorMonth);

  if (range === "previous_month") {
    return fromMonthIndex(anchorIndex - 1);
  }

  const monthCounts: Record<string, number> = {
    current_month: 1,
    last_2_months: 2,
    last_3_months: 3,
    last_6_months: 6,
    last_12_months: 12,
    all: 12,
  };

  return fromMonthIndex(anchorIndex - (monthCounts[range] ?? 1) + 1);
};

export async function getDashboardData(year: number, month: number): Promise<DashboardPayload> {
  if (!isValidYearMonth(year, month)) {
    throw new Error("The requested year or month is invalid.");
  }

  if (env.foxCloud.demoMode) {
    return buildDemoPayload(year, month);
  }

  try {
    const deviceList = await client.getDeviceList();
    const device = pickDevice(deviceList.data);
    const historyEnd = Date.now();
    const historyBegin = historyEnd - 24 * 60 * 60 * 1000;
    const [realtimeResults, reportResults, historyResults] = await Promise.all([
      client.getRealtimeData(device.deviceSN, [...LIVE_VARIABLES]),
      client.getReport({
        sn: device.deviceSN,
        year,
        month,
        dimension: "month",
        variables: [...REPORT_VARIABLES],
      }),
      client.getHistory({
        sn: device.deviceSN,
        variables: Array.from(new Set([...HISTORY_VARIABLES, ...ENERGY_HISTORY_VARIABLES])),
        begin: historyBegin,
        end: historyEnd,
      }),
    ]);

    const realtimeRecord = realtimeResults.find((item) => item.deviceSN === device.deviceSN);
    const dailyRows = applyCurrentDayHistoryOverride(
      buildDailyRows(year, month, reportResults),
      historyResults,
      year,
      month,
    );
    saveDailyEnergyRows(device.deviceSN, dailyRows);
    const payload = toPayload(
      device,
      realtimeRecord?.datas ?? [],
      dailyRows,
      historyResults,
      year,
      month,
    );

    await saveDashboardPayload(payload);
    return payload;
  } catch (error) {
    const cachedPayload = await readLatestDashboardPayload();

    if (
      cachedPayload &&
      cachedPayload.requestedPeriod.year === year &&
      cachedPayload.requestedPeriod.month === month
    ) {
      return {
        ...cachedPayload,
        generatedAt: new Date().toISOString(),
        isStale: true,
        source: "cache",
        warnings: [
          "Showing the last successful cached response because the live FoxCloud request failed.",
          error instanceof Error ? error.message : "Unknown FoxCloud error",
        ],
      };
    }

    throw error;
  }
}

export async function getEnergyRangeData(
  range: string,
  year: number,
  month: number,
): Promise<EnergyRangePayload> {
  if (!isValidYearMonth(year, month)) {
    throw new Error("The requested year or month is invalid.");
  }

  if (env.foxCloud.demoMode) {
    const startMonth = getDemoRangeStartMonth(range, year, month);
    const endMonth = getRangeEndMonth(range, year, month);
    const months = buildMonthList(startMonth, endMonth);
    const rows = months.flatMap((item) => buildDemoDailyRows(item.year, item.month));
    const visibleRows = filterRowsUpToToday(rows);

    return {
      generatedAt: new Date().toISOString(),
      range,
      requestedPeriod: { year, month },
      monthCount: months.length,
      dailyTable: visibleRows,
      totals: buildTotals(visibleRows),
    };
  }

  const deviceList = await client.getDeviceList();
  const device = pickDevice(deviceList.data);
  const startMonth = await getRangeStartMonth(range, year, month, device);
  const endMonth = getRangeEndMonth(range, year, month);
  const months = buildMonthList(startMonth, endMonth);
  const now = new Date();
  const includesCurrentMonth = months.some(
    (item) => item.year === now.getFullYear() && item.month === now.getMonth() + 1,
  );
  const historyEnd = Date.now();
  const historyBegin = historyEnd - 24 * 60 * 60 * 1000;
  const historyResults = includesCurrentMonth
    ? await client.getHistory({
        sn: device.deviceSN,
        variables: Array.from(new Set(ENERGY_HISTORY_VARIABLES)),
        begin: historyBegin,
        end: historyEnd,
      })
    : [];
  const rowsByMonth = await Promise.all(
    months.map((item) => fetchMonthRowsWithCache(device, item.year, item.month, historyResults)),
  );
  const rows = rowsByMonth.flat();
  const visibleRows = filterRowsUpToToday(rows);

  return {
    generatedAt: new Date().toISOString(),
    range,
    requestedPeriod: {
      year,
      month,
    },
    monthCount: months.length,
    dailyTable: visibleRows,
    totals: buildTotals(visibleRows),
  };
}
