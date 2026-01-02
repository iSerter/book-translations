import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Database as BetterSqlite3Database } from "better-sqlite3";

export type Migration = {
  version: number;
  name: string;
  sql: string;
};

const migrationsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "migrations");

export function loadMigrations(dir: string = migrationsDir): Migration[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const sqlFiles = entries.filter((entry) => entry.isFile() && entry.name.endsWith(".sql"));

  const migrations = sqlFiles.map((file) => parseMigration(path.join(dir, file.name), file.name));
  return migrations.sort((a, b) => a.version - b.version);
}

export function applyMigrations(db: BetterSqlite3Database, dir?: string): number[] {
  ensureSchemaVersionTable(db);
  const applied = new Set<number>(getAppliedVersions(db));
  const migrations = loadMigrations(dir);

  const newlyApplied: number[] = [];
  for (const migration of migrations) {
    if (applied.has(migration.version)) continue;
    runMigration(db, migration);
    newlyApplied.push(migration.version);
  }
  return newlyApplied;
}

function ensureSchemaVersionTable(db: BetterSqlite3Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

function getAppliedVersions(db: BetterSqlite3Database): number[] {
  const rows = db.prepare("SELECT version FROM schema_version ORDER BY version ASC").all();
  return rows.map((row: { version: number }) => row.version);
}

function runMigration(db: BetterSqlite3Database, migration: Migration): void {
  const tx = db.transaction(() => {
    db.exec(migration.sql);
    db.prepare("INSERT INTO schema_version (version) VALUES (?)").run(migration.version);
  });
  tx();
}

function parseMigration(fullPath: string, fileName: string): Migration {
  const match = fileName.match(/^(\d+)_.*\.sql$/);
  if (!match) {
    throw new Error(`Invalid migration filename: ${fileName}`);
  }
  const version = Number(match[1]);
  const sql = fs.readFileSync(fullPath, "utf8");
  return { version, name: fileName, sql };
}
