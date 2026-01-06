# Data Model: Import Book JSON Content

**Feature**: `003-import-book-json`

## Entities

### 1. ImportSource (JSON File)
*Ephemeral entity representing the input file structure.*

| Field | Type | Description |
|-------|------|-------------|
| chapter | Object | Metadata about the chapter |
| chapter.number | Integer | Chapter number (1-18) |
| chapter.title_sanskrit | String | Original title |
| chapter.title_english | String | English title |
| verses | Array | List of verse objects |

### 2. ImportVerse (JSON Item)
*Ephemeral entity representing a single verse in the input.*

| Field | Type | Description |
|-------|------|-------------|
| verse_number | Integer | The verse number |
| sanskrit | String | Source text (multiline) |
| english | Object | English translation data |
| turkish | Object | Turkish translation data |

### 3. Domain Mapping

The import process maps `ImportSource` data to the following persistent entities:

| JSON Field | Target Entity | Target Field | Notes |
|------------|---------------|--------------|-------|
| (CLI arg) | **Book** | slug | Lookup or Create |
| chapter.number | **Chapter** | number | Lookup or Create |
| chapter.title_english | **Chapter** | title | |
| verse.verse_number | **Verse** | number | Lookup or Create |
| verse.sanskrit | **Verse** | source_text | |
| verse.english.translation | **Translation** | text | lang='en' |
| verse.english.commentary | **Translation** | commentary | lang='en' |
| verse.turkish.translation | **Translation** | text | lang='tr' |
| verse.turkish.commentary | **Translation** | commentary | lang='tr' |

## Validation Rules

1.  **File Existence**: Input file(s) must exist.
2.  **JSON Syntax**: File must be valid JSON.
3.  **Schema Compliance**: JSON must contain `chapter.number` (number) and `verses` (array).
4.  **Verse Integrity**: Each verse must have a `verse_number`.
5.  **Book Association**: A book slug must be provided via CLI or inferred (and validated to not be empty).
