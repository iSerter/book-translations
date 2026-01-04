import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import type { TranslationProvider } from "./translation_provider.js";
import { AppError, ExitCode } from "../lib/errors.js";

const translationSchema = z.object({
  translations: z.array(z.string()),
});

export class AiSdkTranslationProvider implements TranslationProvider {
  async translateBatch(texts: string[], targetLanguage: string): Promise<string[]> {
      try {
          const prompt = `Translate the following ${texts.length} texts into ${targetLanguage}. Keep structure and meaning.
texts:
${texts.map((t, i) => `${i+1}. ${t}`).join("\n")}
`;
          const result = await generateObject({
              model: openai("gpt-4o"),
              schema: translationSchema,
              prompt: prompt,
          });
          
          if (result.object.translations.length !== texts.length) {
              throw new Error("Count mismatch from AI");
          }
          return result.object.translations;
      } catch (error) {
          throw new AppError("AI SDK translation failed", { code: ExitCode.Provider, cause: error });
      }
  }
}
