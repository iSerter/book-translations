import { Command } from "commander";
import { translateVerses } from "../../services/translation_service.js";
import { printResult } from "../../lib/output.js";
import { openDatabase } from "../../db/connection.js";
import { buildContext, wrapAction } from "../run.js";
import { requirePositiveInt, requireLanguageCode } from "../../lib/validation.js";

export function registerVerseCommands(program: Command) {
  const verseCmd = program.command("verse").description("Verse commands");

  verseCmd
    .command("translate")
    .description("Translate verses")
    .requiredOption("-b, --book <slug>", "Book slug")
    .requiredOption("-c, --chapter <number>", "Chapter number", parseInt)
    .requiredOption("-v, --verses <numbers>", "Comma-separated verse numbers")
    .requiredOption("-l, --to <lang>", "Target language code")
    .requiredOption("-p, --provider <name>", "Provider name")
    .option("-m, --model <name>", "Model name")
    .option("-f, --overwrite", "Overwrite existing translations")
    .action(wrapAction(program, async (options: any) => {
      const { config, outputMode } = buildContext(program);
      const db = openDatabase(config.dbPath);

      requirePositiveInt(options.chapter, "Chapter number");
      const lang = requireLanguageCode(options.to, "Target language");
      
      const verseNumbers = options.verses.split(",").map((s: string) => {
          const n = parseInt(s.trim(), 10);
          return requirePositiveInt(n, "Verse number");
      });

      const result = await translateVerses(db, {
          bookSlug: options.book,
          chapterNumber: options.chapter,
          verseNumbers: verseNumbers,
          targetLanguage: lang,
          providerName: options.provider,
          model: options.model,
          overwrite: options.overwrite
      });

      printResult({ success: true, data: result }, outputMode);
    }));
}
