import assert from "node:assert/strict";
import test from "node:test";

import { AppError, ExitCode } from "../../src/lib/errors.js";
import {
  findBookBySlug,
  findChapter,
  findVerse,
  listChaptersForBook,
  listVersesForChapter,
  upsertBook,
  upsertChapter,
  upsertVerse,
} from "../../src/db/repositories/books.js";
import { insertTranslation, listTranslationsForVerse } from "../../src/db/repositories/translations.js";
import {
  createGenerationRun,
  getLatestGenerationRun,
  updateGenerationRun,
} from "../../src/db/repositories/generation_runs.js";
import { createTempDb } from "../helpers/tmp_db.js";

test("book, chapter, and verse upserts are idempotent", () => {
  const { db, cleanup } = createTempDb();
  try {
    const first = upsertBook(db, { slug: "gita", title: "Bhagavad Gita" });
    const second = upsertBook(db, { slug: "gita", title: "Gita", author: "Vyasa" });

    assert.equal(first.id, second.id);
    assert.equal(second.title, "Gita");
    assert.equal(findBookBySlug(db, "gita")?.author, "Vyasa");

    const chapter = upsertChapter(db, { bookId: second.id, number: 1, expectedVerseCount: 47 });
    const chapterAgain = upsertChapter(db, { bookId: second.id, number: 1, expectedVerseCount: 48 });
    assert.equal(chapter.id, chapterAgain.id);
    assert.equal(chapterAgain.expectedVerseCount, 48);

    const verse = upsertVerse(db, { chapterId: chapter.id, number: 1, sourceText: "Hello" });
    const verseAgain = upsertVerse(db, { chapterId: chapter.id, number: 1, sourceText: "Hello world" });
    assert.equal(verse.id, verseAgain.id);
    assert.equal(findVerse(db, chapter.id, 1)?.sourceText, "Hello world");

    assert.equal(listChaptersForBook(db, second.id).length, 1);
    assert.equal(listVersesForChapter(db, chapter.id).length, 1);
  } finally {
    cleanup();
  }
});

test("translations enforce uniqueness", () => {
  const { db, cleanup } = createTempDb();
  try {
    const book = upsertBook(db, { slug: "gita", title: "Gita" });
    const chapter = upsertChapter(db, { bookId: book.id, number: 1 });
    const verse = upsertVerse(db, { chapterId: chapter.id, number: 1 });

    insertTranslation(db, {
      verseId: verse.id,
      languageCode: "en",
      provider: "fake",
      text: "Hello",
    });

    assert.throws(
      () =>
        insertTranslation(db, {
          verseId: verse.id,
          languageCode: "en",
          provider: "fake",
          text: "Duplicate",
        }),
      (err: unknown) => {
        assert.ok(err instanceof AppError);
        assert.equal(err.code, ExitCode.Conflict);
        return true;
      },
    );

    const translations = listTranslationsForVerse(db, verse.id);
    assert.equal(translations.length, 1);
    assert.equal(translations[0].text, "Hello");
  } finally {
    cleanup();
  }
});

test("generation runs can be created and updated", () => {
  const { db, cleanup } = createTempDb();
  try {
    const book = upsertBook(db, { slug: "gita", title: "Gita" });
    const run = createGenerationRun(db, {
      bookId: book.id,
      chapterNumber: 1,
      expectedVerseCount: 5,
      provider: "fake",
      model: "fake-model",
    });

    assert.equal(run.status, "in_progress");
    const updated = updateGenerationRun(db, run.id, {
      status: "complete",
      lastCompletedVerse: 5,
      completedAt: "2024-01-01T00:00:00Z",
    });

    assert.equal(updated.status, "complete");
    assert.equal(updated.lastCompletedVerse, 5);
    assert.equal(updated.completedAt, "2024-01-01T00:00:00Z");

    const latest = getLatestGenerationRun(db, book.id, 1);
    assert.equal(latest?.id, run.id);
    assert.equal(latest?.status, "complete");
  } finally {
    cleanup();
  }
});
