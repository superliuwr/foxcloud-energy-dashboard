import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { DashboardPayload } from "../types/foxcloud.js";

const dataRoot = path.resolve(process.cwd(), "data");
const cacheDir = path.join(dataRoot, "cache");
const historyDir = path.join(dataRoot, "history");
const latestCachePath = path.join(cacheDir, "dashboard-latest.json");

async function ensureDirectories(): Promise<void> {
  await Promise.all([
    mkdir(cacheDir, { recursive: true }),
    mkdir(historyDir, { recursive: true }),
  ]);
}

export async function saveDashboardPayload(payload: DashboardPayload): Promise<void> {
  await ensureDirectories();

  const { device, requestedPeriod } = payload;
  const historyFile = path.join(
    historyDir,
    `${device.deviceSN}-${requestedPeriod.year}-${String(requestedPeriod.month).padStart(2, "0")}.json`,
  );
  const serialized = `${JSON.stringify(payload, null, 2)}\n`;

  await Promise.all([
    writeFile(latestCachePath, serialized, "utf8"),
    writeFile(historyFile, serialized, "utf8"),
  ]);
}

export async function readLatestDashboardPayload(): Promise<DashboardPayload | null> {
  try {
    const raw = await readFile(latestCachePath, "utf8");
    return JSON.parse(raw) as DashboardPayload;
  } catch {
    return null;
  }
}
