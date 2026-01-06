import { Command } from "commander";
import { generateChapter } from "../../services/chapter_generation_service.js";
import { translateChapterTitles } from "../../services/translation_service.js";
import { printResult } from "../../lib/output.js";
import { openDatabase } from "../../db/connection.js";
import { buildContext, wrapAction } from "../run.js";
import { requirePositiveInt, requireLanguageCode } from "../../lib/validation.js";

export function registerChapterCommands(program: Command) {
  const chapterCmd = program.command("chapter").description("Chapter commands");

  chapterCmd
    .command("generate")
    .description("Generate chapter content using a provider")
    .requiredOption("-b, --book <slug>", "Book slug")
    .requiredOption("-c, --chapter <number>", "Chapter number", parseInt)
    .requiredOption("-e, --expected-verses <number>", "Expected verse count", parseInt)
    .requiredOption("-t, --template <name>", "Prompt template name")
    .requiredOption("-p, --provider <name>", "Provider name")
    .option("-m, --model <name>", "Model name")
    .option("-r, --resume", "Resume generation if interrupted")
    .option("--format <type>", "Output format (simple, sanskrit-scripture)")
    .action(wrapAction(program, async (options: any) => {
      const { config, outputMode } = buildContext(program);
      const db = openDatabase(config.dbPath);

      requirePositiveInt(options.chapter, "Chapter number");
      requirePositiveInt(options.expectedVerses, "Expected verse count");

      const result = await generateChapter(db, {
          bookSlug: options.book,
          chapterNumber: options.chapter,
          expectedVerseCount: options.expectedVerses,
          templateName: options.template,
          providerName: options.provider,
          model: options.model,
          resume: options.resume,
          format: options.format
      });

      printResult({ success: true, data: result }, outputMode);
    }));

  chapterCmd
    .command("translate")
    .description("Translate chapter titles")
    .requiredOption("-b, --book <slug>", "Book slug")
    .requiredOption("-c, --chapters <numbers>", "Comma-separated chapter numbers")
    .requiredOption("-l, --to <lang>", "Target language code")
    .requiredOption("-p, --provider <name>", "Provider name")
    .option("-m, --model <name>", "Model name")
    .option("-f, --overwrite", "Overwrite existing translations")
    .action(wrapAction(program, async (options: any) => {
      const { config, outputMode } = buildContext(program);
      const db = openDatabase(config.dbPath);

      const lang = requireLanguageCode(options.to, "Target language");
      const chapterNumbers = options.chapters.split(",").map((s: string) => {
          const n = parseInt(s.trim(), 10);
          return requirePositiveInt(n, "Chapter number");
      });

      const result = await translateChapterTitles(db, {
          bookSlug: options.book,
          chapterNumbers,
          targetLanguage: lang,
          providerName: options.provider,
          model: options.model,
          overwrite: options.overwrite
      });

      printResult({ success: true, data: result }, outputMode);
    }));
}
