import fs from 'node:fs/promises';
import path from 'node:path';
import { IExporter } from './index.js';
import { ExportData, ExportOptions } from './types.js';

export class MarkdownExporter implements IExporter {
  async export(data: ExportData, options: ExportOptions): Promise<void> {
    const filename = this.getFilename(options);
    const outputPath = path.join(options.outputDir, filename);
    
    let content = `# ${data.book.title}\n`;
    if (data.book.author) {
      content += `**Author**: ${data.book.author}\n`;
    }
    content += '\n';

    for (const chapter of data.chapters) {
      content += `## Chapter ${chapter.number}\n\n`;
      
      for (const verse of chapter.verses) {
        if (verse.sourceText && options.includeSource !== false) {
          content += `> ${verse.sourceText}\n\n`;
        }
        
        for (const translation of verse.translations) {
          let line = '';
          if (options.includeVerseNumbers) {
            line += `**${chapter.number}:${verse.number}** `;
          }
          if (verse.translations.length > 1) {
            line += `**${translation.languageCode}**: `;
          }
          line += translation.text;
          content += `${line}\n\n`;
        }
      }
    }
    
    await fs.writeFile(outputPath, content, 'utf-8');
  }

  private getFilename(options: ExportOptions): string {
    if (options.chapterNumber) {
      return `${options.bookSlug}_chapter-${options.chapterNumber}.md`;
    }
    return `${options.bookSlug}.md`;
  }
}
