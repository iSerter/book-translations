import path from "node:path";
import type { Command } from "commander";

import { loadConfig, type AppConfig } from "../lib/config.js";
import { printError, type OutputMode } from "../lib/output.js";

export type CliContext = {
  config: AppConfig;
  outputMode: OutputMode;
};

export type ContextBuilder = () => CliContext;

export async function run(
  program: Command,
  argv: string[] = process.argv,
  buildContext: ContextBuilder,
): Promise<void> {
  try {
    await program.parseAsync(argv);
  } catch (error) {
    const mode = getOutputMode(program);
    const exitCode = printError(error, mode);
    process.exitCode = exitCode;
    return;
  }

  // Parse was successful; materialize context once for downstream commands.
  buildContext();
}

export function buildContext(program: Command, cwd: string = process.cwd()): CliContext {
  const opts = program.opts<{ json?: boolean; db?: string }>();
  const config = loadConfig({}, cwd);
  if (opts.db) {
    const resolved = path.isAbsolute(opts.db) ? opts.db : path.join(cwd, opts.db);
    config.dbPath = resolved;
  }

  return {
    config,
    outputMode: opts.json ? "json" : "text",
  };
}

export function wrapAction<T extends (...args: any[]) => Promise<unknown> | unknown>(
  program: Command,
  action: T,
): (...args: Parameters<T>) => Promise<void> {
  return async (...args: Parameters<T>) => {
    try {
      await action(...args);
    } catch (error) {
      const mode = getOutputMode(program);
      const exitCode = printError(error, mode);
      process.exitCode = exitCode;
    }
  };
}

function getOutputMode(program: Command): OutputMode {
  const opts = program.opts<{ json?: boolean }>();
  return opts.json ? "json" : "text";
}
