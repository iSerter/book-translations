import fs from 'node:fs/promises';
import path from 'node:path';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { IExporter } from './index.js';
import { ExportData, ExportOptions } from './types.js';

export class WordExporter implements IExporter {
  async export(data: ExportData, options: ExportOptions): Promise<void> {
    const filename = this.getFilename(options);
    const outputPath = path.join(options.outputDir, filename);

    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({
            text: data.book.title,
            heading: HeadingLevel.TITLE,
          }),
          ...(data.book.author ? [
            new Paragraph({
              text: `Author: ${data.book.author}`,
              heading: HeadingLevel.HEADING_2,
            })
          ] : []),
          new Paragraph({ text: '' }), // Spacer

          ...data.chapters.flatMap(chapter => {
            const chapterTitle = chapter.title ? `Chapter ${chapter.number}: ${chapter.title}` : `Chapter ${chapter.number}`;
            return [
              new Paragraph({
                text: chapterTitle,
                heading: HeadingLevel.HEADING_1,
              }),
              ...chapter.verses.flatMap(verse => [
                ...(verse.sourceText && options.includeSource !== false ? [
                    new Paragraph({
                        children: [
                            new TextRun({ text: verse.sourceText, italics: true })
                        ]
                    })
                ] : []),
                ...verse.translations.map(translation => 
                  new Paragraph({
                    children: [
                      ...(options.includeVerseNumbers ? [new TextRun({ text: `${chapter.number}:${verse.number} `, bold: true })] : []),
                      ...(verse.translations.length > 1 ? [new TextRun({ text: `${translation.languageCode}: `, bold: true })] : []),
                      new TextRun(translation.text)
                    ]
                  })
                ),
                new Paragraph({ text: '' }) // Spacer between verses
              ])
            ];
          })
        ],
      }],
    });

    const buffer = await Packer.toBuffer(doc);
    await fs.writeFile(outputPath, buffer);
  }

  private getFilename(options: ExportOptions): string {
    if (options.chapterNumber) {
      return `${options.bookSlug}_chapter-${options.chapterNumber}.docx`;
    }
    return `${options.bookSlug}.docx`;
  }
}