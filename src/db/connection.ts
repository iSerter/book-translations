import Database, { Database as BetterSqlite3Database } from "better-sqlite3";

export type OpenOptions = {
  readonly?: boolean;
};

// Opens the SQLite database and applies recommended pragmas for integrity and performance.
export function openDatabase(filePath: string, options: OpenOptions = {}): BetterSqlite3Database {
  const db = new Database(filePath, { readonly: options.readonly ?? false });

  db.pragma("foreign_keys = ON");
  db.pragma("journal_mode = WAL");
  db.pragma("synchronous = NORMAL");
  db.pragma("busy_timeout = 5000");

  return db;
}
