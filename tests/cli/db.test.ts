import test from "node:test";
import assert from "node:assert/strict";
import { spawnCli } from "../helpers/spawn_cli.js";
import { createTempDb } from "../helpers/tmp_db.js";

test("CLI: db migrate and seed", async (t) => {
  // Use migrate: false to start with empty DB
  const { db, filePath, cleanup } = createTempDb({ migrate: false });
  t.after(cleanup);

  // 1. Check empty schema (should fail query or return empty?)
  // Better-sqlite3 throws if table doesn't exist
  assert.throws(() => db.prepare("SELECT * FROM books").all());

  // 2. Run migrate
  const migrateResult = await spawnCli(["db", "migrate", "--db", filePath, "--json"]);
  assert.equal(migrateResult.exitCode, 0, migrateResult.stderr);
  const migrateJson = JSON.parse(migrateResult.stdout);
  assert.equal(migrateJson.success, true);
  
  // Verify tables exist
  assert.doesNotThrow(() => db.prepare("SELECT * FROM books").all());

  // 3. Run seed
  const seedResult = await spawnCli(["db", "seed", "--db", filePath, "--json"]);
  assert.equal(seedResult.exitCode, 0, seedResult.stderr);
  const seedJson = JSON.parse(seedResult.stdout);
  assert.equal(seedJson.success, true);

  // Verify templates
  const tmplDefault = db.prepare("SELECT * FROM prompt_templates WHERE name = 'default'").get();
  assert.ok(tmplDefault);
  
  const tmplSanskrit = db.prepare("SELECT * FROM prompt_templates WHERE name = 'Sanskrit-Scripture-Translation'").get();
  assert.ok(tmplSanskrit);
});