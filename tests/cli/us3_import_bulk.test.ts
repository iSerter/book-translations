import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawnCli } from "../helpers/spawn_cli.js";
import { createTempDb } from "../helpers/tmp_db.js";

test("US3: Bulk import with glob", async (t) => {
  const { db, filePath, cleanup } = createTempDb();
  t.after(cleanup);

  const fixtureDir = path.resolve("tests/fixtures/import/bulk-book/Provider");
  fs.mkdirSync(fixtureDir, { recursive: true });

  // Chapter 1
  fs.writeFileSync(path.join(fixtureDir, "Chapter-01.json"), JSON.stringify({
    chapter: {
      number: 1,
      title_english: "Ch1",
      verses: [{ verse_number: 1, sanskrit: "v1", english: { translation: "t1" } }]
    }
  }));

  // Chapter 2
  fs.writeFileSync(path.join(fixtureDir, "Chapter-02.json"), JSON.stringify({
    chapter: {
      number: 2,
      title_english: "Ch2",
      verses: [{ verse_number: 1, sanskrit: "v1", english: { translation: "t1" } }]
    }
  }));

  // Invalid JSON
  fs.writeFileSync(path.join(fixtureDir, "bad.json"), "{ invalid json }");

  // Glob pattern (escaped for shell or passed directly)
  // spawnCli passes args directly to spawn.
  // If we run in shell, shell expands.
  // If we want to test app expansion, we should quote it or use a pattern that doesn't match current dir but is valid?
  // Or just pass the pattern.
  // Note: spawn does NOT expand globs. So this tests the APP's glob expansion.
  const pattern = path.join(fixtureDir, "*.json");

  const result = await spawnCli(["translations", "import", pattern, "--db", filePath]);
  
  // It might fail exit code if partial success?
  // Spec says: "valid files are imported and errors are reported for invalid ones without stopping the entire process."
  // Exit code might be 0 or 1 depending on decision.
  // Usually if some succeed, maybe 0? Or 1 if any fail?
  // Let's assume 0 if at least one works, or check stdout.
  
  // If I haven't implemented glob yet, `importFile` will look for file named `.../*.json` and fail (Not Found).

  assert.match(result.stdout, /Found 3 file\(s\)/);
  assert.match(result.stdout, /Import complete/);
  assert.match(result.stdout, /2 success/);
  assert.match(result.stdout, /1 failed/); // Or something similar
});
