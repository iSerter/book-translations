import { Command } from "commander";
import { generateChapter } from "../../services/chapter_generation_service.js";
import { printResult } from "../../lib/output.js";
import { openDatabase } from "../../db/connection.js";
import { buildContext, wrapAction } from "../run.js";
import { requirePositiveInt } from "../../lib/validation.js";

export function registerChapterCommands(program: Command) {
  const chapterCmd = program.command("chapter").description("Chapter generation commands");

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
}
