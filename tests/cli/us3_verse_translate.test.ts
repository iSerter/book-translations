import test from "node:test";
import assert from "node:assert/strict";
import { spawnCli } from "../helpers/spawn_cli.js";
import { createTempDb } from "../helpers/tmp_db.js";
import { storeBook } from "../../src/services/book_service.js";
import { upsertVerse } from "../../src/db/repositories/books.js";

test("US3: Verse translate", async (t) => {
  const { db, filePath, cleanup } = createTempDb();
  t.after(cleanup);

  // Setup
  storeBook(db, {
      slug: "gita",
      title: "Gita",
      chapters: [{ number: 2, expected_verse_count: 5 }]
  });
  const chapter = db.prepare("SELECT * FROM chapters").get() as any;
  upsertVerse(db, { chapterId: chapter.id, number: 1, sourceText: "Verse One" });

  // Run
  const result = await spawnCli([
      "verse", "translate",
      "--book", "gita",
      "--chapter", "2",
      "--verses", "1",
      "--to", "es",
      "--provider", "fake",
      "--db", filePath,
      "--json"
  ]);

  assert.equal(result.exitCode, 0, result.stderr);
  
  // Verify
  const translation = db.prepare("SELECT * FROM translations WHERE language_code = 'es'").get() as any;
  assert.ok(translation);
  assert.equal(translation.text, "[es] Verse One");
});
