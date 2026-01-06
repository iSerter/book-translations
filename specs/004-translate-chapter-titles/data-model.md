# Data Model: Translate Chapter Titles

## Entities

### ChapterTranslation
Represents a translated version of a chapter's title.

| Field | Type | Description |
|-------|------|-------------|
| id | Integer | Primary Key |
| chapter_id | Integer | Foreign Key to `chapters.id` |
| language_code| String | ISO language code (e.g., 'en', 'tr') |
| provider | String | Name of the AI or manual provider |
| model | String | Model name used (optional) |
| title | String | The translated title text |
| created_at | DateTime | Timestamp of creation |

**Constraints**:
- Unique on `(chapter_id, language_code, provider, model)`
- Foreign Key `chapter_id` REFERENCES `chapters(id)` ON DELETE CASCADE

## Relationships
- **Chapter (1) <---> (N) ChapterTranslation**: A chapter can have many translations (different languages or different providers).
- **Book (1) <---> (N) Chapter**: Existing relationship.

## State Transitions
- **Import**: `ImportService` creates `ChapterTranslation` records from JSON source.
- **Translation**: `TranslationService` creates `ChapterTranslation` records using AI providers.
- **Export**: `ExportService` reads `ChapterTranslation` (with fallback to `Chapter.title`).
