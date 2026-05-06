import { createRequire } from "node:module";

import { env } from "../config/env.js";
import { integratePowerSamples } from "../lib/energyMath.js";
import { FoxCloudClient } from "../lib/foxcloudClient.js";
import type {
  DashboardDailyRow,
  DashboardPayload,
  EnergyRangePayload,
  EnergyTotals,
  FoxCloudHistoryDeviceResult,
  FoxCloudHistorySeries,
} from "../types/foxcloud.js";
import {
  type LiveSample,
  readDailyEnergyRowsByDateRange,
  readDailyEnergyRowsByMonth,
  readLiveSamplesSince,
  saveDailyEnergyRows,
  saveLiveSample,
} from "./sqliteStore.js";

const require = createRequire(import.meta.url);
const ModbusRTU = require("modbus-serial") as { new (): ModbusRTUClient };
const foxCloudClient = new FoxCloudClient({
  apiKey: env.foxCloud.apiKey,
  baseUrl: env.foxCloud.baseUrl,
  timeoutMs: env.foxCloud.timeoutMs,
});

const ENERGY_HISTORY_VARIABLES = [
  "pvPower",
  "loadsPower",
  "feedinPower",
  "gridConsumptionPower",
  "batChargePower",
  "batDischargePower",
] as const;
const SOLAR_ACTIVE_POWER_THRESHOLD_KW = 0.05;

interface ModbusRTUClient {
  setTimeout(timeoutMs: number): void;
  connectTCP(host: string, options: { port: number }): Promise<void>;
  setID(unitId: number): void;
  readHoldingRegisters(startAddress: number, count: number): Promise<{ data: number[] }>;
  close(callback: () => void): void;
}

const round = (value: number | null | undefined, decimals = 2): number => {
  const normalized = Number(value ?? 0);
  return Number(normalized.toFixed(decimals));
};

