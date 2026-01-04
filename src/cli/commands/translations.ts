import { Command } from "commander";
import { getTranslations } from "../../services/translations_query_service.js";
import { printResult } from "../../lib/output.js";
import { openDatabase } from "../../db/connection.js";
import { buildContext, wrapAction } from "../run.js";
import { requirePositiveInt } from "../../lib/validation.js";

export function registerTranslationsCommands(program: Command) {
  const translationsCmd = program.command("translations").description("Translations query commands");

  translationsCmd
    .command("get")
    .description("Get translations for a verse")
    .requiredOption("-b, --book <slug>", "Book slug")
    .requiredOption("-c, --chapter <number>", "Chapter number", parseInt)
    .requiredOption("-v, --verse <number>", "Verse number", parseInt)
    .action(wrapAction(program, async (options: any) => {
      const { config, outputMode } = buildContext(program);
      const db = openDatabase(config.dbPath);

      requirePositiveInt(options.chapter, "Chapter number");
      requirePositiveInt(options.verse, "Verse number");

      const results = getTranslations(db, {
          bookSlug: options.book,
          chapterNumber: options.chapter,
          verseNumber: options.verse
      });

      printResult({ success: true, data: results }, outputMode);
    }));
}
