import type { Database as BetterSqlite3Database } from "better-sqlite3";
import { AppError, ExitCode } from "../../lib/errors.js";
import { conflict, isConstraintError } from "./common.js";

export type TranslationRecord = {
  id: number;
  verseId: number;
  languageCode: string;
  provider: string;
  model: string | null;
  text: string;
  createdAt: string;
};

export type InsertTranslationInput = {
  verseId: number;
  languageCode: string;
  provider: string;
  model?: string | null;
  text: string;
};

export function insertTranslation(
  db: BetterSqlite3Database,
  input: InsertTranslationInput,
): TranslationRecord {
  try {
    db.prepare(`
      INSERT INTO translations (verse_id, language_code, provider, model, text)
      VALUES (@verseId, @languageCode, @provider, @model, @text)
    `).run({
      verseId: input.verseId,
      languageCode: input.languageCode,
      provider: input.provider,
      model: input.model ?? null,
      text: input.text,
    });
  } catch (error) {
    if (isConstraintError(error)) {
      throw conflict("Translation already exists", error);
    }
    throw error;
  }

  const row = db
    .prepare(
      `SELECT id, verse_id as verseId, language_code as languageCode, provider, model, text, created_at as createdAt
       FROM translations
       WHERE verse_id = @verseId AND language_code = @languageCode AND provider = @provider AND (model IS @model OR model = @model)`,
    )
    .get({
      verseId: input.verseId,
      languageCode: input.languageCode,
      provider: input.provider,
      model: input.model ?? null,
    });

  if (!row) {
    throw new AppError("Failed to insert translation", { code: ExitCode.Unknown });
  }
  return mapTranslation(row);
}

export function findTranslation(
  db: BetterSqlite3Database,
  verseId: number,
  languageCode: string,
  provider: string,
  model: string | null,
): TranslationRecord | undefined {
  const row = db
    .prepare(
      `SELECT id, verse_id as verseId, language_code as languageCode, provider, model, text, created_at as createdAt
       FROM translations
       WHERE verse_id = @verseId AND language_code = @languageCode AND provider = @provider AND (model IS @model OR model = @model)`,
    )
    .get({ verseId, languageCode, provider, model });
  return row ? mapTranslation(row) : undefined;
}

export function listTranslationsForVerse(
  db: BetterSqlite3Database,
  verseId: number,
): TranslationRecord[] {
  const rows = db
    .prepare(
      `SELECT id, verse_id as verseId, language_code as languageCode, provider, model, text, created_at as createdAt
       FROM translations
       WHERE verse_id = @verseId
       ORDER BY created_at ASC`)
    .all({ verseId });
  return rows.map(mapTranslation);
}

function mapTranslation(row: any): TranslationRecord {
  return {
    id: row.id,
    verseId: row.verseId,
    languageCode: row.languageCode,
    provider: row.provider,
    model: row.model ?? null,
    text: row.text,
    createdAt: row.createdAt,
  };
}
