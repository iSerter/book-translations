import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawnCli } from "../helpers/spawn_cli.js";
import { createTempDb } from "../helpers/tmp_db.js";

test("US1: Import single chapter JSON", async (t) => {
  const { db, filePath, cleanup } = createTempDb();
  t.after(cleanup);

  const fixturePath = path.resolve("tests/fixtures/import/test-book/TestProvider/Chapter-01.json");
  assert.ok(fs.existsSync(fixturePath), "Fixture file must exist");

  // 1. Run import with inferred metadata
  // Command: translations import <file> --db <db>
  const result = await spawnCli(
    ["translations", "import", fixturePath, "--db", filePath],
  );

  assert.equal(result.exitCode, 0, `CLI failed: ${result.stderr}`);
  assert.match(result.stdout, /Import complete/);
  assert.match(result.stdout, /1 success/);

  // Verify DB
  const book = db.prepare("SELECT * FROM books WHERE slug = ?").get("test-book") as any;
  assert.ok(book, "Book should be created");

  const chapter = db.prepare("SELECT * FROM chapters WHERE book_id = ? AND number = 1").get(book.id) as any;
  assert.ok(chapter, "Chapter should be created");
  assert.equal(chapter.title, "The First Chapter");

  const verse = db.prepare("SELECT * FROM verses WHERE chapter_id = ? AND number = 1").get(chapter.id) as any;
  assert.ok(verse, "Verse should be created");
  assert.equal(verse.source_text, "Dharmaxetre...");

  const translation = db.prepare("SELECT * FROM translations WHERE verse_id = ? AND language_code = 'en'").get(verse.id) as any;
  assert.ok(translation, "Translation should be created");
  assert.equal(translation.provider, "TestProvider"); // Inferred from path
  assert.equal(translation.text, "On the field of Dharma...");
});

test("US1: Import single chapter JSON with explicit provider", async (t) => {
  const { db, filePath, cleanup } = createTempDb();
  t.after(cleanup);

  const fixturePath = path.resolve("tests/fixtures/import/test-book/TestProvider/Chapter-01.json");
  
  // Override provider
  const result = await spawnCli(
    ["translations", "import", fixturePath, "--db", filePath, "--provider", "OverriddenProvider"],
  );

  assert.equal(result.exitCode, 0, `CLI failed: ${result.stderr}`);

  // Verify DB
  const translation = db.prepare("SELECT * FROM translations WHERE provider = ?").get("OverriddenProvider") as any;
  assert.ok(translation, "Translation should be created with overridden provider");
});
