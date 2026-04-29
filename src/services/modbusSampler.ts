import { env } from "../config/env.js";
import { sampleAndStoreModbusData } from "./modbusDashboardService.js";

let isSampling = false;

const runSample = async (reason: string): Promise<void> => {
  if (isSampling) {
    return;
  }

  isSampling = true;

  try {
    const snapshot = await sampleAndStoreModbusData();
    console.log(
      `Modbus sample saved (${reason}) at ${snapshot.sampledAt}: PV ${snapshot.live.solarGeneratedKw} kW, load ${snapshot.live.homeUsageKw} kW, battery ${snapshot.live.batterySocPercent ?? "unknown"}%`,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Modbus sampling error";
    console.warn(`Modbus sample failed (${reason}): ${message}`);
  } finally {
    isSampling = false;
  }
};

export function startModbusSampler(): void {
  if (env.dataProvider !== "modbus") {
    return;
  }

  if (!env.modbus.host) {
    console.warn("Modbus sampler is disabled because MODBUS_HOST is not configured.");
    return;
  }

  console.log(
    `Modbus background sampler enabled: every ${Math.round(env.modbus.sampleIntervalMs / 1000)} seconds.`,
  );

  void runSample("startup");
  setInterval(() => {
    void runSample("interval");
  }, env.modbus.sampleIntervalMs);
}
