# Research: Import Book JSON Content

**Feature**: Import Book JSON Content (`003-import-book-json`)
**Date**: 2026-01-06

## Decisions

### 1. JSON Schema Validation
**Decision**: Use `zod` to define a schema that matches the input JSON structure and transform/map it to the domain entities.
**Rationale**: The input JSON structure (e.g., `Bhagavad-Gita/Claude-Sonnet-4.5/Chapter-01.json`) might not perfectly match the internal `ChapterPackage` type or database schema 1:1. Zod allows strict validation and safe parsing before interacting with the DB.
**Unknown Resolved**: The input JSON has `chapter` metadata and `verses` array. `verses` contain `sanskrit`, `transliteration`, `english` (obj), `turkish` (obj). This structure is richer than a flat list. We will define a specific Zod schema for this "Scripture JSON" format.

### 2. Idempotency Strategy
**Decision**: Use distinct `SELECT` checks before `INSERT` for high-level entities (Book, Chapter) to retrieve IDs, and use `INSERT ... ON CONFLICT` (Upsert) logic for Verses and Translations where possible, or check-then-update.
**Rationale**: `better-sqlite3` supports standard SQLite SQL. For Translations, we want to update the text if it changes (FR-010). 
- **Books**: Lookup by slug. If missing, insert.
- **Chapters**: Lookup by book_id + number. If missing, insert.
- **Verses**: Lookup by chapter_id + number. If missing, insert.
- **Translations**: Lookup by verse_id + language_code + provider. If exists, update text/commentary. If missing, insert.
**Alternatives considered**: `INSERT OR REPLACE` (might delete cascading keys if not careful), `ON CONFLICT DO UPDATE`. We will use explicit logic to ensure we don't accidentally wipe out related data if the schema grows.

### 3. Path Metadata Extraction
**Decision**: Use a regex pattern to extract `Provider` and `Book` (optional) from the file path, but prioritize CLI arguments if provided.
**Rationale**: Path structure is `Book/Provider/Chapter.json`.
- Regex: `([^/]+)/([^/]+)/Chapter-(\d+)\.json$`
- Group 1: Book (potential slug/title)
- Group 2: Provider (e.g., `Claude-Sonnet-4.5`)
- Group 3: Chapter Number
**Fallback**: If path doesn't match, require CLI args or default.

## Open Questions

None.
