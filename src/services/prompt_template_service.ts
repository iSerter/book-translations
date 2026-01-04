import type { Database } from "better-sqlite3";
import { upsertPromptTemplate, findPromptTemplateByName, listPromptTemplates, type PromptTemplateRecord } from "../db/repositories/prompt_templates.js";
import { AppError, ExitCode } from "../lib/errors.js";

export function addTemplate(db: Database, name: string, content: string): PromptTemplateRecord {
  if (!name.trim()) {
      throw new AppError("Name is required", { code: ExitCode.Validation });
  }
  if (!content.trim()) {
      throw new AppError("Content is required", { code: ExitCode.Validation });
  }
  return upsertPromptTemplate(db, { name, content });
}

export function getTemplate(db: Database, name: string): PromptTemplateRecord | undefined {
  return findPromptTemplateByName(db, name);
}

export function listTemplates(db: Database): PromptTemplateRecord[] {
  return listPromptTemplates(db);
}
