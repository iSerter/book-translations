import type { Database as BetterSqlite3Database } from "better-sqlite3";
import { ChapterTranslation } from "../../models/domain.js";
import { AppError, ExitCode } from "../../lib/errors.js";

export type UpsertChapterTranslationInput = {
    chapterId: number;
    languageCode: string;
    provider: string;
    model?: string;
    title: string;
};

export function upsertChapterTranslation(db: BetterSqlite3Database, input: UpsertChapterTranslationInput): ChapterTranslation {
    const model = input.model ?? "";
    db.prepare(`
        INSERT INTO chapter_translations (chapter_id, language_code, provider, model, title)
        VALUES (@chapterId, @languageCode, @provider, @model, @title)
        ON CONFLICT(chapter_id, language_code, provider, model) DO UPDATE SET
            title = excluded.title
    `).run({
        chapterId: input.chapterId,
        languageCode: input.languageCode,
        provider: input.provider,
        model: model,
        title: input.title
    });

    const row = db.prepare(`
        SELECT id, chapter_id, language_code, provider, model, title, created_at
        FROM chapter_translations
        WHERE chapter_id = @chapterId 
          AND language_code = @languageCode 
          AND provider = @provider 
          AND model = @model
    `).get({
        chapterId: input.chapterId,
        languageCode: input.languageCode,
        provider: input.provider,
        model: model
    });

    if (!row) {
        throw new AppError("Failed to upsert chapter translation", { code: ExitCode.Unknown });
    }

    return mapChapterTranslation(row);
}

export function findChapterTranslation(
    db: BetterSqlite3Database,
    chapterId: number,
    languageCode: string,
    provider: string,
    model?: string
): ChapterTranslation | undefined {
    const modelVal = model ?? "";
    const row = db.prepare(`
        SELECT id, chapter_id, language_code, provider, model, title, created_at
        FROM chapter_translations
        WHERE chapter_id = @chapterId 
          AND language_code = @languageCode 
          AND provider = @provider 
          AND model = @model
    `).get({
        chapterId,
        languageCode,
        provider,
        model: modelVal
    });

    return row ? mapChapterTranslation(row) : undefined;
}

function mapChapterTranslation(row: any): ChapterTranslation {
    return {
        id: row.id,
        chapter_id: row.chapter_id,
        language_code: row.language_code,
        provider: row.provider,
        model: row.model === "" ? undefined : row.model,
        title: row.title,
        created_at: row.created_at
    };
}