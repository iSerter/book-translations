import { z } from "zod";
import { AppError, ExitCode } from "./errors.js";

export const TranslationContentSchema = z.object({
  translation: z.string(),
  commentary: z.string().optional(),
});

export const VerseSchema = z.object({
  verse_number: z.number(),
  sanskrit: z.string(),
  english: TranslationContentSchema.optional(),
  turkish: TranslationContentSchema.optional(),
}).catchall(TranslationContentSchema.or(z.any())); // Allow other languages/fields

export const ChapterSchema = z.object({
  number: z.number(),
  title_sanskrit: z.string().optional(),
  title_english: z.string().optional(),
  total_verses: z.number().optional(),
  verses: z.array(VerseSchema).optional(),
});

export const ImportFileSchema = z.object({
  chapter: ChapterSchema,
  verses: z.array(VerseSchema).optional(),
}).refine(data => data.chapter.verses || data.verses, {
  message: "Verses must be provided either inside the chapter object or as a sibling to it.",
  path: ["verses"]
});

export function requirePositiveInt(value: unknown, fieldName: string): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    throw new AppError(`${fieldName} must be a positive integer`, {
      code: ExitCode.Validation,
      details: { field: fieldName, value },
    });
  }
  return value;
}

export function requireLanguageCode(value: unknown, fieldName = "languageCode"): string {
  if (typeof value !== "string") {
    throw new AppError(`${fieldName} must be a string`, {
      code: ExitCode.Validation,
      details: { field: fieldName, value },
    });
  }
  const trimmed = value.trim();
  if (!/^[a-z]{2,5}$/i.test(trimmed)) {
    throw new AppError(`${fieldName} must be 2-5 letters`, {
      code: ExitCode.Validation,
      details: { field: fieldName, value },
    });
  }
  return trimmed.toLowerCase();
}
