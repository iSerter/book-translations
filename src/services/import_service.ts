import type { Database } from "better-sqlite3";
import fs from "fs";
import path from "path";
import { z, ZodError } from "zod";
import { AppError, ExitCode } from "../lib/errors.js";
import { ImportFileSchema } from "../lib/validation.js";
import { upsertBook, upsertChapter, upsertVerse } from "../db/repositories/books.js";
import { upsertTranslation } from "../db/repositories/translations.js";
import { upsertChapterTranslation } from "../db/repositories/chapter_translations.js";

export type ImportOptions = {
    bookSlug?: string;
    provider?: string;
    model?: string;
    format?: string;
    dryRun?: boolean;
};

export type ImportResult = {
    success: boolean;
    count: {
        books: number;
        chapters: number;
        verses: number;
        translations: number;
    };
    errors: string[];
};

export function importFiles(
    db: Database, 
    filePaths: string[], 
    options: ImportOptions,
    onProgress?: (file: string, result: ImportResult) => void
): ImportResult {
    const totalResult: ImportResult = {
        success: true,
        count: { books: 0, chapters: 0, verses: 0, translations: 0 },
        errors: []
    };

    for (const filePath of filePaths) {
        const result = importFile(db, filePath, options);
        
        if (result.success) {
            totalResult.count.books += result.count.books;
            totalResult.count.chapters += result.count.chapters;
            totalResult.count.verses += result.count.verses;
            totalResult.count.translations += result.count.translations;
        } else {
            totalResult.success = false;
            totalResult.errors.push(`${path.basename(filePath)}: ${result.errors.join(", ")}`);
        }
        
        if (onProgress) onProgress(filePath, result);
    }

    return totalResult;
}

export function importFile(db: Database, filePath: string, options: ImportOptions): ImportResult {
    const result: ImportResult = {
        success: false,
        count: { books: 0, chapters: 0, verses: 0, translations: 0 },
        errors: []
    };

    try {
        // 1. Read and Parse File
        if (!fs.existsSync(filePath)) {
            throw new AppError(`File not found: ${filePath}`, { code: ExitCode.NotFound });
        }
        const fileContent = fs.readFileSync(filePath, "utf-8");
        let jsonData;
        try {
            jsonData = JSON.parse(fileContent);
        } catch (e) {
            throw new AppError(`Invalid JSON in file: ${filePath}`, { code: ExitCode.Validation, cause: e });
        }

        // 2. Validate Schema
        // For now we only support 'sanskrit-scripture' which matches ImportFileSchema
        const parsed = ImportFileSchema.parse(jsonData);
        const chapterData = parsed.chapter;
        const verses = parsed.verses || chapterData.verses || [];

        // 3. Infer Metadata
        const parentDir = path.dirname(filePath);
        const grandParentDir = path.dirname(parentDir);

        // Book Slug
        let bookSlug = options.bookSlug;
        if (!bookSlug) {
            bookSlug = path.basename(grandParentDir).toLowerCase().replace(/[^a-z0-9-]/g, "-");
            if (!bookSlug) bookSlug = "unknown-book";
        }

        // Provider / Model
        let provider = options.provider;
        let model = options.model || "";

        if (!provider) {
            const providerDir = path.basename(parentDir);
            const parts = providerDir.split("-");
            if (parts.length > 0) {
                provider = parts[0];
                if (parts.length > 1 && !model) {
                    model = parts.slice(1).join("-");
                }
            } else {
                provider = "unknown-provider";
            }
        }

        // 4. DB Transaction
        if (options.dryRun) {
            result.success = true;
            return result;
        }

        const runImport = db.transaction(() => {
            // Upsert Book
            const book = upsertBook(db, {
                slug: bookSlug!,
                title: bookSlug!.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "), // Simple titleize
            });
            result.count.books++; // In US1 we assume 1 book created/found

            // Upsert Chapter
            const chapter = upsertChapter(db, {
                bookId: book.id,
                number: chapterData.number,
                title: chapterData.title_english,
                expectedVerseCount: chapterData.total_verses
            });
            result.count.chapters++;

            // Process Chapter Translations
            for (const [key, val] of Object.entries(chapterData)) {
                if (key.startsWith("title_") && typeof val === "string" && val.trim().length > 0) {
                    const lang = key.replace("title_", "");
                    // Skip 'english' if it is considered the source/default, but spec says "store translated chapter titles"
                    // If title_english is stored as chapter.title, do we also store it as a translation?
                    // The spec says "Import process MUST parse and persist translated chapter titles".
                    // Storing it as a translation as well allows uniform access.
                    const code = mapLanguageToCode(lang);
                    
                    upsertChapterTranslation(db, {
                        chapterId: chapter.id,
                        languageCode: code,
                        provider: provider!,
                        model: model,
                        title: val
                    });
                    // We don't track chapter translation count separately in ImportResult, maybe we should?
                    // But result.count.translations is for verses? 
                    // Let's count it in result.count.translations for now or just ignore the count.
                }
            }

            // Upsert Verses and Translations
            for (const v of verses) {
                const verse = upsertVerse(db, {
                    chapterId: chapter.id,
                    number: v.verse_number,
                    sourceText: v.sanskrit
                });
                result.count.verses++;

                // Process Translations
                // The schema has 'english' and 'turkish' as optional keys, plus dynamic keys
                // We iterate over keys of 'v' that are not 'verse_number' or 'sanskrit'
                for (const [key, val] of Object.entries(v)) {
                    if (key === "verse_number" || key === "sanskrit") continue;
                    
                    if (val && typeof val === "object" && "translation" in val) {
                        const langCode = key; // e.g. 'english', 'turkish'
                        // Map full language names to codes if needed?
                        // For now assume key is the language code or name.
                        // Spec says: "Language codes in the JSON (e.g., 'english', 'turkish') can be mapped to standard ISO codes (e.g., 'en', 'tr')."
                        const code = mapLanguageToCode(langCode);
                        
                        upsertTranslation(db, {
                            verseId: verse.id,
                            languageCode: code,
                            provider: provider!,
                            model: model,
                            text: (val as any).translation,
                            commentary: (val as any).commentary
                        });
                        result.count.translations++;
                    }
                }
            }
        });

        runImport();
        result.success = true;

    } catch (error: any) {
        result.success = false;
        if (error instanceof ZodError) {
             const issues = error.issues.map((e: any) => `${e.path.join(".")}: ${e.message}`).join("; ");
             result.errors.push(`Validation Error: ${issues}`);
        } else {
             result.errors.push(error instanceof AppError ? error.message : error.message || "Unknown error");
        }
    }

    return result;
}

function mapLanguageToCode(lang: string): string {
    const map: Record<string, string> = {
        "english": "en",
        "turkish": "tr",
        "sanskrit": "sa"
    };
    return map[lang.toLowerCase()] || lang.toLowerCase().slice(0, 2);
}