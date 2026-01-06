import assert from "node:assert/strict";
import test from "node:test";

import { upsertBook, upsertChapter, upsertVerse } from "../../src/db/repositories/books.js";
import { upsertChapterTranslation } from "../../src/db/repositories/chapter_translations.js";
import { insertTranslation } from "../../src/db/repositories/translations.js";
import { ExportService } from "../../src/services/export_service.js";
import { createTempDb } from "../helpers/tmp_db.js";

test("ExportService includes localized chapter titles with fallback", async () => {
  const { db, cleanup } = createTempDb();
  try {
    const book = upsertBook(db, { slug: "gita", title: "Bhagavad Gita" });
    
    // Chapter 1 has a translation
    const c1 = upsertChapter(db, { bookId: book.id, number: 1, title: "Original Title 1" });
    upsertChapterTranslation(db, {
        chapterId: c1.id,
        languageCode: "tr",
        provider: "test",
        title: "Localized Title 1"
    });

    // Chapter 2 has NO translation
    const c2 = upsertChapter(db, { bookId: book.id, number: 2, title: "Original Title 2" });

    // Add a verse to each for export logic to work
    const v1 = upsertVerse(db, { chapterId: c1.id, number: 1, sourceText: "V1" });
    const v2 = upsertVerse(db, { chapterId: c2.id, number: 1, sourceText: "V2" });

    insertTranslation(db, { verseId: v1.id, languageCode: "tr", provider: "test", text: "V1 TR" });
    insertTranslation(db, { verseId: v2.id, languageCode: "tr", provider: "test", text: "V2 TR" });

    const exportService = new ExportService(db);
    
    // @ts-ignore - access private method for testing or use public exportBook if we had a mock exporter
    const data = exportService["aggregateData"]({
        bookSlug: "gita",
        languages: ["tr"],
        provider: "test"
    });

    assert.equal(data.chapters.length, 2);
    
    // Chapter 1 should have localized title
    assert.equal(data.chapters[0].number, 1);
    assert.equal(data.chapters[0].title, "Localized Title 1");

    // Chapter 2 should have fallback title
    assert.equal(data.chapters[1].number, 2);
    assert.equal(data.chapters[1].title, "Original Title 2");

  } finally {
    cleanup();
  }
});
