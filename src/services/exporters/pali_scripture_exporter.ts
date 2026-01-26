import fs from 'node:fs/promises';
import path from 'node:path';
import { IExporter } from './index.js';
import { ExportData, ExportOptions } from './types.js';
import { PaliScripture } from '../../models/domain.js';

export class PaliScriptureExporter implements IExporter {
  async export(data: ExportData, options: ExportOptions): Promise<void> {
    // Only proceed if 'pali-scripture' is in the formats, 
    // though the ExportService might have already filtered.
    if (!options.formats.includes('pali-scripture')) {
        return;
    }

    const filename = this.getFilename(options);
    const outputPath = path.join(options.outputDir, filename);

    const paliExport: PaliScripture = {
      format: "pali-scripture",
      book: {
        slug: data.book.slug,
        title: data.book.title,
        author: data.book.author,
        chapters: data.chapters.map(c => ({
          number: c.number,
          title_pali: c.title || "",
          verses: c.verses.map(v => ({
            number: v.number,
            pali: v.sourceText
          }))
        }))
      }
    };

    await fs.writeFile(outputPath, JSON.stringify(paliExport, null, 2), 'utf-8');
  }

  private getFilename(options: ExportOptions): string {
    if (options.chapterNumber) {
      return `${options.bookSlug}_chapter-${options.chapterNumber}.json`;
    }
    return `${options.bookSlug}.json`;
  }
}
