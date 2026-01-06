# Data Model: Import Book JSON Content

**Feature**: `003-import-book-json`

## Import Formats

The system supports multiple import formats to handle different JSON structures. The format determines the parser and validation logic used.

### 1. Format: `sanskrit-scripture`
*Targeted for importing Sanskrit texts like Bhagavad Gita with word-for-word analysis or commentary.*

#### Ephemeral Entities

**ImportSource (Sanskrit Scripture)**
*Represents the JSON file structure for this format.*

| Field | Type | Description |
|-------|------|-------------|
| chapter | Object | Metadata about the chapter |
| chapter.number | Integer | Chapter number (1-18) |
| chapter.title_sanskrit | String | Original title (Used to infer format if not specified) |
| chapter.title_english | String | English title |
| verses | Array | List of verse objects |

**ImportVerse (Sanskrit Scripture)**
*Represents a single verse item in this format.*

| Field | Type | Description |
|-------|------|-------------|
| verse_number | Integer | The verse number |
| sanskrit | String | Source text (multiline) |
| english | Object | English translation data |
| turkish | Object | Turkish translation data |

#### Domain Mapping

The import process maps `sanskrit-scripture` data to the following persistent entities:

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

1.  **Format Determination**: The system must determine the format either via CLI argument `--format` or by inspecting the JSON content (e.g., presence of `chapter.title_sanskrit` implies `sanskrit-scripture`).
2.  **File Existence**: Input file(s) must exist.
3.  **JSON Syntax**: File must be valid JSON.
4.  **Schema Compliance**: JSON must match the schema of the determined format.
    - For `sanskrit-scripture`: must contain `chapter.number` and `verses`.
5.  **Verse Integrity**: Each verse must have a `verse_number`.
6.  **Book Association**: A book slug must be provided via CLI or inferred (and validated to not be empty).