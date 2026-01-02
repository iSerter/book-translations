import assert from "node:assert/strict";
import test from "node:test";

import { applyMigrations } from "../../src/db/migrate.js";
import { createTempDb, migrationCount } from "../helpers/tmp_db.js";

test("migrations apply cleanly", () => {
  const { db, cleanup } = createTempDb({ migrate: false });
  try {
    const applied = applyMigrations(db);
    assert.equal(applied.length, migrationCount());

    const requiredTables = new Set([
      "books",
      "chapters",
      "verses",
      "translations",
      "prompt_templates",
      "generation_runs",
      "schema_version",
    ]);

    const tables = db
      .prepare(`SELECT name FROM sqlite_master WHERE type='table'`)
      .all()
      .map((row: { name: string }) => row.name);

    for (const table of requiredTables) {
      assert.ok(tables.includes(table), `expected table ${table} to exist`);
    }
  } finally {
    cleanup();
  }
});
