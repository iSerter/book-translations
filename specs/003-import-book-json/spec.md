# Feature Specification: Import Book JSON Content

**Feature Branch**: `003-import-book-json`
**Created**: 2026-01-06
**Status**: Draft
**Input**: User description: "create an import feature that can import books/chapters/verses from JSON files such as Bhagavad-Gita/Claude-Sonnet-4.5/Chapter-01.json"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Import Single Chapter JSON (Priority: P1)

As a Content Manager, I want to import a single JSON file containing a book chapter and its translations so that the content is stored in the database.

**Why this priority**: This is the core functionality. Without parsing and storing a single file, bulk operations cannot exist.

**Independent Test**: Can be fully tested by running the import command against the sample `Chapter-01.json` and verifying the records in the `books`, `chapters`, `verses`, and `translations` tables.

**Acceptance Scenarios**:

1. **Given** the database is empty and a valid `Chapter-01.json` file exists, **When** I run the import command for this file specifying the book slug, **Then** a new Book record is created.
2. **Given** the book exists, **When** I run the import command, **Then** a new Chapter record is created associated with that book.
3. **Given** the chapter is imported, **Then** all verses from the JSON are created.
4. **Given** the verses are imported, **Then** translations for all available languages (English, Turkish) and the source text (Sanskrit) are stored.

---

### User Story 2 - Idempotency and Updates (Priority: P2)

As a Content Manager, I want to re-run the import command on existing files so that I can update content without creating duplicate records.

**Why this priority**: Essential for data integrity and workflow, as source files may be corrected or updated.

**Independent Test**: Import the same file twice.

**Acceptance Scenarios**:

1. **Given** `Chapter-01.json` has already been imported, **When** I run the import command again for the same file, **Then** no new Book, Chapter, or Verse records are created (counts remain same).
2. **Given** `Chapter-01.json` has been modified (e.g., updated translation text), **When** I run the import command, **Then** the existing Translation records are updated with the new text.

---

### User Story 3 - Bulk Import (Priority: P3)

As a Content Manager, I want to import multiple JSON files at once using a glob pattern so that I can populate the database efficiently.

**Why this priority**: Improves efficiency but relies on the core import logic from P1.

**Independent Test**: Run import with a wildcard pattern like `Bhagavad-Gita/**/*.json`.

**Acceptance Scenarios**:

1. **Given** a directory with multiple chapter files (01, 02, etc.), **When** I run the import command with a glob pattern, **Then** all matching files are processed and imported.
2. **Given** a mix of valid and invalid files, **When** I run the bulk import, **Then** valid files are imported and errors are reported for invalid ones without stopping the entire process.

### Edge Cases

- **Invalid JSON**: The system should reject malformed JSON files with a descriptive error.
- **Missing Required Fields**: If critical fields (e.g., verse number, source text) are missing, the import for that specific unit should fail or the file should be rejected.
- **Provider inference**: If the file path contains provider info (e.g., `Claude-Sonnet-4.5`), it should be extracted. If not, a default or CLI argument should be used.

## Requirements *(mandatory)*

### Assumptions

- The user has access to the command-line interface.
- The input JSON files follow the structure of the provided sample (containing `chapter` and `verses` keys).
- The file path structure `Book/Provider/Chapter.json` is consistent enough to infer metadata, or the user will provide overrides.
- The database schema supports the storage of Book, Chapter, Verse, and Translation entities as described.
- Language codes in the JSON (e.g., 'english', 'turkish') can be mapped to standard ISO codes (e.g., 'en', 'tr').

### Functional Requirements

- **FR-001**: System MUST provide a CLI command to import translation data (e.g., `translations import <file_pattern>`).
- **FR-002**: System MUST accept a `--book-slug` argument to associate the imported content with a specific book entity.
- **FR-003**: System MUST parse the specific JSON schema used in the project (containing `chapter` metadata and `verses` array).
- **FR-004**: System MUST automatically create the Book entity if it does not exist, using the provided slug (and potentially inferring title from the JSON or path).
- **FR-005**: System MUST create Chapter entities based on the `chapter.number` and `chapter.title_english` in the JSON.
- **FR-006**: System MUST create Verse entities for each item in the `verses` array, storing the `sanskrit` text as the source.
- **FR-007**: System MUST create Translation entities for each language present in the verse object (e.g., `english`, `turkish`).
- **FR-008**: System MUST extract `translation` and `commentary` text for each translation entry.
- **FR-009**: System MUST infer the Translation Provider and Model from the file path if possible (e.g., `.../Claude-Sonnet-4.5/...` implies Provider=Claude, Model=Sonnet-4.5) OR accept it as a CLI argument.
- **FR-010**: System MUST support idempotency: existing records matching unique constraints (Book Slug, Chapter Number, Verse Number, Language, Provider) must be updated, not duplicated.

### Key Entities

- **Book**: Represents the literary work (e.g., Bhagavad Gita). Identified by `slug`.
- **Chapter**: A subdivision of the book. Identified by `book_id` and `number`.
- **Verse**: A distinct unit of text within a chapter. Identified by `chapter_id` and `number`.
- **Translation**: A translated version of a verse. Identified by `verse_id`, `language_code`, and `provider`.
- **Example Chapter JSON file**: `Bhagavad-Gita/Claude-Sonnet-4.5/Chapter-01.json` - we can support multiple formats and this could be one of the formats, called "sanskrit-scripture'

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can successfully import the sample `Chapter-01.json` file in under 5 seconds.
- **SC-002**: Database queries confirm that 1 Book, 1 Chapter, 47 Verses, and 94 Translation records (47 English + 47 Turkish) are created after importing the sample file.
- **SC-003**: Re-running the import command results in 0 new records created.
- **SC-004**: The command reports the number of files processed, success count, and failure count.