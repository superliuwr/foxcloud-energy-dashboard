import "dotenv/config";

const parsePort = (value: string | undefined): number => {
  const parsed = Number(value ?? "3000");

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error("PORT must be a positive integer.");
  }

  return parsed;
};

const parseHost = (value: string | undefined): string => {
  return value?.trim() || "0.0.0.0";
};

const parseBoolean = (value: string | undefined): boolean => {
  return ["1", "true", "yes", "on"].includes((value ?? "").trim().toLowerCase());
};

const parseTimeout = (value: string | undefined): number => {
  const parsed = Number(value ?? "15000");

  if (!Number.isInteger(parsed) || parsed < 1000) {
    throw new Error("FOXCLOUD_TIMEOUT_MS must be an integer greater than or equal to 1000.");
  }

  return parsed;
};

const parsePositiveInteger = (
  value: string | undefined,
  fallback: number,
  envName: string,
): number => {
  const parsed = Number(value ?? String(fallback));

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${envName} must be a positive integer.`);
  }

  return parsed;
};

const parseNonNegativeInteger = (
  value: string | undefined,
  fallback: number,
  envName: string,
): number => {
  const parsed = Number(value ?? String(fallback));

  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`${envName} must be a non-negative integer.`);
  }

  return parsed;
};

const parseBaseUrl = (value: string | undefined): string => {
  const baseUrl = value?.trim() || "https://www.foxesscloud.com";

  try {
    return new URL(baseUrl).toString().replace(/\/$/, "");
  } catch {
    throw new Error("FOXCLOUD_BASE_URL must be a valid URL.");
  }
};

interface DashboardCredential {
  username: string;
  password: string;
}

const parseDashboardUsers = (value: string | undefined): DashboardCredential[] => {
  return (value ?? "")
    .split(/[,\n]/)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const separatorIndex = entry.search(/[:=]/);

      if (separatorIndex <= 0) {
        throw new Error(
          "DASHBOARD_USERS entries must use username=password or username:password.",
        );
      }

      return {
        username: entry.slice(0, separatorIndex).trim(),
        password: entry.slice(separatorIndex + 1).trim(),
      };
    })
    .filter((credential) => credential.username && credential.password);
};

const dashboardTimeZone = process.env.DASHBOARD_TIME_ZONE?.trim() || "Australia/Sydney";
process.env.TZ = dashboardTimeZone;

const dataProvider = (process.env.DATA_PROVIDER?.trim().toLowerCase() || "foxcloud") as
  | "foxcloud"
  | "modbus";
const demoMode = parseBoolean(process.env.FOXCLOUD_DEMO_MODE);
const apiKey = process.env.FOXCLOUD_API_KEY?.trim();
const foxCloudDeviceSn = process.env.FOXCLOUD_DEVICE_SN?.trim() || "";
const dashboardUsername = process.env.DASHBOARD_USERNAME?.trim() || "";
const dashboardPassword = process.env.DASHBOARD_PASSWORD?.trim() || "";

if (!["foxcloud", "modbus"].includes(dataProvider)) {
  throw new Error("DATA_PROVIDER must be either foxcloud or modbus.");
}

if (!apiKey && !demoMode && dataProvider === "foxcloud") {
  throw new Error(
    "FOXCLOUD_API_KEY is missing. Add it to your local .env file before starting the server, or set FOXCLOUD_DEMO_MODE=true.",
  );
}

const legacyDashboardCredential =
  dashboardUsername && dashboardPassword
    ? [
        {
          username: dashboardUsername,
          password: dashboardPassword,
        },
      ]
    : [];

const dashboardUsers = [
  ...legacyDashboardCredential,
  ...parseDashboardUsers(process.env.DASHBOARD_USERS),
];

export const env = {
  port: parsePort(process.env.PORT),
  host: parseHost(process.env.HOST),
  dashboardTimeZone,
  dataProvider,
  dashboardAuth: {
    users: dashboardUsers,
    enabled: dashboardUsers.length > 0,
  },
  foxCloud: {
    demoMode,
    apiKey: apiKey ?? "",
    baseUrl: parseBaseUrl(process.env.FOXCLOUD_BASE_URL),
    username: process.env.FOXCLOUD_USERNAME?.trim() || "",
    password: process.env.FOXCLOUD_PASSWORD?.trim() || "",
    deviceSn: foxCloudDeviceSn,
    timeoutMs: parseTimeout(process.env.FOXCLOUD_TIMEOUT_MS),
  },
  modbus: {
    host: process.env.MODBUS_HOST?.trim() || "",
    port: parsePositiveInteger(process.env.MODBUS_PORT, 502, "MODBUS_PORT"),
    unitId: parsePositiveInteger(process.env.MODBUS_UNIT_ID, 1, "MODBUS_UNIT_ID"),
    timeoutMs: parsePositiveInteger(process.env.MODBUS_TIMEOUT_MS, 3000, "MODBUS_TIMEOUT_MS"),
    sampleIntervalMs: parsePositiveInteger(
      process.env.MODBUS_SAMPLE_INTERVAL_MS,
      60_000,
      "MODBUS_SAMPLE_INTERVAL_MS",
    ),
    deviceId: process.env.MODBUS_DEVICE_ID?.trim() || foxCloudDeviceSn || "local-modbus-inverter",
    stationName: process.env.MODBUS_STATION_NAME?.trim() || "Local Modbus inverter",
    profile: process.env.MODBUS_PROFILE?.trim() || process.env.MODBUS_INVERTER_MODEL?.trim() || "foxess-h3-smart",
    inverterModel: process.env.MODBUS_INVERTER_MODEL?.trim() || "FoxESS H3 Smart",
    readOnly: !["0", "false", "no", "off"].includes(
      (process.env.MODBUS_READ_ONLY ?? "true").trim().toLowerCase(),
    ),
  },
  sqliteBackup: {
    enabled: !["0", "false", "no", "off"].includes(
      (process.env.SQLITE_BACKUP_ENABLED ?? "true").trim().toLowerCase(),
    ),
    dir: process.env.SQLITE_BACKUP_DIR?.trim() || "data/backups",
    intervalMs: parsePositiveInteger(
      process.env.SQLITE_BACKUP_INTERVAL_MS,
      60 * 60 * 1000,
      "SQLITE_BACKUP_INTERVAL_MS",
    ),
    retentionCount: parseNonNegativeInteger(
      process.env.SQLITE_BACKUP_RETENTION_COUNT,
      72,
      "SQLITE_BACKUP_RETENTION_COUNT",
    ),
  },
};
