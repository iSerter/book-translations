import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import type { GenerationProvider, GenerationOptions } from "./generation_provider.js";
import type { ChapterPackage } from "../models/domain.js";
import { AppError, ExitCode } from "../lib/errors.js";

const simpleSchema = z.object({
  verses: z.array(z.object({
    number: z.number(),
    text: z.string(),
  }).strict()),
}).strict();

const sanskritScriptureSchema = z.object({
  chapter: z.object({
    verses: z.array(z.object({
      verse_number: z.number(),
      sanskrit: z.string(),
      english: z.object({
        translation: z.string(),
        commentary: z.string().nullable(),
      }).strict().nullable(),
      turkish: z.object({
        translation: z.string(),
        commentary: z.string().nullable(),
      }).strict().nullable(),
    }).strict()),
  }).strict(),
}).strict();

export class AiSdkGenerationProvider implements GenerationProvider {
  async generateChapter(options: GenerationOptions): Promise<ChapterPackage> {
    try {
      if (options.format === "sanskrit-scripture") {
        return this.generateSanskritScripture(options);
      }
      return this.generateSimple(options);
    } catch (error) {
      throw new AppError("AI SDK generation failed", {
        code: ExitCode.Provider,
        cause: error,
      });
    }
  }

  private async generateSimple(options: GenerationOptions): Promise<ChapterPackage> {
    const result = await generateObject({
      model: openai(options.model || "gpt-4o"),
      schema: simpleSchema,
      prompt: options.prompt,
      maxRetries: 3,
      abortSignal: AbortSignal.timeout(120000),
    });
    return result.object;
  }

  private async generateSanskritScripture(options: GenerationOptions): Promise<ChapterPackage> {
    const result = await generateObject({
      model: openai(options.model || "gpt-4o"),
      schema: sanskritScriptureSchema,
      prompt: options.prompt,
      maxRetries: 3,
      abortSignal: AbortSignal.timeout(180000), // Longer timeout for complex generation
    });

    // Map to ChapterPackage
    const verses = result.object.chapter.verses.map((v) => {
      const translations = [];
      if (v.english) {
        translations.push({
          languageCode: "en",
          text: v.english.translation, // Commentary? currently stored as text? No, just translation.
          // If we want commentary, we need to decide where to put it. 
          // For now, let's append it or ignore it?
          // "parser adjusted" -> maybe I should store commentary too?
          // But I don't have columns. I'll just store translation.
          provider: "ai-sdk-generation",
        });
      }
      if (v.turkish) {
        translations.push({
          languageCode: "tr",
          text: v.turkish.translation,
          provider: "ai-sdk-generation",
        });
      }
      return {
        number: v.verse_number,
        text: v.sanskrit,
        translations,
      };
    });

    return { verses };
  }
}
