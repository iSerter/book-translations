import type { Database } from 'better-sqlite3';
import { ExportData, ExportOptions } from './exporters/types.js';
import { IExporter } from './exporters/index.js';
import { AppError, ExitCode } from '../lib/errors.js';

export class ExportService {
  constructor(private db: Database) {}

  async exportBook(options: ExportOptions, exporters: IExporter[]): Promise<void> {
    const data = this.aggregateData(options);
    
    // Execute all provided exporters
    // In the future, we can filter `exporters` based on `options.formats` here or in the caller.
    await Promise.all(exporters.map(exporter => exporter.export(data, options)));
  }

  private aggregateData(options: ExportOptions): ExportData {
    // 1. Fetch Book
    const book = this.db.prepare('SELECT id, title, slug, author FROM books WHERE slug = ?').get(options.bookSlug) as any;
    if (!book) {
      throw new AppError(`Book not found: ${options.bookSlug}`, { code: ExitCode.NotFound });
    }

    // 2. Fetch Chapters
    let chaptersQuery = 'SELECT id, number FROM chapters WHERE book_id = ?';
    const params: (number | string)[] = [book.id];

    if (options.chapterNumber !== undefined) {
      chaptersQuery += ' AND number = ?';
      params.push(options.chapterNumber);
    }
    
    chaptersQuery += ' ORDER BY number ASC';

    const chapters = this.db.prepare(chaptersQuery).all(...params) as any[];
    
    if (chapters.length === 0) {
        return { 
            book: { title: book.title, slug: book.slug, author: book.author || undefined }, 
            chapters: [] 
        };
    }

    // 3. Fetch All Verses for the Book
    // We join with chapters to filter by book_id efficiently
    const verses = this.db.prepare(`
        SELECT v.id, v.chapter_id, v.number, v.source_text as sourceText 
        FROM verses v 
        JOIN chapters c ON v.chapter_id = c.id 
        WHERE c.book_id = ? 
        ORDER BY v.chapter_id ASC, v.number ASC
    `).all(book.id) as any[];

    // 4. Fetch All Translations for the Book
    // Note: Future enhancement will filter by options.languages here
    let translationsQuery = `
        SELECT t.verse_id, t.language_code as languageCode, t.text, t.provider 
        FROM translations t
        JOIN verses v ON t.verse_id = v.id
        JOIN chapters c ON v.chapter_id = c.id
        WHERE c.book_id = ?
    `;
    const transParams: any[] = [book.id];

    if (options.languages && options.languages.length > 0) {
        const placeholders = options.languages.map(() => '?').join(',');
        translationsQuery += ` AND t.language_code IN (${placeholders})`;
        transParams.push(...options.languages);
    }
    
    const translations = this.db.prepare(translationsQuery).all(...transParams) as any[];

    // 5. In-Memory Aggregation
    
    // Group translations by verse_id
    const translationsMap = new Map<number, any[]>();
    for (const t of translations) {
        if (!translationsMap.has(t.verse_id)) {
            translationsMap.set(t.verse_id, []);
        }
        translationsMap.get(t.verse_id)?.push(t);
    }

    // Group verses by chapter_id
    const versesMap = new Map<number, any[]>();
    for (const v of verses) {
        if (!versesMap.has(v.chapter_id)) {
            versesMap.set(v.chapter_id, []);
        }
        
        const verseTranslations = translationsMap.get(v.id) || [];
        
        versesMap.get(v.chapter_id)?.push({
            number: v.number,
            sourceText: v.sourceText || '',
            translations: verseTranslations.map((t: any) => ({
                languageCode: t.languageCode,
                text: t.text,
                provider: t.provider
            }))
        });
    }

    // Construct final ExportData
    return {
      book: {
        title: book.title,
        slug: book.slug,
        author: book.author || undefined
      },
      chapters: chapters.map(c => ({
          number: c.number,
          verses: versesMap.get(c.id) || []
      }))
    };
  }
}
