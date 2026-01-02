import path from "node:path";
import { fileURLToPath } from "node:url";
import { Command } from "commander";

import { buildContext, run } from "./run.js";

export async function main(argv: string[] = process.argv): Promise<void> {
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
