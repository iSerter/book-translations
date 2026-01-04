import type { Database } from "better-sqlite3";
import { findBookBySlug, findChapter, findVerse } from "../db/repositories/books.js";
import { listTranslationsForVerse, type TranslationRecord } from "../db/repositories/translations.js";
import { AppError, ExitCode } from "../lib/errors.js";

export type GetTranslationsInput = {
    bookSlug: string;
    chapterNumber: number;
    verseNumber: number;
};

export function getTranslations(db: Database, input: GetTranslationsInput): TranslationRecord[] {
    const book = findBookBySlug(db, input.bookSlug);
    if (!book) throw new AppError(`Book '${input.bookSlug}' not found`, { code: ExitCode.NotFound });

    const chapter = findChapter(db, book.id, input.chapterNumber);
    if (!chapter) throw new AppError(`Chapter ${input.chapterNumber} not found`, { code: ExitCode.NotFound });

    const verse = findVerse(db, chapter.id, input.verseNumber);
    if (!verse) throw new AppError(`Verse ${input.verseNumber} not found`, { code: ExitCode.NotFound });

    return listTranslationsForVerse(db, verse.id);
}
