import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawnCli } from "../helpers/spawn_cli.js";
import { createTempDb } from "../helpers/tmp_db.js";
import { upsertPromptTemplate } from "../../src/db/repositories/prompt_templates.js";
import { storeBook } from "../../src/services/book_service.js";
import { createGenerationRun } from "../../src/db/repositories/generation_runs.js";
import { upsertChapter, upsertVerse } from "../../src/db/repositories/books.js";

test("US2: Chapter generation resume", async (t) => {
  const { db, filePath, cleanup } = createTempDb();
  t.after(cleanup);

  // 1. Setup Data
  storeBook(db, {
      slug: "gita",
      title: "Bhagavad Gita",
      chapters: [{ number: 1, expected_verse_count: 5 }]
  });

  upsertPromptTemplate(db, {
      name: "simple",
      content: "START:{{startVerse}} COUNT:{{count}}"
  });

  // 2. Simulate interrupted run
  const book = db.prepare("SELECT * FROM books").get() as any;
  const chapter = db.prepare("SELECT * FROM chapters").get() as any;
  
  createGenerationRun(db, {
      bookId: book.id,
      chapterNumber: 1,
      expectedVerseCount: 5,
      provider: "fake",
      status: "in_progress",
      lastCompletedVerse: 2
  });

  // Insert verses 1 and 2
  upsertVerse(db, { chapterId: chapter.id, number: 1, sourceText: "Verse 1" });
  upsertVerse(db, { chapterId: chapter.id, number: 2, sourceText: "Verse 2" });

  // 3. Run CLI with resume
  const result = await spawnCli([
      "chapter", "generate",
      "--book", "gita",
      "--chapter", "1",
      "--expected-verses", "5",
      "--template", "simple",
      "--provider", "fake",
      "--resume",
      "--db", filePath,
      "--json"
  ]);

  assert.equal(result.exitCode, 0, `CLI failed: ${result.stderr}`);
  
  // 4. Verify
  const verses = db.prepare("SELECT * FROM verses WHERE chapter_id = ? ORDER BY number").all(chapter.id) as any[];
  assert.equal(verses.length, 5);
  assert.equal(verses[0].source_text, "Verse 1"); // Existing
  assert.equal(verses[2].source_text, "Fake verse 3"); // Generated (Fake provider returns 'Fake verse X')
  
  const run = db.prepare("SELECT * FROM generation_runs ORDER BY id DESC LIMIT 1").get() as any;
  assert.equal(run.status, "complete");
  assert.equal(run.last_completed_verse, 5);
});