const formatDateKey = (year: number, month: number, day: number): string =>
  `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

const getLocalDateKey = (date: Date): string =>
  formatDateKey(date.getFullYear(), date.getMonth() + 1, date.getDate());

const daysInMonth = (year: number, month: number): number => new Date(year, month, 0).getDate();

const toMonthIndex = (year: number, month: number): number => year * 12 + month - 1;

const fromMonthIndex = (monthIndex: number): { year: number; month: number } => ({
  year: Math.floor(monthIndex / 12),
  month: (monthIndex % 12) + 1,
});

const isValidYearMonth = (year: number, month: number): boolean =>
  Number.isInteger(year) && Number.isInteger(month) && year >= 2020 && month >= 1 && month <= 12;

const validateModbusConfig = (): void => {
  if (!env.modbus.host) {
    throw new Error("MODBUS_HOST is missing. Add your inverter or datalogger LAN IP to .env.");
  }
};

const readSigned = (registers: Map<number, number>, addresses: number[]): number | null => {
  const value = readUnsigned(registers, addresses);

  if (value === null) {
    return null;
  }

  const bits = addresses.length * 16;
  const signBit = 2 ** (bits - 1);

  return value >= signBit ? value - 2 ** bits : value;
};

const readUnsigned = (registers: Map<number, number>, addresses: number[]): number | null => {
  let value = 0;

  for (const [index, address] of addresses.entries()) {
    const register = registers.get(address);

    if (register === undefined) {
      return null;
    }

    value += (register & 0xffff) * 2 ** (index * 16);
  }

  return value;
};

class ModbusReader {
  private readonly client: ModbusRTUClient = new ModbusRTU();
  private readonly registers = new Map<number, number>();

  async connect(): Promise<void> {
    this.client.setTimeout(env.modbus.timeoutMs);
    await this.client.connectTCP(env.modbus.host, { port: env.modbus.port });
    this.client.setID(env.modbus.unitId);
  }

  async close(): Promise<void> {
    await new Promise<void>((resolve) => this.client.close(() => resolve()));
  }

  async readRange(startAddress: number, count: number): Promise<void> {
    const result = await this.client.readHoldingRegisters(startAddress, count);

    result.data.forEach((value: number, index: number) => {
      this.registers.set(startAddress + index, value);
    });
  }

  getInt(addresses: number[], scale = 1): number {
    return round((readSigned(this.registers, addresses) ?? 0) * scale);
  }

  getUInt(addresses: number[], scale = 1): number {
    return round((readUnsigned(this.registers, addresses) ?? 0) * scale);
  }
}

interface ModbusSnapshot {
  sampledAt: string;
  live: DashboardPayload["live"];
  today: DashboardPayload["today"];
}

interface ModbusDailyRegisters {
  solarEnergyTodayKwh: number;
  totalYieldTodayKwh: number;
  feedInTodayKwh: number;
  loadEnergyTodayKwh: number;
  gridConsumptionTodayKwh: number;
  batteryChargeTodayKwh: number;
  batteryDischargeTodayKwh: number;
}

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

const normalizePower = (value: number, threshold = 0): number => {
  const normalized = Math.max(Number(value) || 0, 0);
  return normalized >= threshold ? normalized : 0;
};

const buildPointMap = (
  historyResults: FoxCloudHistoryDeviceResult[],
  variable: string,
): Map<number, number> => {
  const points = getHistoryPointsSince(getHistorySeries(historyResults, variable), 0);

  return new Map(points.map((point) => [point.timeMs, point.value]));
};

const averageIntervalValue = (
  pointMap: Map<number, number>,
  previousTimeMs: number,
  currentTimeMs: number,
): number => {
  const previous = pointMap.get(previousTimeMs);
  const current = pointMap.get(currentTimeMs);

  if (previous === undefined || current === undefined) {
    return 0;
  }

  return (previous + current) / 2;
};

const buildAnalysisTotalsFromHistory = (
  historyResults: FoxCloudHistoryDeviceResult[],
  dayStart: number,
): DashboardPayload["today"] | null => {
  const pvPoints = getHistoryPointsSince(getHistorySeries(historyResults, "pvPower"), dayStart);

  if (pvPoints.length < 2) {
    return null;
  }

  const maps = {
    feedIn: buildPointMap(historyResults, "feedinPower"),
    load: buildPointMap(historyResults, "loadsPower"),
    grid: buildPointMap(historyResults, "gridConsumptionPower"),
    charge: buildPointMap(historyResults, "batChargePower"),
    discharge: buildPointMap(historyResults, "batDischargePower"),
  };
  const totals = pvPoints.slice(1).reduce(
    (accumulator, point, index) => {
      const previous = pvPoints[index];
      const hours = (point.timeMs - previous.timeMs) / 3_600_000;

      if (hours <= 0 || hours > 1) {
        return accumulator;
      }

      const pvKw = normalizePower(
        (previous.value + point.value) / 2,
        SOLAR_ACTIVE_POWER_THRESHOLD_KW,
      );
      const feedInKw = normalizePower(
        averageIntervalValue(maps.feedIn, previous.timeMs, point.timeMs),
        SOLAR_ACTIVE_POWER_THRESHOLD_KW,
      );
      const homeKw = normalizePower(averageIntervalValue(maps.load, previous.timeMs, point.timeMs));
      const gridKw = normalizePower(averageIntervalValue(maps.grid, previous.timeMs, point.timeMs));
      const dischargeKw = normalizePower(averageIntervalValue(maps.discharge, previous.timeMs, point.timeMs));
      const isSolarActive = pvKw > 0 || feedInKw > 0;
      const chargeKw = isSolarActive
        ? normalizePower(averageIntervalValue(maps.charge, previous.timeMs, point.timeMs))
        : 0;
      const selfConsumptionKw = isSolarActive
        ? Math.max(homeKw + chargeKw - dischargeKw - gridKw, 0)
        : 0;

      accumulator.returnToGrid += feedInKw * hours;
      accumulator.selfConsumption += selfConsumptionKw * hours;
      accumulator.homeUsage += homeKw * hours;
      accumulator.gridConsumption += gridKw * hours;
      accumulator.batteryCharged += chargeKw * hours;
      accumulator.batteryDischarged += dischargeKw * hours;

      return accumulator;
    },
    {
      returnToGrid: 0,
      selfConsumption: 0,
      homeUsage: 0,
      gridConsumption: 0,
      batteryCharged: 0,
      batteryDischarged: 0,
    },
  );

  const solarProductionKwh = round(totals.selfConsumption + totals.returnToGrid);

  if (solarProductionKwh <= 0) {
    return null;
  }

  return {
    solarProductionKwh,
    selfConsumptionKwh: round(totals.selfConsumption),
    returnToGridKwh: round(totals.returnToGrid),
    homeUsageKwh: round(totals.homeUsage),
    gridConsumptionKwh: round(totals.gridConsumption),
    energyGoingIntoBatteryKwh: round(totals.batteryCharged),
    energyComingOutOfBatteryKwh: round(totals.batteryDischarged),
  };
};

const buildAnalysisTotalsFromLiveSamples = (
  registers: ModbusDailyRegisters,
): DashboardPayload["today"] | null => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const samples = readLiveSamplesSince(env.modbus.deviceId, todayStart.toISOString());

  if (samples.length < 12) {
    return null;
  }

  const firstSampleTime = new Date(samples[0].sampled_at).getTime();

  if (firstSampleTime - todayStart.getTime() > 30 * 60 * 1000) {
    return null;
  }

  const solarProductionKwh = round(
    integrateSamples(samples, "grid_export_kw") +
      Math.max(
        integrateSamples(samples, "home_usage_kw") +
          integrateSamples(samples, "battery_charge_kw") -
          integrateSamples(samples, "battery_discharge_kw") -
          integrateSamples(samples, "grid_import_kw"),
        0,
      ),
  );

  if (solarProductionKwh <= registers.solarEnergyTodayKwh) {
    return null;
  }

  return {
    solarProductionKwh,
    selfConsumptionKwh: round(Math.max(solarProductionKwh - registers.feedInTodayKwh, 0)),
    returnToGridKwh: registers.feedInTodayKwh,
    homeUsageKwh: round(Math.max(integrateSamples(samples, "home_usage_kw"), registers.loadEnergyTodayKwh)),
    gridConsumptionKwh: round(
      Math.max(integrateSamples(samples, "grid_import_kw"), registers.gridConsumptionTodayKwh),
    ),
    energyGoingIntoBatteryKwh: round(
      Math.max(integrateSamples(samples, "battery_charge_kw"), registers.batteryChargeTodayKwh),
    ),
    energyComingOutOfBatteryKwh: round(
      Math.max(integrateSamples(samples, "battery_discharge_kw"), registers.batteryDischargeTodayKwh),
    ),
  };
};

const buildRegisterFallbackTotals = (
  registers: ModbusDailyRegisters,
): DashboardPayload["today"] => {
  const balanceProductionKwh = round(
    registers.feedInTodayKwh +
      Math.max(
        registers.loadEnergyTodayKwh +
          registers.batteryChargeTodayKwh -
          registers.batteryDischargeTodayKwh -
          registers.gridConsumptionTodayKwh,
        0,
      ),
  );
  const shouldUseBalance =
    registers.feedInTodayKwh > SOLAR_ACTIVE_POWER_THRESHOLD_KW &&
    balanceProductionKwh > registers.solarEnergyTodayKwh;
  const solarProductionKwh = shouldUseBalance
    ? balanceProductionKwh
    : registers.solarEnergyTodayKwh;

  return {
    solarProductionKwh,
    selfConsumptionKwh: round(Math.max(solarProductionKwh - registers.feedInTodayKwh, 0)),
    returnToGridKwh: registers.feedInTodayKwh,
    homeUsageKwh: registers.loadEnergyTodayKwh,
    gridConsumptionKwh: registers.gridConsumptionTodayKwh,
    energyGoingIntoBatteryKwh: registers.batteryChargeTodayKwh,
    energyComingOutOfBatteryKwh: registers.batteryDischargeTodayKwh,
  };
};

const buildTodayTotals = async (
  registers: ModbusDailyRegisters,
): Promise<DashboardPayload["today"]> => {
  if (env.foxCloud.apiKey && env.foxCloud.deviceSn) {
    try {
      const dayStartDate = new Date();
      dayStartDate.setHours(0, 0, 0, 0);
      const historyResults = await foxCloudClient.getHistory({
        sn: env.foxCloud.deviceSn,
        variables: [...ENERGY_HISTORY_VARIABLES],
        begin: dayStartDate.getTime(),
        end: Date.now(),
      });
      const analysisTotals = buildAnalysisTotalsFromHistory(historyResults, dayStartDate.getTime());

      if (analysisTotals && analysisTotals.solarProductionKwh > registers.solarEnergyTodayKwh) {
        const returnToGridKwh = Math.max(analysisTotals.returnToGridKwh, registers.feedInTodayKwh);
        const solarProductionKwh = round(
          Math.max(analysisTotals.solarProductionKwh, analysisTotals.selfConsumptionKwh + returnToGridKwh),
        );

        return {
          ...analysisTotals,
          solarProductionKwh,
          selfConsumptionKwh: round(Math.max(solarProductionKwh - returnToGridKwh, 0)),
          returnToGridKwh,
          gridConsumptionKwh: Math.max(
            analysisTotals.gridConsumptionKwh,
            registers.gridConsumptionTodayKwh,
          ),
          energyGoingIntoBatteryKwh: Math.max(
            analysisTotals.energyGoingIntoBatteryKwh,
            registers.batteryChargeTodayKwh,
          ),
          energyComingOutOfBatteryKwh: Math.max(
            analysisTotals.energyComingOutOfBatteryKwh,
            registers.batteryDischargeTodayKwh,
          ),
        };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown FoxCloud history error";
      console.warn(`Modbus daily totals could not be calibrated from FoxCloud history: ${message}`);
    }
  }

  return buildAnalysisTotalsFromLiveSamples(registers) ?? buildRegisterFallbackTotals(registers);
};

const readModbusSnapshot = async (): Promise<ModbusSnapshot> => {
  validateModbusConfig();

  const reader = new ModbusReader();

  try {
    await reader.connect();
    for (const [startAddress, count] of [
      [37609, 28],
      [38814, 26],
      [39063, 80],
      [39219, 20],
      [39279, 8],
      [39601, 32],
    ] as const) {
      await reader.readRange(startAddress, count);
    }

    const pvPowerKw = round(
      Math.max(reader.getInt([39280, 39279], 0.001), 0) +
        Math.max(reader.getInt([39282, 39281], 0.001), 0) +
        Math.max(reader.getInt([39284, 39283], 0.001), 0) +
        Math.max(reader.getInt([39286, 39285], 0.001), 0),
    );
    const gridCtKw = reader.getInt([38815, 38814], 0.0001);
    const batteryPowerKw = reader.getInt([39238, 39237], 0.001);
    const batteryPackTemperatureCelsius = reader.getInt([37611], 0.1);
    const batteryMaxTemperatureCelsius = reader.getInt([37617], 0.1);
    const batteryMinTemperatureCelsius = reader.getInt([37618], 0.1);
    const now = new Date().toISOString();

    const dailyRegisters: ModbusDailyRegisters = {
      solarEnergyTodayKwh: reader.getUInt([39604, 39603], 0.01),
      totalYieldTodayKwh: reader.getUInt([39624, 39623], 0.01),
      feedInTodayKwh: reader.getUInt([39616, 39615], 0.01),
      loadEnergyTodayKwh: reader.getUInt([39632, 39631], 0.01),
      gridConsumptionTodayKwh: reader.getUInt([39620, 39619], 0.01),
      batteryChargeTodayKwh: reader.getUInt([39608, 39607], 0.01),
      batteryDischargeTodayKwh: reader.getUInt([39612, 39611], 0.01),
    };

    return {
      sampledAt: now,
      live: {
        solarGeneratedKw: pvPowerKw,
        gridImportKw: round(Math.abs(Math.min(gridCtKw, 0))),
        gridExportKw: round(Math.max(gridCtKw, 0)),
        homeUsageKw: round(Math.max(reader.getInt([39226, 39225], 0.001), 0)),
        batteryChargeKw: round(Math.abs(Math.min(batteryPowerKw, 0))),
        batteryDischargeKw: round(Math.max(batteryPowerKw, 0)),
        batterySocPercent: reader.getUInt([37612]),
        batteryTemperatureCelsius: batteryMinTemperatureCelsius,
        batteryMinTemperatureCelsius,
        batteryMaxTemperatureCelsius,
        batteryPackTemperatureCelsius,
        inverterTemperatureCelsius: reader.getInt([39141], 0.1),
        updatedAt: now,
      },
      today: await buildTodayTotals(dailyRegisters),
    };
  } finally {
    await reader.close();
  }
};

const buildTodayRow = (snapshot: ModbusSnapshot): DashboardDailyRow => {
  const now = new Date();

  return {
    day: now.getDate(),
    date: getLocalDateKey(now),
    generation: snapshot.today.selfConsumptionKwh,
    pv_production: snapshot.today.solarProductionKwh,
    pv_energy_total: snapshot.today.solarProductionKwh,
    daily_feedin: snapshot.today.returnToGridKwh,
    self_consumption: snapshot.today.selfConsumptionKwh,
    home_usage: snapshot.today.homeUsageKwh,
    grid_consumption: snapshot.today.gridConsumptionKwh,
    daily_charged_energy_total: snapshot.today.energyGoingIntoBatteryKwh,
    daily_discharged_energy_total: snapshot.today.energyComingOutOfBatteryKwh,
    solarProductionLabel: "Solar production",
    returnToGridLabel: "Return to grid",
    batteryChargeLabel: "Energy going into the battery",
    batteryDischargeLabel: "Energy coming out of the battery",
  };
};

const filterRowsUpToToday = (rows: DashboardDailyRow[]): DashboardDailyRow[] => {
  const todayKey = getLocalDateKey(new Date());
  return rows.filter((row) => row.date <= todayKey);
};

const mergeRowsByDate = (rows: DashboardDailyRow[], preferredRows: DashboardDailyRow[]): DashboardDailyRow[] => {
  const merged = new Map(rows.map((row) => [row.date, row]));

  for (const row of preferredRows) {
    merged.set(row.date, row);
  }

  return [...merged.values()].sort((first, second) => first.date.localeCompare(second.date));
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

const integrateSamples = (
  samples: LiveSample[],
  key: keyof Omit<LiveSample, "sampled_at">,
): number => {
  return integratePowerSamples(
    samples.map((sample) => ({ sampledAt: sample.sampled_at, kw: Number(sample[key] ?? 0) })),
  );
};

const buildLast24Hours = (deviceSn: string): DashboardPayload["last24Hours"] => {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const samples = readLiveSamplesSince(deviceSn, since);

  return {
    labels: samples.map((sample) =>
      new Date(sample.sampled_at).toLocaleTimeString("en-AU", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    ),
    batteryLevelPercent: samples.map((sample) => sample.battery_soc_percent),
    homeUsageKw: samples.map((sample) => round(sample.home_usage_kw)),
    batteryDischargeKw: samples.map((sample) => round(sample.battery_discharge_kw)),
  };
};

const buildLastHour = (deviceSn: string): DashboardPayload["lastHour"] => {
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const samples = readLiveSamplesSince(deviceSn, since);

  return {
    solarGeneratedKwh: integrateSamples(samples, "solar_generated_kw"),
    homeUsageKwh: integrateSamples(samples, "home_usage_kw"),
    gridImportKwh: integrateSamples(samples, "grid_import_kw"),
    gridExportKwh: integrateSamples(samples, "grid_export_kw"),
    batteryChargeKwh: integrateSamples(samples, "battery_charge_kw"),
    batteryDischargeKwh: integrateSamples(samples, "battery_discharge_kw"),
  };
};

const currentMonthRows = (todayRow: DashboardDailyRow, year: number, month: number): DashboardDailyRow[] => {
  const cachedRows = filterRowsUpToToday(readDailyEnergyRowsByMonth(env.modbus.deviceId, year, month));

  return mergeRowsByDate(cachedRows, [todayRow]);
};

export async function sampleAndStoreModbusData(): Promise<ModbusSnapshot> {
  const snapshot = await readModbusSnapshot();
  const todayRow = buildTodayRow(snapshot);

  saveDailyEnergyRows(env.modbus.deviceId, [todayRow], "modbus");
  saveLiveSample(env.modbus.deviceId, {
    sampledAt: snapshot.sampledAt,
    solarGeneratedKw: snapshot.live.solarGeneratedKw,
    homeUsageKw: snapshot.live.homeUsageKw,
    gridImportKw: snapshot.live.gridImportKw,
    gridExportKw: snapshot.live.gridExportKw,
    batteryChargeKw: snapshot.live.batteryChargeKw,
    batteryDischargeKw: snapshot.live.batteryDischargeKw,
    batterySocPercent: snapshot.live.batterySocPercent,
    batteryTemperatureCelsius: snapshot.live.batteryTemperatureCelsius,
    batteryMinTemperatureCelsius: snapshot.live.batteryMinTemperatureCelsius,
    batteryMaxTemperatureCelsius: snapshot.live.batteryMaxTemperatureCelsius,
    batteryPackTemperatureCelsius: snapshot.live.batteryPackTemperatureCelsius,
    inverterTemperatureCelsius: snapshot.live.inverterTemperatureCelsius,
  });

  return snapshot;
}

export async function getModbusDashboardData(year: number, month: number): Promise<DashboardPayload> {
  if (!isValidYearMonth(year, month)) {
    throw new Error("The requested year or month is invalid.");
  }

  const snapshot = await sampleAndStoreModbusData();
  const todayRow = buildTodayRow(snapshot);
  const requestedMonthIsCurrent =
    todayRow.date.startsWith(`${year}-${String(month).padStart(2, "0")}`);
  const dailyRows = requestedMonthIsCurrent
    ? currentMonthRows(todayRow, year, month)
    : filterRowsUpToToday(readDailyEnergyRowsByMonth(env.modbus.deviceId, year, month));

  return {
    generatedAt: new Date().toISOString(),
    isStale: false,
    warnings: [
      "Using local read-only Modbus data. Historical daily rows are available after this dashboard has sampled and cached them locally.",
    ],
    source: "modbus",
    requestedPeriod: { year, month },
    device: {
      deviceSN: env.modbus.deviceId,
      stationName: env.modbus.stationName,
      deviceType: env.modbus.inverterModel,
      productType: "Local Modbus TCP",
      hasBattery: true,
      hasPV: true,
      status: "online",
    },
    live: snapshot.live,
    today: snapshot.today,
    lastHour: buildLastHour(env.modbus.deviceId),
    chartSeries: {
      labels: dailyRows.map((row) => String(row.day)),
      solarProduction: dailyRows.map((row) => row.pv_production),
      returnToGrid: dailyRows.map((row) => row.daily_feedin),
      homeUsage: dailyRows.map((row) => row.home_usage),
      gridConsumption: dailyRows.map((row) => row.grid_consumption),
      energyGoingIntoBattery: dailyRows.map((row) => row.daily_charged_energy_total),
      energyComingOutOfBattery: dailyRows.map((row) => row.daily_discharged_energy_total),
    },
    last24Hours: buildLast24Hours(env.modbus.deviceId),
    dailyTable: dailyRows,
  };
}

const getRangeStartDate = (range: string, year: number, month: number): string => {
  const now = new Date();
  const anchor = toMonthIndex(year, month);

  if (range === "current_week") {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dayOfWeek = start.getDay();
    start.setDate(start.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    return getLocalDateKey(start);
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
    all: 120,
  };
  const start = fromMonthIndex(anchor - (monthCounts[range] ?? 1) + 1);

  return formatDateKey(start.year, start.month, 1);
};

const getRangeEndDate = (range: string, year: number, month: number): string => {
  if (range === "previous_month") {
    const previous = fromMonthIndex(toMonthIndex(year, month) - 1);
    return formatDateKey(previous.year, previous.month, daysInMonth(previous.year, previous.month));
  }

  return getLocalDateKey(new Date());
};

const getMonthCountForRange = (startDate: string, year: number, month: number): number => {
  const [startYear, startMonth] = startDate.split("-").map(Number);
  return Math.max(1, toMonthIndex(year, month) - toMonthIndex(startYear, startMonth) + 1);
};

export async function getModbusEnergyRangeData(
  range: string,
  year: number,
  month: number,
): Promise<EnergyRangePayload> {
  if (!isValidYearMonth(year, month)) {
    throw new Error("The requested year or month is invalid.");
  }

  const dashboard = await getModbusDashboardData(year, month);
  const startDate = getRangeStartDate(range, year, month);
  const rows = filterRowsUpToToday(
    readDailyEnergyRowsByDateRange(
      env.modbus.deviceId,
      startDate,
      getRangeEndDate(range, year, month),
    ),
  );

  return {
    generatedAt: new Date().toISOString(),
    range,
    requestedPeriod: dashboard.requestedPeriod,
    monthCount: getMonthCountForRange(startDate, year, month),
    dailyTable: rows,
    totals: buildTotals(rows),
  };
}
