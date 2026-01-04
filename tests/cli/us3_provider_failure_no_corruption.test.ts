import test from "node:test";
import assert from "node:assert/strict";
import { spawnCli } from "../helpers/spawn_cli.js";
import { createTempDb } from "../helpers/tmp_db.js";
import { storeBook } from "../../src/services/book_service.js";
import { upsertVerse } from "../../src/db/repositories/books.js";

test("US3: Provider failure no corruption", async (t) => {
  const { db, filePath, cleanup } = createTempDb();
  t.after(cleanup);

  storeBook(db, {
      slug: "gita",
      title: "Gita",
      chapters: [{ number: 2, expected_verse_count: 5 }]
  });
  const chapter = db.prepare("SELECT * FROM chapters").get() as any;
  upsertVerse(db, { chapterId: chapter.id, number: 1, sourceText: "Verse One" });
  upsertVerse(db, { chapterId: chapter.id, number: 2, sourceText: "FAIL" });

  const result = await spawnCli([
      "verse", "translate",
      "--book", "gita",
      "--chapter", "2",
      "--verses", "1,2",
      "--to", "es",
      "--provider", "fake",
      "--db", filePath,
      "--json"
  ]);

  assert.notEqual(result.exitCode, 0);
  assert.match(result.stdout, /Simulated provider failure/);

  // Verify DB
  const count = db.prepare("SELECT COUNT(*) as c FROM translations").get() as any;
  assert.equal(count.c, 0, "Should have 0 translations due to rollback");
});
