# Research: Book Export Formats

**Date**: 2026-01-05
**Feature**: Book Export Formats

## 1. Word Document Generation Library

**Decision**: Use `docx` (npm package).

**Rationale**:
- **Type Safety**: Written in TypeScript, providing good type definitions which matches our project stack.
- **Features**: Supports headers, paragraphs, styling, and structural elements needed for book formatting.
- **Maintenance**: Actively maintained and widely used.
- **No System Dependencies**: Pure JS/TS, doesn't require Word or external binaries.

**Alternatives Considered**:
- `officegen`: Older, less active maintenance, often callback-based which is less ergonomic with modern async/await.
- `html-to-docx`: Converting HTML is an option but adds an intermediate parsing step; building the document programmatically offers more control over structure.

## 2. JSON Export Schema

**Decision**: Use a nested hierarchical structure.

**Rationale**: 
- Matches the logical structure of a book (Book -> Chapters -> Verses).
- Easy for consumers to iterate over.

**Schema Design**:
```json
{
  "meta": {
    "title": "Book Title",
    "author": "Author Name",
    "slug": "book-slug",
    "exported_at": "ISO-8601-Timestamp"
  },
  "chapters": [
    {
      "number": 1,
      "verses": [
        {
          "number": 1,
          "source_text": "Original text...",
          "translations": {
            "en": "English text...",
            "es": "Spanish text..."
          }
        }
      ]
    }
  ]
}
```
*Note*: `translations` object keyed by language code for O(1) access, or array? Spec says "Filterable". Array might be better if we want to include provider metadata.
*Refined Decision*: Use an array for translations to allow multiple providers per language if needed (though constraint says unique per provider). But simplified view usually prefers one "best" or just list them.
*Updated Schema for Translations*:
```json
"translations": [
  {
    "lang": "en",
    "text": "English text...",
    "provider": "deepl"
  }
]
```

## 3. Markdown Format

**Decision**: Standard Markdown with simple hierarchy.

**Rationale**:
- Readable as plain text.
- Renders well in GitHub/Editors.

**Format Template**:
```markdown
# [Book Title]

## Chapter [N]

### Verse [N]

> [Source Text]

**[Lang Code]**: [Translation Text]
...
```

## 4. DB Query Strategy

**Decision**: Fetch entire book structure in a few efficient queries rather than N+1.

**Rationale**: Performance goal < 60s for 2000 verses.

**Strategy**:
1. Fetch Book metadata.
2. Fetch all Chapters for Book.
3. Fetch all Verses for Book (ordered by chapter, number).
4. Fetch all Translations for Book (filtered by lang if needed), keyed by verse_id for in-memory mapping.
   - *Alternative*: JOINs. `SELECT v.*, t.* FROM verses v JOIN translations t ...`. This might create large result sets if many languages.
   - *Chosen*: Separate query for translations to avoid duplicating verse text in result set, then map in application code.

## 5. File Naming Convention

**Decision**: `[book-slug]_[timestamp].[ext]` or `[book-slug]_chapter-[N]_[timestamp].[ext]`

**Rationale**: Ensures uniqueness and clear identification.
