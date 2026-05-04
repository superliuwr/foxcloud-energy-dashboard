import express, { type NextFunction, type Request, type Response } from "express";
import { timingSafeEqual } from "node:crypto";
import os from "node:os";
import path from "node:path";

import { env } from "./config/env.js";
import { FoxCloudApiError } from "./lib/foxcloudClient.js";
import {
  getDashboardData,
  getEnergyRangeData,
  rebuildEnergyRangeCache,
} from "./services/dashboardService.js";
import { startModbusSampler } from "./services/modbusSampler.js";
import { startSqliteBackupScheduler } from "./services/sqliteBackup.js";

const app = express();
const publicDir = path.resolve(process.cwd(), "public");
const chartJsDir = path.resolve(process.cwd(), "node_modules/chart.js/dist");

const safeEqual = (first: string, second: string): boolean => {
  const firstBuffer = Buffer.from(first);
  const secondBuffer = Buffer.from(second);

  return firstBuffer.length === secondBuffer.length && timingSafeEqual(firstBuffer, secondBuffer);
};

const hasValidDashboardCredential = (username: string, password: string): boolean => {
  return env.dashboardAuth.users.some(
    (credential) =>
      safeEqual(username, credential.username) && safeEqual(password, credential.password),
  );
};

const getLanUrls = (): string[] => {
  const interfaces = Object.values(os.networkInterfaces()).flat();

  return interfaces
    .filter((item): item is os.NetworkInterfaceInfo => Boolean(item))
    .filter((item) => item.family === "IPv4" && !item.internal)
    .map((item) => `http://${item.address}:${env.port}`);
};

const requireDashboardAuth = (req: Request, res: Response, next: NextFunction): void => {
  if (!env.dashboardAuth.enabled) {
    next();
    return;
  }

  const encodedCredentials = req.headers.authorization?.match(/^Basic\s+(.+)$/i)?.[1];

  if (encodedCredentials) {
    const [username = "", password = ""] = Buffer.from(encodedCredentials, "base64")
      .toString("utf8")
      .split(":", 2);

    if (hasValidDashboardCredential(username, password)) {
      next();
      return;
    }
  }

  res.setHeader("WWW-Authenticate", 'Basic realm="FoxCloud Dashboard"');
  res.status(401).send("Authentication required.");
};

app.use(express.json());
app.use(requireDashboardAuth);
app.use(express.static(publicDir));
app.use("/vendor/chartjs", express.static(chartJsDir));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    timestamp: new Date().toISOString(),
    dataProvider: env.dataProvider,
    baseUrl: env.foxCloud.baseUrl,
    dashboardTimeZone: env.dashboardTimeZone,
    demoMode: env.foxCloud.demoMode,
    hasConfiguredDeviceSn: Boolean(env.foxCloud.deviceSn),
    usingApiKeyAuth: env.dataProvider === "foxcloud",
    modbusConfigured: env.dataProvider === "modbus" && Boolean(env.modbus.host),
    modbusReadOnly: env.modbus.readOnly,
    dashboardAuthEnabled: env.dashboardAuth.enabled,
    dashboardAuthUserCount: env.dashboardAuth.users.length,
  });
});

app.get("/api/dashboard", async (req, res, next) => {
  try {
    const now = new Date();
    const year = Number(req.query.year ?? now.getFullYear());
    const month = Number(req.query.month ?? now.getMonth() + 1);
    const payload = await getDashboardData(year, month);

    res.json(payload);
  } catch (error) {
    next(error);
  }
});

app.get("/api/energy-range", async (req, res, next) => {
  try {
    const now = new Date();
    const year = Number(req.query.year ?? now.getFullYear());
    const month = Number(req.query.month ?? now.getMonth() + 1);
    const range = String(req.query.range ?? "current_month");
    const payload = await getEnergyRangeData(range, year, month);

    res.json(payload);
  } catch (error) {
    next(error);
  }
});

app.post("/api/rebuild-cache", async (req, res, next) => {
  try {
    const now = new Date();
    const year = Number(req.body?.year ?? now.getFullYear());
    const month = Number(req.body?.month ?? now.getMonth() + 1);
    const range = String(req.body?.range ?? "current_month");
    const payload = await rebuildEnergyRangeCache(range, year, month);

    res.json(payload);
  } catch (error) {
    next(error);
  }
});

app.use((_req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof FoxCloudApiError) {
    res.status(error.statusCode).json({
      error: error.message,
      errno: error.errno ?? null,
    });
    return;
  }

  const message = error instanceof Error ? error.message : "Unknown server error";

  res.status(500).json({
    error: message,
  });
});

app.listen(env.port, env.host, () => {
  console.log(`FoxCloud dashboard running locally at http://localhost:${env.port}`);

  if (env.host === "0.0.0.0" || env.host === "::") {
    const lanUrls = getLanUrls();

    if (lanUrls.length > 0) {
      console.log("LAN access URLs:");
      lanUrls.forEach((url) => console.log(`- ${url}`));
    }
  } else {
    console.log(`Listening on host ${env.host}`);
  }

  if (!env.dashboardAuth.enabled) {
    console.warn(
      "DASHBOARD_USERNAME and DASHBOARD_PASSWORD are not set. Do not expose this dashboard to the Internet without authentication.",
    );
  }

  if (env.foxCloud.demoMode) {
    console.log("FoxCloud demo mode is enabled. The dashboard is using sample data.");
  }

  startSqliteBackupScheduler();
  startModbusSampler();
});
