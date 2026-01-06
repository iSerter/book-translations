# Service Contracts: Translate Chapter Titles

## Translation Service

### `translateChapterTitles`
Translates titles for multiple chapters.

**Input**:
```typescript
interface TranslateChapterTitlesInput {
  bookSlug: string;
  chapterNumbers: number[];
  targetLanguage: string;
  providerName: string;
  model?: string;
  overwrite?: boolean;
}
```

**Behavior**:
1. Validate book and chapters exist.
2. Check for existing translations if `overwrite` is false.
3. Call provider for each title.
4. Store results in `chapter_translations` table.

## Export Service

### `aggregateData` (Updated)
The internal data aggregation will now include translated titles.

**Output Structure**:
```typescript
interface ExportData {
  book: {
    title: string;
    slug: string;
    author?: string;
  };
  chapters: {
    number: number;
    title?: string; // Translated title for target language
    verses: {
      number: number;
      sourceText: string;
      translations: {
        languageCode: string;
        text: string;
        provider: string;
      }[];
    }[];
  }[];
}
```
