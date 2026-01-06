import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { spawnCli } from "../../helpers/spawn_cli.js";
import { createTempDb } from "../../helpers/tmp_db.js";

test("CLI: Book Export - Single Chapter", async (t) => {
  const { filePath: dbPath, cleanup } = createTempDb({ migrate: true });
  t.after(cleanup);

  const tmpOutDir = await fs.mkdtemp(path.join(os.tmpdir(), "export-chapter-test-"));
  t.after(async () => fs.rm(tmpOutDir, { recursive: true, force: true }));

  // 1. Store a book with 2 chapters
  const bookData = {
    slug: "test-chapter-book",
    title: "Test Chapter Book",
    author: "Test Author",
    chapters: [
      {
        number: 1,
        expectedVerseCount: 1,
        verses: [{ number: 1, sourceText: "Ch1 V1" }]
      },
      {
        number: 2,
        expectedVerseCount: 1,
        verses: [{ number: 1, sourceText: "Ch2 V1" }]
      }
    ]
  };
  
  const bookJsonPath = path.join(tmpOutDir, "book.json");
  await fs.writeFile(bookJsonPath, JSON.stringify(bookData));

  await spawnCli(["book", "store", "--file", bookJsonPath, "--db", dbPath]);

  // 2. Export only Chapter 2
  const exportResult = await spawnCli(["book", "export", "test-chapter-book", "--chapter", "2", "--output", tmpOutDir], {
      env: { APP_DB_PATH: dbPath }
  });
  
  if (exportResult.exitCode !== 0) {
      console.log(exportResult.stderr);
  }
  assert.equal(exportResult.exitCode, 0);

  // 3. Verify files
  // Filename should be [slug]_chapter-2.json
  const jsonPath = path.join(tmpOutDir, "test-chapter-book_chapter-2.json");
  const exists = await fs.stat(jsonPath).then(() => true).catch(() => false);
  assert.ok(exists, "Chapter 2 export file should exist");

  // Verify content
  const content = JSON.parse(await fs.readFile(jsonPath, "utf-8"));
  assert.equal(content.chapters.length, 1);
  assert.equal(content.chapters[0].number, 2);
  
  // Verify Chapter 1 file does NOT exist
  const fullBookPath = path.join(tmpOutDir, "test-chapter-book.json");
  const fullExists = await fs.stat(fullBookPath).then(() => true).catch(() => false);
  assert.equal(fullExists, false, "Full book export should not be generated");
});
