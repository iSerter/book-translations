import type { Database } from "better-sqlite3";
import type { CreateBookInput } from "../models/domain.js";
import { upsertBook, upsertChapter, upsertVerse } from "../db/repositories/books.js";
import { requirePositiveInt } from "../lib/validation.js";

export function storeBook(db: Database, input: CreateBookInput): void {
  const transaction = db.transaction(() => {
    // 1. Store Book
    const book = upsertBook(db, {
      slug: input.slug,
      title: input.title,
      author: input.author,
    });

    // 2. Store Chapters
    for (const chapterInput of input.chapters) {
      requirePositiveInt(chapterInput.number, `Chapter number for book ${input.slug}`);
      if (chapterInput.expected_verse_count !== undefined) {
        requirePositiveInt(chapterInput.expected_verse_count, `Expected verse count for chapter ${chapterInput.number}`);
      }

      const chapter = upsertChapter(db, {
        bookId: book.id,
        number: chapterInput.number,
        expectedVerseCount: chapterInput.expected_verse_count,
      });

      // 3. Store Verses (if any in input)
      if (chapterInput.verses) {
        for (const verseInput of chapterInput.verses) {
            requirePositiveInt(verseInput.number, `Verse number for chapter ${chapterInput.number}`);
            upsertVerse(db, {
                chapterId: chapter.id,
                number: verseInput.number,
                sourceText: verseInput.source_text
            });
        }
      }
    }
  });

  transaction();
}