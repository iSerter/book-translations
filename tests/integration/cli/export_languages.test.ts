import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { spawnCli } from "../../helpers/spawn_cli.js";
import { createTempDb } from "../../helpers/tmp_db.js";

test("CLI: Book Export - Specific Languages", async (t) => {
  const { db, filePath: dbPath, cleanup } = createTempDb({ migrate: true });
  t.after(cleanup);

  const tmpOutDir = await fs.mkdtemp(path.join(os.tmpdir(), "export-langs-test-"));
  t.after(async () => fs.rm(tmpOutDir, { recursive: true, force: true }));

  // 1. Store a book
  const bookData = {
    slug: "test-lang-book",
    title: "Test Lang Book",
    author: "Test Author",
    chapters: [{ number: 1, verses: [{ number: 1, sourceText: "Src" }] }]
  };
  const bookJsonPath = path.join(tmpOutDir, "book.json");
  await fs.writeFile(bookJsonPath, JSON.stringify(bookData));
  await spawnCli(["book", "store", "--file", bookJsonPath, "--db", dbPath]);

  // 2. Insert translations
  const verse = db.prepare("SELECT id FROM verses").get() as any;
  db.prepare("INSERT INTO translations (verse_id, language_code, provider, text, created_at) VALUES (?, ?, ?, ?, datetime('now'))")
    .run(verse.id, 'en', 'test', 'English Text');
  db.prepare("INSERT INTO translations (verse_id, language_code, provider, text, created_at) VALUES (?, ?, ?, ?, datetime('now'))")
    .run(verse.id, 'es', 'test', 'Spanish Text');

  // 3. Export only English (en)
  const result = await spawnCli(["book", "export", "test-lang-book", "--languages", "en", "--format", "json", "--output", tmpOutDir], {
      env: { APP_DB_PATH: dbPath }
  });
  assert.equal(result.exitCode, 0, result.stderr);

  // 4. Verify content
  const jsonPath = path.join(tmpOutDir, "test-lang-book.json");
  const content = JSON.parse(await fs.readFile(jsonPath, "utf-8"));
  const translations = content.chapters[0].verses[0].translations;

  assert.equal(translations.length, 1, "Should have 1 translation");
  assert.equal(translations[0].languageCode, 'en', "Should be English");
  assert.equal(translations[0].text, 'English Text');
});
