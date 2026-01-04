import test from "node:test";
import assert from "node:assert/strict";
import { spawnCli } from "../helpers/spawn_cli.js";
import { createTempDb } from "../helpers/tmp_db.js";
import { storeBook } from "../../src/services/book_service.js";
import { upsertVerse } from "../../src/db/repositories/books.js";
import { insertTranslation } from "../../src/db/repositories/translations.js";

test("US4: Translations get", async (t) => {
  const { db, filePath, cleanup } = createTempDb();
  t.after(cleanup);

  storeBook(db, {
      slug: "gita",
      title: "Gita",
      chapters: [{ number: 1, expected_verse_count: 5 }]
  });
  const chapter = db.prepare("SELECT * FROM chapters").get() as any;
  const verse = upsertVerse(db, { chapterId: chapter.id, number: 1, sourceText: "Src" });
  insertTranslation(db, {
      verseId: verse.id,
      languageCode: "es",
      provider: "fake",
      text: "Hola"
  });

  const result = await spawnCli([
      "translations", "get",
      "--book", "gita",
      "--chapter", "1",
      "--verse", "1",
      "--db", filePath,
      "--json"
  ]);

  assert.equal(result.exitCode, 0);
  const json = JSON.parse(result.stdout);
  assert.equal(json.success, true);
  assert.equal(json.data.length, 1);
  assert.equal(json.data[0].text, "Hola");
  assert.equal(json.data[0].languageCode, "es");
});