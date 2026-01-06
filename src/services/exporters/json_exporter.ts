import fs from 'node:fs/promises';
import path from 'node:path';
import { IExporter } from './index.js';
import { ExportData, ExportOptions } from './types.js';

export class JsonExporter implements IExporter {
  async export(data: ExportData, options: ExportOptions): Promise<void> {
    const filename = this.getFilename(options);
    const outputPath = path.join(options.outputDir, filename);
    
    await fs.writeFile(outputPath, JSON.stringify(data, null, 2), 'utf-8');
  }

  private getFilename(options: ExportOptions): string {
    if (options.chapterNumber) {
      return `${options.bookSlug}_chapter-${options.chapterNumber}.json`;
    }
    return `${options.bookSlug}.json`;
  }
}
