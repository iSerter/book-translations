import type { Database as BetterSqlite3Database } from "better-sqlite3";
import { AppError, ExitCode } from "../../lib/errors.js";

export type GenerationLogRecord = {
  id: number;
  runId: number;
  stepNumber: number;
  requestPrompt: string;
  responseContent: string | null;
  createdAt: string;
};

export type CreateGenerationLogInput = {
  runId: number;
  stepNumber: number;
  requestPrompt: string;
  responseContent?: string | null;
};

export function createGenerationLog(
  db: BetterSqlite3Database,
  input: CreateGenerationLogInput,
): GenerationLogRecord {
  const info = db.prepare(
    `INSERT INTO generation_logs (
      run_id,
      step_number,
      request_prompt,
      response_content
    ) VALUES (
      @runId,
      @stepNumber,
      @requestPrompt,
      @responseContent
    )`,
  ).run({
    runId: input.runId,
    stepNumber: input.stepNumber,
    requestPrompt: input.requestPrompt,
    responseContent: input.responseContent ?? null,
  });

  const row = db
    .prepare(
      `SELECT id, run_id as runId, step_number as stepNumber, request_prompt as requestPrompt, response_content as responseContent, created_at as createdAt
       FROM generation_logs WHERE id = @id`,
    )
    .get({ id: info.lastInsertRowid });

  if (!row) {
    throw new AppError("Failed to create generation log", { code: ExitCode.Unknown });
  }
  return mapGenerationLog(row);
}

function mapGenerationLog(row: any): GenerationLogRecord {
  return {
    id: row.id,
    runId: row.runId,
    stepNumber: row.stepNumber,
    requestPrompt: row.requestPrompt,
    responseContent: row.responseContent,
    createdAt: row.createdAt,
  };
}
