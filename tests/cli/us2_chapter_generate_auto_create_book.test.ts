import test from "node:test";
import assert from "node:assert/strict";
import { spawnCli } from "../helpers/spawn_cli.js";
import { createTempDb } from "../helpers/tmp_db.js";
import { upsertPromptTemplate } from "../../src/db/repositories/prompt_templates.js";

test("US2: Chapter generation auto-creates book", async (t) => {
  const { db, filePath, cleanup } = createTempDb();
  t.after(cleanup);

  // Setup: Only template, no book
  upsertPromptTemplate(db, {
      name: "simple",
      content: "START:{{startVerse}} COUNT:{{count}}"
  });

  // Run generation for non-existent book "auto-book"
  const result = await spawnCli([
      "chapter", "generate",
      "--book", "auto-book",
      "--chapter", "1",
      "--expected-verses", "5",
      "--template", "simple",
      "--provider", "fake",
      "--db", filePath,
      "--json"
  ]);

  assert.equal(result.exitCode, 0, `CLI failed: ${result.stderr}`);
  
  // Verify book created
  const book = db.prepare("SELECT * FROM books WHERE slug = 'auto-book'").get() as any;
  assert.ok(book);
  assert.equal(book.title, "auto-book");

  // Verify verses generated
  const verses = db.prepare("SELECT * FROM verses").all();
  assert.equal(verses.length, 5);
});
