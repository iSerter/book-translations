# Data Model: Book Export Formats

## Domain Entities

### ExportOptions
*Configuration passed from CLI to the Export Service*

```typescript
interface ExportOptions {
  bookSlug: string;
  chapterNumber?: number; // Optional: specific chapter
  formats: ('json' | 'md' | 'docx')[];
  languages?: string[]; // Optional: specific languages (e.g. ['en', 'es'])
  outputDir: string;
}
```

### ExportData
*Intermediate structure representing the data to be exported, independent of output format*

```typescript
interface ExportData {
  book: {
    title: string;
    slug: string;
    author?: string;
  };
  chapters: ExportChapter[];
}

interface ExportChapter {
  number: number;
  verses: ExportVerse[];
}

interface ExportVerse {
  number: number;
  sourceText: string; // The original text
  translations: ExportTranslation[];
}

interface ExportTranslation {
  languageCode: string;
  text: string;
  provider: string; // To distinguish if multiple exist
}
```

## Database Access

No new tables required. Data is aggregated from existing `books`, `chapters`, `verses`, and `translations` tables.

### Query Pattern
To avoid N+1 issues:
1. `SELECT * FROM books WHERE slug = ?`
2. `SELECT * FROM chapters WHERE book_id = ? [AND number = ?]`
3. `SELECT * FROM verses WHERE chapter_id IN (...)`
4. `SELECT * FROM translations WHERE verse_id IN (...) [AND language_code IN (...)]`

Data is then assembled in-memory into `ExportData` structure before being passed to specific formatters.
