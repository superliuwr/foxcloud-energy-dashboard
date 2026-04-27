import { existsSync, writeFileSync } from "node:fs";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const envPath = ".env";

const rl = readline.createInterface({ input, output });

const ask = async (question, defaultValue = "") => {
  const suffix = defaultValue ? ` (${defaultValue})` : "";
  const answer = await rl.question(`${question}${suffix}: `);
  return answer.trim() || defaultValue;
};

const askRequired = async (question, defaultValue = "") => {
  while (true) {
    const answer = await ask(question, defaultValue);

    if (answer) {
      return answer;
    }

    console.log("This value is required.");
  }
};

const envValue = (value) => JSON.stringify(value);

if (existsSync(envPath)) {
  const overwrite = await ask(
    ".env already exists. Type YES to overwrite it, or press Enter to cancel",
  );

  if (overwrite !== "YES") {
    console.log("Setup cancelled. Your existing .env was not changed.");
    rl.close();
    process.exit(0);
  }
}

console.log("\nFoxCloud Energy Dashboard setup");
console.log("Your answers are written only to local .env, which is ignored by Git.");
console.log("Do not share this terminal while typing secrets.\n");

const port = await ask("Local dashboard port", "3000");
const host = await ask("Host for LAN access", "0.0.0.0");
const timeZone = await ask("Dashboard time zone", "Australia/Sydney");
const baseUrl = await ask("FoxCloud base URL", "https://www.foxesscloud.com");
const demoMode = await ask("Use demo mode with sample data? yes/no", "no");
const isDemoMode = ["y", "yes", "true", "1"].includes(demoMode.toLowerCase());
const apiKey = isDemoMode ? await ask("FoxCloud API key, optional in demo mode") : await askRequired("FoxCloud API key");
const deviceSn = await ask("FoxCloud device serial number, optional");
const dashboardUsername = await askRequired("Dashboard login username");
const dashboardPassword = await askRequired("Dashboard login password");
const extraUsers = await ask(
  "Extra dashboard users, optional, comma-separated username=password entries",
);

const lines = [
  `PORT=${port}`,
  `HOST=${host}`,
  `DASHBOARD_TIME_ZONE=${timeZone}`,
  `FOXCLOUD_BASE_URL=${envValue(baseUrl)}`,
  `FOXCLOUD_DEMO_MODE=${isDemoMode ? "true" : "false"}`,
  `FOXCLOUD_API_KEY=${envValue(apiKey)}`,
  "FOXCLOUD_USERNAME=",
  "FOXCLOUD_PASSWORD=",
  `FOXCLOUD_DEVICE_SN=${envValue(deviceSn)}`,
  "FOXCLOUD_TIMEOUT_MS=15000",
  `DASHBOARD_USERNAME=${envValue(dashboardUsername)}`,
  `DASHBOARD_PASSWORD=${envValue(dashboardPassword)}`,
  `DASHBOARD_USERS=${envValue(extraUsers)}`,
  "",
];

writeFileSync(envPath, lines.join("\n"), { mode: 0o600 });

console.log("\nCreated .env successfully.");
console.log("Next steps:");
console.log("1. Run: npm run build");
console.log("2. Run: npm start");
console.log("3. Open: http://localhost:3000");
console.log("4. For LAN devices, use the LAN URL printed by the server.");

rl.close();
