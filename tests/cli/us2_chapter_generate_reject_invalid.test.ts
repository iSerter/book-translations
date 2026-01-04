import test from "node:test";
import assert from "node:assert/strict";
import { spawnCli } from "../helpers/spawn_cli.js";
import { createTempDb } from "../helpers/tmp_db.js";
import { upsertPromptTemplate } from "../../src/db/repositories/prompt_templates.js";
import { storeBook } from "../../src/services/book_service.js";

test("US2: Chapter generation reject invalid", async (t) => {
  const { db, filePath, cleanup } = createTempDb();
  t.after(cleanup);

  storeBook(db, {
      slug: "gita",
      title: "Bhagavad Gita",
      chapters: [{ number: 1, expected_verse_count: 5 }]
  });

  // Template asks for WRONG start verse (2 instead of 1)
  upsertPromptTemplate(db, {
      name: "bad-start",
      content: "START:2 COUNT:5"
  });

  const result = await spawnCli([
      "chapter", "generate",
      "--book", "gita",
      "--chapter", "1",
      "--expected-verses", "5",
      "--template", "bad-start",
      "--provider", "fake",
      "--db", filePath,
      "--json"
  ]);

  // Should fail
  assert.notEqual(result.exitCode, 0);
  // With --json, error is in stdout
  assert.match(result.stdout, /Must start with verse 1/);

  // Verify DB not modified (no verses)
  const verses = db.prepare("SELECT * FROM verses").all();
  assert.equal(verses.length, 0);

  // Verify run marked failed
  const run = db.prepare("SELECT * FROM generation_runs").get() as any;
  assert.equal(run.status, "failed");
  assert.match(run.validation_error, /Must start with verse 1/);
});
