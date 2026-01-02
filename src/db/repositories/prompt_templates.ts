import type { Database as BetterSqlite3Database } from "better-sqlite3";
import { AppError, ExitCode } from "../../lib/errors.js";

export type PromptTemplateRecord = {
  id: number;
  name: string;
  content: string;
  createdAt: string;
};

export type UpsertPromptTemplateInput = {
  name: string;
  content: string;
};

export function upsertPromptTemplate(
  db: BetterSqlite3Database,
  input: UpsertPromptTemplateInput,
): PromptTemplateRecord {
  db.prepare(
    `INSERT INTO prompt_templates (name, content)
     VALUES (@name, @content)
     ON CONFLICT(name) DO UPDATE SET content = excluded.content`,
  ).run({ name: input.name, content: input.content });

  const row = db
    .prepare(
      `SELECT id, name, content, created_at as createdAt FROM prompt_templates WHERE name = @name`,
    )
    .get({ name: input.name });

  if (!row) {
    throw new AppError("Failed to upsert prompt template", { code: ExitCode.Unknown });
  }
  return mapPromptTemplate(row);
}

export function findPromptTemplateByName(
  db: BetterSqlite3Database,
  name: string,
): PromptTemplateRecord | undefined {
  const row = db
    .prepare(`SELECT id, name, content, created_at as createdAt FROM prompt_templates WHERE name = @name`)
    .get({ name });
  return row ? mapPromptTemplate(row) : undefined;
}

export function listPromptTemplates(db: BetterSqlite3Database): PromptTemplateRecord[] {
  const rows = db
    .prepare(`SELECT id, name, content, created_at as createdAt FROM prompt_templates ORDER BY name ASC`)
    .all();
  return rows.map(mapPromptTemplate);
}

function mapPromptTemplate(row: any): PromptTemplateRecord {
  return {
    id: row.id,
    name: row.name,
    content: row.content,
    createdAt: row.createdAt,
  };
}
