#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const envPath = path.resolve(process.argv[2] ?? ".env");
const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));

const getGitSha = () => {
  try {
    return execFileSync("git", ["rev-parse", "--short", "HEAD"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "unknown";
  }
};

const metadata = {
  APP_VERSION: String(packageJson.version ?? "0.1.0"),
  GIT_SHA: getGitSha(),
};

const existing = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
const lines = existing ? existing.split(/\r?\n/) : [];
const seen = new Set();
const updatedLines = lines.map((line) => {
  const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=/);

  if (!match || !(match[1] in metadata)) {
    return line;
  }

  seen.add(match[1]);
  return `${match[1]}=${metadata[match[1]]}`;
});

for (const [key, value] of Object.entries(metadata)) {
  if (!seen.has(key)) {
    updatedLines.push(`${key}=${value}`);
  }
}

fs.writeFileSync(envPath, `${updatedLines.join("\n").replace(/\n+$/, "")}\n`);
console.log(`Updated build metadata in ${envPath}`);
