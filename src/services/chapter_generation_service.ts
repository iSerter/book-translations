import type { Database } from "better-sqlite3";
import { findBookBySlug, upsertChapter, upsertVerse, findChapter, upsertBook } from "../db/repositories/books.js";
import { getTemplate } from "./prompt_template_service.js";
import { startRun, failRun, completeRun, getLatestRun } from "./generation_run_service.js";
import { validateChapterPackage } from "./chapter_package_validator.js";
import { generationProviderRegistry } from "../providers/provider_registry.js";
import { insertTranslation, findTranslation } from "../db/repositories/translations.js"; // Import translation repo
import { AppError, ExitCode } from "../lib/errors.js";

export type GenerateChapterInput = {
    bookSlug: string;
    chapterNumber: number;
    expectedVerseCount: number;
    templateName: string;
    providerName: string;
    model?: string;
    resume?: boolean;
    format?: string;
};

export async function generateChapter(db: Database, input: GenerateChapterInput) {
    // 1. Resolve Book (Auto-create if missing)
    let book = findBookBySlug(db, input.bookSlug);
    if (!book) {
        book = upsertBook(db, {
            slug: input.bookSlug,
            title: input.bookSlug, // Use slug as default title
        });
    }

    // 2. Resolve/Create Chapter
    const chapter = upsertChapter(db, {
        bookId: book.id,
        number: input.chapterNumber,
        expectedVerseCount: input.expectedVerseCount
    });

    // 3. Determine Start Verse
    let startVerse = 1;
    if (input.resume) {
        const lastRun = getLatestRun(db, book.id, input.chapterNumber);
        if (lastRun && lastRun.lastCompletedVerse < input.expectedVerseCount) {
            startVerse = lastRun.lastCompletedVerse + 1;
        }
    }

    if (startVerse > input.expectedVerseCount) {
        throw new AppError("Chapter already complete", { code: ExitCode.Conflict });
    }

    const count = input.expectedVerseCount - startVerse + 1;
    const endVerse = input.expectedVerseCount;

    // 4. Prepare Prompt
    const template = getTemplate(db, input.templateName);
    if (!template) {
        throw new AppError(`Template '${input.templateName}' not found`, { code: ExitCode.NotFound });
    }

    let prompt = template.content
        .replace(/\{\{bookTitle\}\}/g, book.title)
        .replace(/\{\{chapterNumber\}\}/g, String(input.chapterNumber))
        .replace(/\{\{startVerse\}\}/g, String(startVerse))
        .replace(/\{\{endVerse\}\}/g, String(endVerse))
        .replace(/\{\{count\}\}/g, String(count));
    
    // 5. Start Run
    const run = startRun(db, {
        bookId: book.id,
        chapterNumber: input.chapterNumber,
        expectedVerseCount: input.expectedVerseCount,
        provider: input.providerName,
        model: input.model,
        lastCompletedVerse: startVerse - 1
    });

    try {
        // 6. Call Provider
        const provider = generationProviderRegistry.get(input.providerName);
        const pkg = await provider.generateChapter({ 
            prompt, 
            model: input.model,
            format: input.format 
        });

        // 7. Validate
        const validation = validateChapterPackage(pkg, count, startVerse); 
        
        if (!validation.isValid) {
             throw new Error(validation.error);
        }
        
        // 8. Store Verses AND Translations
        db.transaction(() => {
             for (const v of pkg.verses) {
                 const verse = upsertVerse(db, {
                     chapterId: chapter.id,
                     number: v.number,
                     sourceText: v.text
                 });

                 if (v.translations) {
                     for (const t of v.translations) {
                         // Check existence first or just handle conflict?
                         // insertTranslation handles conflict by throwing.
                         // We should maybe use upsert logic or ignore if exists?
                         // Since this is generation, we probably want to save it.
                         // But insertTranslation uses SQL `INSERT`.
                         // Let's check first.
                         const existing = findTranslation(db, verse.id, t.languageCode, t.provider || input.providerName, null);
                         if (!existing) {
                             insertTranslation(db, {
                                 verseId: verse.id,
                                 languageCode: t.languageCode,
                                 provider: t.provider || input.providerName,
                                 text: t.text,
                                 model: input.model
                             });
                         }
                     }
                 }
             }
             
             // 9. Complete Run
             completeRun(db, run.id, input.expectedVerseCount); 
        })();
        
        return completeRun(db, run.id, input.expectedVerseCount);
        
    } catch (err: any) {
        failRun(db, run.id, err.message);
        throw err;
    }
}
