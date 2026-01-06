import assert from "node:assert/strict";
import test from "node:test";

import { upsertBook, upsertChapter } from "../../src/db/repositories/books.js";
import { findChapterTranslation } from "../../src/db/repositories/chapter_translations.js";
import { translateChapterTitles } from "../../src/services/translation_service.js";
import { createTempDb } from "../helpers/tmp_db.js";
import { translationProviderRegistry } from "../../src/providers/provider_registry.js";
import { FakeTranslationProvider } from "../../src/providers/fake_translation_provider.js";

test("translateChapterTitles translates and stores titles", async () => {
  const { db, cleanup } = createTempDb();
  try {
    // Setup provider
    if (!translationProviderRegistry.has("fake")) {
        translationProviderRegistry.register("fake", new FakeTranslationProvider());
    }

    // Setup data
    const book = upsertBook(db, { slug: "gita", title: "Bhagavad Gita" });
    const c1 = upsertChapter(db, { bookId: book.id, number: 1, title: "The Yoga of Dejection" });
    const c2 = upsertChapter(db, { bookId: book.id, number: 2, title: "Sankhya Yoga" });

    // Execute translation
    const result = await translateChapterTitles(db, {
        bookSlug: "gita",
        chapterNumbers: [1, 2],
        targetLanguage: "tr",
        providerName: "fake",
        model: "fake-model"
    });

    assert.ok(result.success);
    assert.equal(result.count, 2);

    // Verify storage
    const t1 = findChapterTranslation(db, c1.id, "tr", "fake", "fake-model");
    assert.ok(t1);
    assert.equal(t1.title, "[tr] The Yoga of Dejection");

    const t2 = findChapterTranslation(db, c2.id, "tr", "fake", "fake-model");
    assert.ok(t2);
    assert.equal(t2.title, "[tr] Sankhya Yoga");

  } finally {
    cleanup();
  }
});
