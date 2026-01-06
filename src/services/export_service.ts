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
    let chaptersQuery = `
      SELECT c.id, c.number, c.title as sourceTitle
      FROM chapters c
      WHERE c.book_id = ?
    `;
    const params: (number | string)[] = [book.id];

    if (options.chapterNumber !== undefined) {
      chaptersQuery += ' AND c.number = ?';
      params.push(options.chapterNumber);
    }
    
    chaptersQuery += ' ORDER BY c.number ASC';

    const chaptersRaw = this.db.prepare(chaptersQuery).all(...params) as any[];
    
    if (chaptersRaw.length === 0) {
        return { 
            book: { title: book.title, slug: book.slug, author: book.author || undefined }, 
            chapters: [] 
        };
    }

    // 2.5 Fetch Chapter Translations if language is specified
    const chapterTranslationsMap = new Map<number, string>();
    if (options.languages && options.languages.length > 0) {
        // We prioritize the first language requested for the chapter heading
        const targetLang = options.languages[0];
        let ctQuery = `
            SELECT chapter_id, title, provider 
            FROM chapter_translations 
            WHERE language_code = ?
        `;
        const ctParams: any[] = [targetLang];

        if (options.provider && !options.allowFallback) {
            ctQuery += " AND provider = ?";
            ctParams.push(options.provider);
        }

        const ctRows = this.db.prepare(ctQuery).all(...ctParams) as any[];
        
        // Group by chapter_id to handle potential multiple translations (pick best)
        const ctGroups = new Map<number, any[]>();
        for (const row of ctRows) {
            if (!ctGroups.has(row.chapter_id)) ctGroups.set(row.chapter_id, []);
            ctGroups.get(row.chapter_id)?.push(row);
        }

        for (const [chapterId, transList] of ctGroups) {
            let match = transList.find(t => t.provider === options.provider);
            if (!match && options.allowFallback) {
                match = transList[0];
            }
            if (match) {
                chapterTranslationsMap.set(chapterId, match.title);
            }
        }
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

    // If allowFallback is true, we don't filter by provider in SQL, 
    // we fetch all and filter/select in memory.
    if (options.provider && !options.allowFallback) {
        translationsQuery += ` AND t.provider = ?`;
        transParams.push(options.provider);
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
        
        const verseTranslationsRaw = translationsMap.get(v.id) || [];
        const selectedTranslations: any[] = [];

        if (options.provider) {
            // Group by language to select best match per language
            const byLang = new Map<string, any[]>();
            for (const t of verseTranslationsRaw) {
                if (!byLang.has(t.languageCode)) byLang.set(t.languageCode, []);
                byLang.get(t.languageCode)?.push(t);
            }

            for (const [_, transList] of byLang) {
                let match = transList.find((t: any) => t.provider === options.provider);
                if (!match && options.allowFallback) {
                    // Fallback: pick the first available one
                    // TODO: Could have smarter logic (e.g. prefer specific providers)
                    match = transList[0];
                }
                
                if (match) {
                    selectedTranslations.push(match);
                }
            }
        } else {
            // No provider specified, include all
            selectedTranslations.push(...verseTranslationsRaw);
        }
        
        versesMap.get(v.chapter_id)?.push({
            number: v.number,
            sourceText: v.sourceText || '',
            translations: selectedTranslations.map((t: any) => ({
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
      chapters: chaptersRaw.map(c => ({
          number: c.number,
          title: chapterTranslationsMap.get(c.id) || c.sourceTitle || undefined,
          verses: versesMap.get(c.id) || []
      }))
    };
  }
}
