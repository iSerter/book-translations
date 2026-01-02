import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import type { Database as BetterSqlite3Database } from "better-sqlite3";
import { openDatabase } from "../../src/db/connection.js";
import { applyMigrations, loadMigrations } from "../../src/db/migrate.js";

export type TempDbHandle = {
  db: BetterSqlite3Database;
  filePath: string;
  cleanup: () => void;
};

export function createTempDb(options: { migrate?: boolean } = {}): TempDbHandle {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "book-translations-db-"));
  const filePath = path.join(dir, "test.sqlite");
  const db = openDatabase(filePath);

  if (options.migrate !== false) {
    applyMigrations(db);
  }

  const cleanup = () => {
    db.close();
    fs.rmSync(dir, { recursive: true, force: true });
  };

  return { db, filePath, cleanup };
}

export function migrationCount(): number {
  return loadMigrations().length;
}
