import fs from "node:fs";
import { Command } from "commander";
import { addTemplate, getTemplate } from "../../services/prompt_template_service.js";
import { printResult } from "../../lib/output.js";
import { openDatabase } from "../../db/connection.js";
import { buildContext, wrapAction } from "../run.js";
import { AppError, ExitCode } from "../../lib/errors.js";

export function registerTemplateCommands(program: Command) {
  const tmplCmd = program.command("template").description("Prompt template commands");

  tmplCmd
    .command("add")
    .description("Add or update a prompt template")
    .requiredOption("-n, --name <name>", "Template name")
    .requiredOption("-f, --file <path>", "Path to template file (or - for stdin)")
    .action(wrapAction(program, async (options: { name: string; file: string }) => {
      const { config, outputMode } = buildContext(program);
      const db = openDatabase(config.dbPath);

      let content: string;
      if (options.file === "-") {
         content = fs.readFileSync(0, "utf-8");
      } else {
         content = fs.readFileSync(options.file, "utf-8");
      }

      const template = addTemplate(db, options.name, content);
      printResult({ success: true, data: template }, outputMode);
    }));

  tmplCmd
    .command("get")
    .description("Get a prompt template")
    .requiredOption("-n, --name <name>", "Template name")
    .action(wrapAction(program, async (options: { name: string }) => {
      const { config, outputMode } = buildContext(program);
      const db = openDatabase(config.dbPath);

      const template = getTemplate(db, options.name);
      if (!template) {
          throw new AppError(`Template '${options.name}' not found`, { code: ExitCode.NotFound });
      }
      printResult({ success: true, data: template }, outputMode);
    }));
}
