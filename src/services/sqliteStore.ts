import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

import type { DashboardDailyRow } from "../types/foxcloud.js";

const dataDir = path.resolve(process.cwd(), "data");
const databasePath = path.join(dataDir, "foxcloud-dashboard.sqlite");

fs.mkdirSync(dataDir, { recursive: true });

const database = new Database(databasePath);

database.pragma("journal_mode = WAL");
database.pragma("foreign_keys = ON");

database.exec(`
  CREATE TABLE IF NOT EXISTS daily_energy (
    device_sn TEXT NOT NULL,
    date TEXT NOT NULL,
    day INTEGER NOT NULL,
    generation REAL NOT NULL DEFAULT 0,
    pv_production REAL NOT NULL DEFAULT 0,
    pv_energy_total REAL NOT NULL DEFAULT 0,
    daily_feedin REAL NOT NULL DEFAULT 0,
    self_consumption REAL NOT NULL DEFAULT 0,
    home_usage REAL NOT NULL DEFAULT 0,
    grid_consumption REAL NOT NULL DEFAULT 0,
    daily_charged_energy_total REAL NOT NULL DEFAULT 0,
    daily_discharged_energy_total REAL NOT NULL DEFAULT 0,
    source TEXT NOT NULL DEFAULT 'foxcloud',
    updated_at TEXT NOT NULL,
    PRIMARY KEY (device_sn, date)
  );

  CREATE INDEX IF NOT EXISTS idx_daily_energy_device_date
    ON daily_energy (device_sn, date);
`);

interface DailyEnergyRecord {
  date: string;
  day: number;
  generation: number;
  pv_production: number;
  pv_energy_total: number;
  daily_feedin: number;
  self_consumption: number;
  home_usage: number;
  grid_consumption: number;
  daily_charged_energy_total: number;
  daily_discharged_energy_total: number;
  updated_at: string;
}

const toDailyRow = (record: DailyEnergyRecord): DashboardDailyRow => ({
  day: record.day,
  date: record.date,
  generation: record.generation,
  pv_production: record.pv_production,
  pv_energy_total: record.pv_energy_total,
  daily_feedin: record.daily_feedin,
  self_consumption: record.self_consumption,
  home_usage: record.home_usage,
  grid_consumption: record.grid_consumption,
  daily_charged_energy_total: record.daily_charged_energy_total,
  daily_discharged_energy_total: record.daily_discharged_energy_total,
  solarProductionLabel: "Solar production",
  returnToGridLabel: "Return to grid",
  batteryChargeLabel: "Energy going into the battery",
  batteryDischargeLabel: "Energy coming out of the battery",
});

const upsertDailyRow = database.prepare(`
  INSERT INTO daily_energy (
    device_sn,
    date,
    day,
    generation,
    pv_production,
    pv_energy_total,
    daily_feedin,
    self_consumption,
    home_usage,
    grid_consumption,
    daily_charged_energy_total,
    daily_discharged_energy_total,
    source,
    updated_at
  )
  VALUES (
    @deviceSn,
    @date,
    @day,
    @generation,
    @pv_production,
    @pv_energy_total,
    @daily_feedin,
    @self_consumption,
    @home_usage,
    @grid_consumption,
    @daily_charged_energy_total,
    @daily_discharged_energy_total,
    @source,
    @updatedAt
  )
  ON CONFLICT(device_sn, date) DO UPDATE SET
    day = excluded.day,
    generation = excluded.generation,
    pv_production = excluded.pv_production,
    pv_energy_total = excluded.pv_energy_total,
    daily_feedin = excluded.daily_feedin,
    self_consumption = excluded.self_consumption,
    home_usage = excluded.home_usage,
    grid_consumption = excluded.grid_consumption,
    daily_charged_energy_total = excluded.daily_charged_energy_total,
    daily_discharged_energy_total = excluded.daily_discharged_energy_total,
    source = excluded.source,
    updated_at = excluded.updated_at
`);

const saveRowsTransaction = database.transaction(
  (deviceSn: string, rows: DashboardDailyRow[], source: string, updatedAt: string) => {
    for (const row of rows) {
      upsertDailyRow.run({
        deviceSn,
        date: row.date,
        day: row.day,
        generation: row.generation,
        pv_production: row.pv_production,
        pv_energy_total: row.pv_energy_total,
        daily_feedin: row.daily_feedin,
        self_consumption: row.self_consumption,
        home_usage: row.home_usage,
        grid_consumption: row.grid_consumption,
        daily_charged_energy_total: row.daily_charged_energy_total,
        daily_discharged_energy_total: row.daily_discharged_energy_total,
        source,
        updatedAt,
      });
    }
  },
);

export function saveDailyEnergyRows(
  deviceSn: string,
  rows: DashboardDailyRow[],
  source = "foxcloud",
): void {
  if (rows.length === 0) {
    return;
  }

  saveRowsTransaction(deviceSn, rows, source, new Date().toISOString());
}

export function readDailyEnergyRowsByMonth(
  deviceSn: string,
  year: number,
  month: number,
): DashboardDailyRow[] {
  const monthKey = `${year}-${String(month).padStart(2, "0")}`;
  const records = database
    .prepare(
      `
        SELECT *
        FROM daily_energy
        WHERE device_sn = ? AND date LIKE ?
        ORDER BY date ASC
      `,
    )
    .all(deviceSn, `${monthKey}-%`) as DailyEnergyRecord[];

  return records.map(toDailyRow);
}

export function readDailyEnergyRowsByDateRange(
  deviceSn: string,
  startDate: string,
  endDate: string,
): DashboardDailyRow[] {
  const records = database
    .prepare(
      `
        SELECT *
        FROM daily_energy
        WHERE device_sn = ? AND date >= ? AND date <= ?
        ORDER BY date ASC
      `,
    )
    .all(deviceSn, startDate, endDate) as DailyEnergyRecord[];

  return records.map(toDailyRow);
}

export function getLatestDailyEnergyUpdate(
  deviceSn: string,
  year: number,
  month: number,
): string | null {
  const monthKey = `${year}-${String(month).padStart(2, "0")}`;
  const record = database
    .prepare(
      `
        SELECT MAX(updated_at) AS updated_at
        FROM daily_energy
        WHERE device_sn = ? AND date LIKE ?
      `,
    )
    .get(deviceSn, `${monthKey}-%`) as { updated_at: string | null } | undefined;

  return record?.updated_at ?? null;
}

