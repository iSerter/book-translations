import type { Database as BetterSqlite3Database } from "better-sqlite3";
import { AppError, ExitCode } from "../../lib/errors.js";

export type GenerationRunStatus = "in_progress" | "complete" | "failed";

export type GenerationRunRecord = {
  id: number;
  bookId: number;
  chapterNumber: number;
  expectedVerseCount: number;
  provider: string | null;
  model: string | null;
  status: GenerationRunStatus;
  startedAt: string;
  completedAt: string | null;
  lastCompletedVerse: number;
  validationError: string | null;
};

export type CreateGenerationRunInput = {
  bookId: number;
  chapterNumber: number;
  expectedVerseCount: number;
  provider?: string | null;
  model?: string | null;
  status?: GenerationRunStatus;
  lastCompletedVerse?: number;
  validationError?: string | null;
  completedAt?: string | null;
};

export type UpdateGenerationRunInput = {
  status?: GenerationRunStatus;
  lastCompletedVerse?: number;
  validationError?: string | null;
  completedAt?: string | null;
};

export function createGenerationRun(
  db: BetterSqlite3Database,
  input: CreateGenerationRunInput,
): GenerationRunRecord {
  const info = db.prepare(
    `INSERT INTO generation_runs (
      book_id,
      chapter_number,
      expected_verse_count,
      provider,
      model,
      status,
      completed_at,
      last_completed_verse,
      validation_error
    ) VALUES (
      @bookId,
      @chapterNumber,
      @expectedVerseCount,
      @provider,
      @model,
      @status,
      @completedAt,
      @lastCompletedVerse,
      @validationError
    )`,
  ).run({
    bookId: input.bookId,
    chapterNumber: input.chapterNumber,
    expectedVerseCount: input.expectedVerseCount,
    provider: input.provider ?? null,
    model: input.model ?? null,
    status: input.status ?? "in_progress",
    completedAt: input.completedAt ?? null,
    lastCompletedVerse: input.lastCompletedVerse ?? 0,
    validationError: input.validationError ?? null,
  });

  const row = getGenerationRunById(db, info.lastInsertRowid as number);

  if (!row) {
    throw new AppError("Failed to create generation run", { code: ExitCode.Unknown });
  }
  return row;
}

export function updateGenerationRun(
  db: BetterSqlite3Database,
  id: number,
  updates: UpdateGenerationRunInput,
): GenerationRunRecord {
  const fields: string[] = [];
  const params: Record<string, unknown> = { id };

  if (updates.status !== undefined) {
    fields.push("status = @status");
    params.status = updates.status;
  }
  if (updates.lastCompletedVerse !== undefined) {
    fields.push("last_completed_verse = @lastCompletedVerse");
    params.lastCompletedVerse = updates.lastCompletedVerse;
  }
  if (updates.validationError !== undefined) {
    fields.push("validation_error = @validationError");
    params.validationError = updates.validationError;
  }
  if (updates.completedAt !== undefined) {
    fields.push("completed_at = @completedAt");
    params.completedAt = updates.completedAt;
  }

  if (fields.length === 0) {
    return getGenerationRunById(db, id) ?? (() => {
      throw new AppError("Generation run not found", { code: ExitCode.NotFound });
    })();
  }

  db.prepare(`UPDATE generation_runs SET ${fields.join(", ")} WHERE id = @id`).run(params);
  const row = getGenerationRunById(db, id);
  if (!row) {
    throw new AppError("Generation run not found", { code: ExitCode.NotFound });
  }
  return row;
}

export function getGenerationRunById(
  db: BetterSqlite3Database,
  id: number,
): GenerationRunRecord | undefined {
  const row = db
    .prepare(
      `SELECT id, book_id as bookId, chapter_number as chapterNumber, expected_verse_count as expectedVerseCount, provider, model, status, started_at as startedAt, completed_at as completedAt, last_completed_verse as lastCompletedVerse, validation_error as validationError
       FROM generation_runs WHERE id = @id`,
    )
    .get({ id });
  return row ? mapGenerationRun(row) : undefined;
}

export function listGenerationRunsForChapter(
  db: BetterSqlite3Database,
  bookId: number,
  chapterNumber: number,
): GenerationRunRecord[] {
  const rows = db
    .prepare(
      `SELECT id, book_id as bookId, chapter_number as chapterNumber, expected_verse_count as expectedVerseCount, provider, model, status, started_at as startedAt, completed_at as completedAt, last_completed_verse as lastCompletedVerse, validation_error as validationError
       FROM generation_runs WHERE book_id = @bookId AND chapter_number = @chapterNumber
       ORDER BY started_at DESC`)
    .all({ bookId, chapterNumber });
  return rows.map(mapGenerationRun);
}

export function getLatestGenerationRun(
  db: BetterSqlite3Database,
  bookId: number,
  chapterNumber: number,
): GenerationRunRecord | undefined {
  const row = db
    .prepare(
      `SELECT id, book_id as bookId, chapter_number as chapterNumber, expected_verse_count as expectedVerseCount, provider, model, status, started_at as startedAt, completed_at as completedAt, last_completed_verse as lastCompletedVerse, validation_error as validationError
       FROM generation_runs WHERE book_id = @bookId AND chapter_number = @chapterNumber
       ORDER BY started_at DESC
       LIMIT 1`)
    .get({ bookId, chapterNumber });
  return row ? mapGenerationRun(row) : undefined;
}

function mapGenerationRun(row: any): GenerationRunRecord {
  return {
    id: row.id,
    bookId: row.bookId,
    chapterNumber: row.chapterNumber,
    expectedVerseCount: row.expectedVerseCount,
    provider: row.provider ?? null,
    model: row.model ?? null,
    status: row.status,
    startedAt: row.startedAt,
    completedAt: row.completedAt ?? null,
    lastCompletedVerse: row.lastCompletedVerse,
    validationError: row.validationError ?? null,
  };
}
