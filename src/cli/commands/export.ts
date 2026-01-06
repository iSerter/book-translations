import { Command } from 'commander';
import path from 'path';
import fs from 'node:fs/promises';
import { openDatabase } from '../../db/connection.js';
import { loadConfig } from '../../lib/config.js';
import { ExportService } from '../../services/export_service.js';
import { JsonExporter } from '../../services/exporters/json_exporter.js';
import { MarkdownExporter } from '../../services/exporters/markdown_exporter.js';
import { WordExporter } from '../../services/exporters/word_exporter.js';
import { ExportOptions } from '../../services/exporters/types.js';
import { AppError, ExitCode } from '../../lib/errors.js';
import { printError, printResult } from '../../lib/output.js';

export const exportCommand = new Command('export')
  .description('Export book content to various formats')
  .argument('<bookSlug>', 'The unique identifier (slug) of the book to export')
  .option('-f, --format <formats...>', 'List of formats to export (json, md, docx)', ['json', 'md', 'docx'])
  .option('-c, --chapter <number>', 'Export only a specific chapter number')
  .option('-l, --languages <codes...>', 'Filter translations to specific language codes')
  .option('-o, --output <path>', 'Output directory for generated files', './')
  .option('--db <path>', 'Path to SQLite database file')
  .action(async (bookSlug, options) => {
    try {
      const config = loadConfig();
      if (options.db) {
        config.dbPath = options.db;
      }
      const db = openDatabase(config.dbPath, { readonly: true });
      const service = new ExportService(db);
      
      const outputDir = path.resolve(options.output);
      await fs.mkdir(outputDir, { recursive: true });

      const exportOptions: ExportOptions = {
        bookSlug,
        chapterNumber: options.chapter ? parseInt(options.chapter, 10) : undefined,
        formats: options.format as any,
        languages: options.languages,
        outputDir: outputDir
      };

      const exporters = [];
      const formats = options.format || [];
      if (formats.includes('json')) exporters.push(new JsonExporter());
      if (formats.includes('md')) exporters.push(new MarkdownExporter());
      if (formats.includes('docx')) exporters.push(new WordExporter());

      if (exporters.length === 0) {
        throw new AppError("No valid export formats selected", { code: ExitCode.Validation });
      }

      await service.exportBook(exportOptions, exporters);
      
      printResult(`Successfully exported ${bookSlug} to ${options.output}`, 'text');
    } catch (error) {
      printError(error, 'text');
      process.exitCode = 1;
    }
  });
