# Research: Translate Chapter Titles

## Problem Statement
The current application only supports verse translations. Chapter titles are stored in the `chapters` table as a single `title` column (usually English), but source JSON files contain multiple translations (e.g., `title_turkish`, `title_sanskrit`). We need to support importing, storing, translating, and exporting these titles.

## Findings

### Database Schema
- Current `chapters` table has a `title` column.
- Current `translations` table is linked to `verses` via `verse_id`.
- Recommendation: Add a `chapter_translations` table. While we could make `verse_id` nullable in the `translations` table and add a `chapter_id`, keeping them separate simplifies the schema and avoids polymorphic associations which can be harder to maintain in SQL.

### Import Logic (`src/services/import_service.ts`)
- Currently only picks `title_english` for the chapter title.
- Need to update `ImportFileSchema` to include dynamic `title_*` fields or at least known ones.
- Need to iterate over `chapterData` keys and identify `title_{lang}` to upsert into `chapter_translations`.

### Export Logic (`src/services/export_service.ts`)
- Currently only fetches `chapters.number`.
- Need to join with `chapter_translations` to get the title in the requested language.
- Need fallback logic: If `chapter_translations.title` is missing for the target language, use `chapters.title`.

### Translation Logic (`src/services/translation_service.ts`)
- `translateVerses` only handles verses.
- Need a new `translateChapterTitles` (or similar) function.
- Providers already support batch translation, so translating a single title is straightforward.

## Decisions

### 1. New Table: `chapter_translations`
```sql
CREATE TABLE chapter_translations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chapter_id INTEGER NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    language_code TEXT NOT NULL,
    provider TEXT NOT NULL,
    model TEXT NOT NULL DEFAULT '',
    title TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (chapter_id, language_code, provider, model)
);
```

### 2. Update `ExportData` and `ChapterPackage` types
The types in `src/models/domain.ts` and `src/services/exporters/types.ts` need to include the translated title.

### 3. Repository Updates
Create `src/db/repositories/chapter_translations.ts` with `upsertChapterTranslation` and `findChapterTranslation`.

## Alternatives Considered
- **Adding `chapter_id` to `translations` table**: Rejected to avoid complex nullable constraints and keep verse/chapter translations distinct.
- **Storing translations in a JSON column in `chapters` table**: Rejected because SQLite doesn't enforce schema inside JSON well, and it makes querying harder.
