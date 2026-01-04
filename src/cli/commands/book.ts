import fs from "node:fs";
import path from "node:path";
import { Command } from "commander";
import { storeBook } from "../../services/book_service.js";
import { printResult } from "../../lib/output.js";
import { openDatabase } from "../../db/connection.js";
import { buildContext, wrapAction } from "../run.js";
import type { CreateBookInput } from "../../models/domain.js";

export function registerBookCommands(program: Command) {
  const bookCmd = program.command("book").description("Book management commands");

  bookCmd
    .command("store")
    .description("Store a book structure from a JSON file")
    .requiredOption("-f, --file <path>", "Path to JSON file")
    .action(wrapAction(program, async (options: { file: string }) => {
      const { config, outputMode } = buildContext(program);
      const db = openDatabase(config.dbPath);

      let content: string;
      if (options.file === "-") {
         content = fs.readFileSync(0, "utf-8");
      } else {
         const filePath = path.isAbsolute(options.file) ? options.file : path.resolve(process.cwd(), options.file);
         content = fs.readFileSync(filePath, "utf-8");
      }

      const input = JSON.parse(content) as CreateBookInput;
      
      if (!input.slug || !input.title || !Array.isArray(input.chapters)) {
          throw new Error("Invalid book JSON: missing slug, title, or chapters array");
      }

      storeBook(db, input);

      printResult({ success: true, data: { slug: input.slug } }, outputMode);
    }));
}
