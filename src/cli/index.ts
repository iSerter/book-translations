import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Command } from "commander";

import { buildContext, run } from "./run.js";
import { registerBookCommands } from "./commands/book.js";
import { registerTemplateCommands } from "./commands/template.js";
import { registerChapterCommands } from "./commands/chapter.js";
import { registerVerseCommands } from "./commands/verse.js";
import { registerTranslationsCommands } from "./commands/translations.js";
import { registerDbCommands } from "./commands/db.js";
import { registerProviders } from "../providers/index.js";

export async function main(argv: string[] = process.argv): Promise<void> {
  registerProviders();
  const program = buildProgram();
  await run(program, argv, () => buildContext(program));
}

function buildProgram(): Command {
  const program = new Command();

  program
    .name("book-translations")
    .description("CLI for storing books, generating chapters, and translating verses")
    .option("-j, --json", "Output JSON to stdout", false)
    .option("--db <path>", "Path to SQLite database file");

  registerBookCommands(program);
  registerTemplateCommands(program);
  registerChapterCommands(program);
  registerVerseCommands(program);
  registerTranslationsCommands(program);
  registerDbCommands(program);

  program.action(async () => {
    program.outputHelp();
  });

  return program;
}

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isDirectRun) {
  // eslint-disable-next-line promise/catch-or-return
  main();
}
