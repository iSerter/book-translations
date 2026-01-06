import assert from "node:assert/strict";
import test from "node:test";
import path from "node:path";

import { importFile } from "../../src/services/import_service.js";
import { findChapterTranslation } from "../../src/db/repositories/chapter_translations.js";
import { findBookBySlug, findChapter } from "../../src/db/repositories/books.js";
import { createTempDb } from "../helpers/tmp_db.js";

test("importFile parses and stores chapter title translations", () => {
  const { db, cleanup } = createTempDb();
  try {
    const fixturePath = path.resolve("tests/fixtures/import/chapter_with_title_translation.json");
    
    // We need to simulate the directory structure or provide options
    // The import service infers provider/model from path if not provided
    // Let's rely on options
    const result = importFile(db, fixturePath, {
        bookSlug: "gita-test",
        provider: "test-provider",
        model: "test-model"
    });

    assert.ok(result.success, `Import failed: ${result.errors.join(", ")}`);
    
    const book = findBookBySlug(db, "gita-test");
    assert.ok(book);

    const chapter = findChapter(db, book.id, 1);
    assert.ok(chapter);
    assert.equal(chapter.title, "The Yoga of Arjuna's Dejection");

    // Check Turkish translation
    const trTranslation = findChapterTranslation(db, chapter.id, "tr", "test-provider", "test-model");
    assert.ok(trTranslation, "Turkish translation not found");
    assert.equal(trTranslation.title, "Arjuna'nın Kederinin Yogası");

    // Check Sanskrit translation (title_sanskrit) -> mapped to 'sa'?
    // The logic needs to handle mapping or just use the code
    const saTranslation = findChapterTranslation(db, chapter.id, "sa", "test-provider", "test-model");
    assert.ok(saTranslation, "Sanskrit translation not found");
    assert.equal(saTranslation.title, "अर्जुनविषादयोग");

  } finally {
    cleanup();
  }
});
