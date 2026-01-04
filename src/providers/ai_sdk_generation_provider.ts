import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import type { GenerationProvider, GenerationOptions } from "./generation_provider.js";
import type { ChapterPackage } from "../models/domain.js";
import { AppError, ExitCode } from "../lib/errors.js";

const chapterSchema = z.object({
  verses: z.array(z.object({
    number: z.number(),
    text: z.string(),
  })),
});

export class AiSdkGenerationProvider implements GenerationProvider {
  async generateChapter(options: GenerationOptions): Promise<ChapterPackage> {
    try {
      const result = await generateObject({
        model: openai(options.model || "gpt-4o"),
        schema: chapterSchema,
        prompt: options.prompt,
        maxRetries: 3,
        abortSignal: AbortSignal.timeout(120000), // 2 mins timeout just in case
      });

      return result.object;
    } catch (error) {
      throw new AppError("AI SDK generation failed", {
        code: ExitCode.Provider,
        cause: error,
      });
    }
  }
}
