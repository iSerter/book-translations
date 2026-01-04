import test from "node:test";
import assert from "node:assert/strict";
import { spawnCli } from "../helpers/spawn_cli.js";
import { createTempDb } from "../helpers/tmp_db.js";
import { storeBook } from "../../src/services/book_service.js";
import { upsertVerse } from "../../src/db/repositories/books.js";

test("US3: Duplicate translation policy", async (t) => {
  const { db, filePath, cleanup } = createTempDb();
  t.after(cleanup);

  storeBook(db, {
      slug: "gita",
      title: "Gita",
      chapters: [{ number: 2, expected_verse_count: 5 }]
  });
  const chapter = db.prepare("SELECT * FROM chapters").get() as any;
  upsertVerse(db, { chapterId: chapter.id, number: 1, sourceText: "Verse One" });

  // 1. Initial translation
  await spawnCli([
      "verse", "translate",
      "--book", "gita",
      "--chapter", "2",
      "--verses", "1",
      "--to", "es",
      "--provider", "fake",
      "--db", filePath,
      "--json"
  ]);

  // 2. Duplicate attempt (should fail)
  const resultRefuse = await spawnCli([
      "verse", "translate",
      "--book", "gita",
      "--chapter", "2",
      "--verses", "1",
      "--to", "es",
      "--provider", "fake",
      "--db", filePath,
      "--json"
  ]);

  assert.notEqual(resultRefuse.exitCode, 0);
  assert.match(resultRefuse.stdout, /Translation exists/);

  // 3. Overwrite attempt (should succeed)
  const resultOverwrite = await spawnCli([
      "verse", "translate",
      "--book", "gita",
      "--chapter", "2",
      "--verses", "1",
      "--to", "es",
      "--provider", "fake",
      "--overwrite",
      "--db", filePath,
      "--json"
  ]);

  assert.equal(resultOverwrite.exitCode, 0);
  
  // Verify count is still 1 (not 2)
  const count = db.prepare("SELECT COUNT(*) as c FROM translations").get() as any;
  assert.equal(count.c, 1);
});
