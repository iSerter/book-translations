import type { Database } from "better-sqlite3";
import { findBookBySlug, findChapter, findVerse, type VerseRecord } from "../db/repositories/books.js";
import { insertTranslation, findTranslation } from "../db/repositories/translations.js";
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