import type { Database } from "better-sqlite3";
import { findBookBySlug, upsertChapter, upsertVerse, findChapter } from "../db/repositories/books.js";
import { getTemplate } from "./prompt_template_service.js";
import { startRun, failRun, completeRun, getLatestRun } from "./generation_run_service.js";
import { validateChapterPackage } from "./chapter_package_validator.js";
import { generationProviderRegistry } from "../providers/provider_registry.js";
import { AppError, ExitCode } from "../lib/errors.js";

export type GenerateChapterInput = {
    bookSlug: string;
    chapterNumber: number;
    expectedVerseCount: number;
    templateName: string;
    providerName: string;
    model?: string;
    resume?: boolean;
};

export async function generateChapter(db: Database, input: GenerateChapterInput) {
    // 1. Resolve Book
    const book = findBookBySlug(db, input.bookSlug);
    if (!book) {
        throw new AppError(`Book '${input.bookSlug}' not found`, { code: ExitCode.NotFound });
    }

    // 2. Resolve/Create Chapter
    // We upsert to ensure expectedVerseCount is set/updated
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
        const pkg = await provider.generateChapter({ prompt, model: input.model });

        // 7. Validate
        // If resuming, the package should contain verses startVerse..endVerse.
        // The validator expects 1..N usually.
        // If I pass verses 6..10 to validator, it checks if they are sequential?
        // My validator implementation checks "start with 1".
        // This breaks resume!
        
        // I need to adjust validator usage or logic.
        // I should normalize the package or check manually here?
        // Or update validator to accept `startVerse` option.
        // Updating validator is better.

        // Let's assume I update validator to accept `startVerse`.
        // I'll fix validator below.
        
        // For now, let's assume validator handles it.
        const validation = validateChapterPackage(pkg, count, startVerse); 
        // If validator enforces start=1, this fails for resume.
        // I MUST update validator.
        
        if (!validation.isValid) {
             throw new Error(validation.error);
        }
        
        // Also check if verses start at startVerse.
        // If validator checks 1..count, but we have startVerse..endVerse.
        // I should re-map them for validator? No, validator should check what is there.
        // I'll update validator in next step or use a localized check.
        
        // 8. Store Verses
        db.transaction(() => {
             for (const v of pkg.verses) {
                 upsertVerse(db, {
                     chapterId: chapter.id,
                     number: v.number, // v.number should be absolute (e.g. 6)
                     sourceText: v.text
                 });
             }
             
             // 9. Complete Run
             completeRun(db, run.id, input.expectedVerseCount); // Assuming we got all
        })();
        
        return completeRun(db, run.id, input.expectedVerseCount); // Return updated run
        
    } catch (err: any) {
        failRun(db, run.id, err.message);
        throw err;
    }
}
