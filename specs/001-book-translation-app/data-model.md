# Data Model: Book Translation App

## Entities

### Book
- Fields:
  - `id` (PK)
  - `slug` (string, unique) — stable identifier for CLI usage
  - `title` (string, required)
  - `author` (string, optional)
  - `created_at` (timestamp)
- Relationships:
  - 1 Book → many Chapters
- Validation:
  - `title` non-empty
  - `slug` non-empty; unique

### Chapter
- Fields:
  - `id` (PK)
  - `book_id` (FK → Book.id)
  - `number` (positive integer, required)
  - `expected_verse_count` (positive integer, optional)
  - `created_at` (timestamp)
- Relationships:
  - 1 Chapter → many Verses
- Validation:
  - `number` must be a positive integer (FR-005)
  - unique constraint: `(book_id, number)`

### Verse
- Fields:
  - `id` (PK)
  - `chapter_id` (FK → Chapter.id)
  - `number` (positive integer, required)
  - `source_text` (string, optional until populated) (FR-011)
  - `created_at` (timestamp)
- Relationships:
  - 1 Verse → many Translations
- Validation:
  - `number` must be a positive integer (FR-005)
  - unique constraint: `(chapter_id, number)`

### Translation
- Fields:
  - `id` (PK)
  - `verse_id` (FK → Verse.id)
  - `language_code` (string, required) — e.g. `en`, `es`, `hi`
  - `provider` (string, required) — e.g. `deepl`, `ai-sdk.openai`
  - `model` (string, optional) — for AI SDK models
  - `text` (string, required)
  - `created_at` (timestamp)
- Validation:
  - unique constraint: `(verse_id, language_code, provider, model)`
- Notes:
  - Versioning policy is a configurable behavior per spec (FR-003 acceptance scenario #2). Easiest default is: refuse duplicates unless `--force` or `--new-version` is passed.

### PromptTemplate
- Fields:
  - `id` (PK)
  - `name` (string, unique)
  - `content` (string, required)
  - `created_at` (timestamp)
- Notes:
  - Stored prompt templates support FR-007 (reusable prompt template)

### GenerationRun
- Fields:
  - `id` (PK)
  - `book_id` (FK)
  - `chapter_number` (positive integer)
  - `expected_verse_count` (positive integer)
  - `provider` (string)
  - `model` (string, optional)
  - `status` (enum: `in_progress` | `complete` | `failed`)
  - `started_at` (timestamp)
  - `completed_at` (timestamp, nullable)
  - `last_completed_verse` (positive integer, default 0)
  - `validation_error` (string, nullable)
- Validation:
  - `chapter_number` must be positive integer (FR-005)

## Integrity & Indexing
- Foreign keys enabled.
- Suggested indexes:
  - `chapters(book_id, number)` unique
  - `verses(chapter_id, number)` unique
  - `translations(verse_id, language_code, provider, model)` unique

## State Transitions

### GenerationRun.status
- `in_progress` → `complete` when verses 1..N exist and N == expected verse count (FR-008)
- `in_progress` → `failed` when provider call fails or output validation fails (FR-006/FR-009)
- Resume support (FR-010): a new run or resumed run uses `last_completed_verse` to continue from verse `last_completed_verse + 1`

