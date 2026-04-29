import fs from "node:fs/promises";
import path from "node:path";

import { env } from "../config/env.js";
import { backupDatabase, getDatabasePath } from "./sqliteStore.js";

let isBackingUp = false;

const backupFilePrefix = "foxcloud-dashboard-backup-";

const toTimestamp = (date: Date): string =>
  date.toISOString().replace(/[:.]/g, "-");

const getBackupDir = (): string =>
  path.isAbsolute(env.sqliteBackup.dir)
    ? env.sqliteBackup.dir
    : path.resolve(process.cwd(), env.sqliteBackup.dir);

const pruneOldBackups = async (backupDir: string): Promise<void> => {
  if (env.sqliteBackup.retentionCount === 0) {
    return;
  }

  const entries = await fs.readdir(backupDir);
  const backupFiles = entries
    .filter((entry) => entry.startsWith(backupFilePrefix) && entry.endsWith(".sqlite"))
    .sort()
    .reverse();
  const filesToDelete = backupFiles.slice(env.sqliteBackup.retentionCount);

  await Promise.all(
    filesToDelete.map((fileName) => fs.rm(path.join(backupDir, fileName), { force: true })),
  );
};

const runBackup = async (reason: string): Promise<void> => {
  if (isBackingUp) {
    return;
  }

  isBackingUp = true;

  try {
    const backupDir = getBackupDir();
    await fs.mkdir(backupDir, { recursive: true });

    const backupPath = path.join(backupDir, `${backupFilePrefix}${toTimestamp(new Date())}.sqlite`);
    await backupDatabase(backupPath);
    await pruneOldBackups(backupDir);

    console.log(`SQLite backup saved (${reason}): ${backupPath}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown SQLite backup error";
    console.warn(`SQLite backup failed (${reason}): ${message}`);
  } finally {
    isBackingUp = false;
  }
};

export function startSqliteBackupScheduler(): void {
  if (!env.sqliteBackup.enabled) {
    console.log("SQLite backup scheduler is disabled.");
    return;
  }

  console.log(
    `SQLite backup scheduler enabled: ${getDatabasePath()} -> ${getBackupDir()} every ${Math.round(
      env.sqliteBackup.intervalMs / 60000,
    )} minutes.`,
  );

  void runBackup("startup");
  setInterval(() => {
    void runBackup("interval");
  }, env.sqliteBackup.intervalMs);
}
