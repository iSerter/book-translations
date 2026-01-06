import { Command } from "commander";
import fs from "fs";
import path from "path";
import { getTranslations } from "../../services/translations_query_service.js";
import { importFile, importFiles } from "../../services/import_service.js";
import { printResult } from "../../lib/output.js";
import { openDatabase } from "../../db/connection.js";
import { buildContext, wrapAction } from "../run.js";
import { requirePositiveInt } from "../../lib/validation.js";

export function registerTranslationsCommands(program: Command) {
  const translationsCmd = program.command("translations").description("Translations query commands");

  translationsCmd
    .command("import")
    .description("Import translation data from a JSON file")
    .argument("<file>", "Path to JSON file")
    .option("-b, --book-slug <slug>", "Book slug")
    .option("-p, --provider <name>", "Translation provider name")
    .option("--dry-run", "Dry run (no DB changes)")
    .action(wrapAction(program, async (filePattern: string, options: any) => {
      const { config, outputMode } = buildContext(program);
      const db = openDatabase(config.dbPath);

      let files: string[] = [];
      try {
        if (fs.existsSync(filePattern) && fs.lstatSync(filePattern).isFile()) {
            files = [filePattern];
        } else {
            // @ts-ignore - fs.globSync is new in Node 22
            files = fs.globSync(filePattern).map((f: string) => path.resolve(f));
        }
      } catch (e) {
         // ignore
      }

      if (files.length === 0) {
          if (outputMode !== "json") console.log(`No files found matching pattern: ${filePattern}`);
          // If json mode, print failure?
          if (outputMode === "json") printResult({ success: false, error: "No files found" }, outputMode);
          return;
      }

      if (outputMode !== "json") {
          console.log(`Found ${files.length} file(s) matching pattern.`);
      }

      const result = importFiles(db, files, {
          bookSlug: options.bookSlug,
          provider: options.provider,
          dryRun: options.dryRun
      }, (f, res) => {
          if (outputMode !== "json") {
            console.log(`Processing ${f}...`);
            if (res.success) {
                console.log(`  - Book: ${options.bookSlug || "inferred"} (found/created)`);
                console.log(`  - Chapter: (created)`); 
                console.log(`  - Verses: ${res.count.verses} (imported)`);
                console.log(`  - Translations: ${res.count.translations} (imported)`);
            } else {
                console.error(`  Error: ${res.errors.join(", ")}`);
            }
          }
      });

      if (outputMode === "json") {
        printResult({ success: result.success, data: result }, outputMode);
      } else {
        const failCount = result.errors.length;
        const successCount = files.length - failCount;
        console.log(`Import complete. ${successCount} success, ${failCount} failed.`);
      }
      
      if (!result.success) {
          process.exitCode = 1;
      }
    }));

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
