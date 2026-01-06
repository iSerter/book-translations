import type { Database } from "better-sqlite3";
import { findBookBySlug, findChapter, findVerse, type VerseRecord, type ChapterRecord } from "../db/repositories/books.js";
import { insertTranslation, findTranslation } from "../db/repositories/translations.js";
import { upsertChapterTranslation, findChapterTranslation } from "../db/repositories/chapter_translations.js";
import { translationProviderRegistry } from "../providers/provider_registry.js";
import { AppError, ExitCode } from "../lib/errors.js";

export type TranslateVersesInput = {
    bookSlug: string;
    chapterNumber: number;
    verseNumbers: number[];
    targetLanguage: string;
    providerName: string;
    model?: string;
    overwrite?: boolean;
};

export async function translateVerses(db: Database, input: TranslateVersesInput) {
    // 1. Resolve Book, Chapter
    const book = findBookBySlug(db, input.bookSlug);
    if (!book) throw new AppError(`Book '${input.bookSlug}' not found`, { code: ExitCode.NotFound });
    
    const chapter = findChapter(db, book.id, input.chapterNumber);
    if (!chapter) throw new AppError(`Chapter ${input.chapterNumber} not found`, { code: ExitCode.NotFound });

    // 2. Resolve Verses
    const verses: VerseRecord[] = [];
    for (const num of input.verseNumbers) {
        const v = findVerse(db, chapter.id, num);
        if (!v) throw new AppError(`Verse ${num} not found`, { code: ExitCode.NotFound });
        if (!v.sourceText) throw new AppError(`Verse ${num} has no source text`, { code: ExitCode.Validation });
        verses.push(v);
    }

    // 3. Check conflicts
    if (!input.overwrite) {
        for (const v of verses) {
            const existing = findTranslation(db, v.id, input.targetLanguage, input.providerName, input.model || null);
            if (existing) {
                throw new AppError(`Translation exists for verse ${v.number}`, { code: ExitCode.Conflict });
            }
        }
    }

    // 4. Call Provider
    const provider = translationProviderRegistry.get(input.providerName);
    const texts = verses.map(v => v.sourceText!); 
    
    try {
        const results = await provider.translateBatch(texts, input.targetLanguage);
        
        if (results.length !== verses.length) {
            throw new Error("Provider returned count mismatch");
        }

        // 5. Store
        db.transaction(() => {
            for (let i = 0; i < verses.length; i++) {
                const v = verses[i];
                const text = results[i];
                
                if (input.overwrite) {
                    db.prepare(`DELETE FROM translations WHERE verse_id = ? AND language_code = ? AND provider = ? AND model = ?`)
                      .run(v.id, input.targetLanguage, input.providerName, input.model || '');
                }
                
                insertTranslation(db, {
                    verseId: v.id,
                    languageCode: input.targetLanguage,
                    provider: input.providerName,
                    model: input.model,
                    text: text
                });
            }
        })();
        
        return { success: true, count: verses.length };
        
    } catch (err: any) {
        if (err instanceof AppError) throw err;
        throw new AppError(`Translation failed: ${err.message}`, { code: ExitCode.Provider, cause: err });
    }
}

export type TranslateChapterTitlesInput = {
    bookSlug: string;
    chapterNumbers: number[];
    targetLanguage: string;
    providerName: string;
    model?: string;
    overwrite?: boolean;
};

export async function translateChapterTitles(db: Database, input: TranslateChapterTitlesInput) {
    // 1. Resolve Book
    const book = findBookBySlug(db, input.bookSlug);
    if (!book) throw new AppError(`Book '${input.bookSlug}' not found`, { code: ExitCode.NotFound });

    // 2. Resolve Chapters
    const chapters: ChapterRecord[] = [];
    for (const num of input.chapterNumbers) {
        const c = findChapter(db, book.id, num);
        if (!c) throw new AppError(`Chapter ${num} not found`, { code: ExitCode.NotFound });
        if (!c.title) throw new AppError(`Chapter ${num} has no source title`, { code: ExitCode.Validation });
        chapters.push(c);
    }

    // 3. Check conflicts
    if (!input.overwrite) {
        for (const c of chapters) {
            const existing = findChapterTranslation(db, c.id, input.targetLanguage, input.providerName, input.model);
            if (existing) {
                throw new AppError(`Translation exists for chapter ${c.number} title`, { code: ExitCode.Conflict });
            }
        }
    }

    // 4. Call Provider
    const provider = translationProviderRegistry.get(input.providerName);
    const titles = chapters.map(c => c.title!);

    try {
        const results = await provider.translateBatch(titles, input.targetLanguage);

        if (results.length !== chapters.length) {
            throw new Error("Provider returned count mismatch");
        }

        // 5. Store
        db.transaction(() => {
            for (let i = 0; i < chapters.length; i++) {
                const c = chapters[i];
                const translatedTitle = results[i];

                upsertChapterTranslation(db, {
                    chapterId: c.id!,
                    languageCode: input.targetLanguage,
                    provider: input.providerName,
                    model: input.model,
                    title: translatedTitle
                });
            }
        })();

        return { success: true, count: chapters.length };

    } catch (err: any) {
        if (err instanceof AppError) throw err;
        throw new AppError(`Translation failed: ${err.message}`, { code: ExitCode.Provider, cause: err });
    }
}