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

const demoMode = parseBoolean(process.env.FOXCLOUD_DEMO_MODE);
const apiKey = process.env.FOXCLOUD_API_KEY?.trim();
const dashboardUsername = process.env.DASHBOARD_USERNAME?.trim() || "";
const dashboardPassword = process.env.DASHBOARD_PASSWORD?.trim() || "";

if (!apiKey && !demoMode) {
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
    deviceSn: process.env.FOXCLOUD_DEVICE_SN?.trim() || "",
    timeoutMs: parseTimeout(process.env.FOXCLOUD_TIMEOUT_MS),
  },
};
