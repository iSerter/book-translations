import assert from "node:assert/strict";
import test from "node:test";

import { upsertBook, upsertChapter } from "../../src/db/repositories/books.js";
import { 
    upsertChapterTranslation, 
    findChapterTranslation 
} from "../../src/db/repositories/chapter_translations.js";
import { createTempDb } from "../helpers/tmp_db.js";

test("chapter translations can be upserted and retrieved", () => {
  const { db, cleanup } = createTempDb();
  try {
    const book = upsertBook(db, { slug: "gita", title: "Bhagavad Gita" });
    const chapter = upsertChapter(db, { bookId: book.id, number: 1 });

    const translation = upsertChapterTranslation(db, {
        chapterId: chapter.id,
        languageCode: "tr",
        provider: "openai",
        model: "gpt-4",
        title: "Arjuna'nın Kederi"
    });

    assert.equal(translation.chapter_id, chapter.id);
    assert.equal(translation.title, "Arjuna'nın Kederi");
    assert.equal(translation.language_code, "tr");

    // Retrieve
    const found = findChapterTranslation(db, chapter.id, "tr", "openai", "gpt-4");
    assert.ok(found);
    assert.equal(found?.title, "Arjuna'nın Kederi");

    // Upsert update
    const updated = upsertChapterTranslation(db, {
        chapterId: chapter.id,
        languageCode: "tr",
        provider: "openai",
        model: "gpt-4",
        title: "Arjuna'nın Kederi (Güncel)"
    });

    assert.equal(updated.id, translation.id); // Same ID
    assert.equal(updated.title, "Arjuna'nın Kederi (Güncel)");
    
    const foundUpdated = findChapterTranslation(db, chapter.id, "tr", "openai", "gpt-4");
    assert.equal(foundUpdated?.title, "Arjuna'nın Kederi (Güncel)");

  } finally {
    cleanup();
  }
});
