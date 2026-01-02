# Feature Specification: Book Translation App

**Feature Branch**: `001-book-translation-app`  
**Created**: January 2, 2026  
**Status**: Draft  
**Input**: User description: "Simple book translation app with persistent storage for books and translations. Content is structured by chapter and verse (common for holy scriptures). Provide command-line workflows to translate specified verses using translation providers, and to generate first-pass chapter content (including original text and translations) using a reusable prompt template."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Store Book Structure (Priority: P1)

As a translator, I want to store books with their chapter and verse structure so that I can organize holy scriptures for translation.

**Why this priority**: This is the foundation for the entire app, enabling data storage and retrieval.

**Independent Test**: Can be tested by storing a book and verifying chapters and verses are persisted in the database.

**Acceptance Scenarios**:

1. **Given** a book title and content with chapters and verses, **When** I store the book, **Then** the database contains the book with all chapters and verses.
2. **Given** an existing book, **When** I add a new chapter, **Then** the chapter is added without affecting existing data.

---

### User Story 2 - Generate First-Pass Chapter Content from a Prompt (Priority: P2)

As a translator, I want to generate a first-pass chapter package (original text + translations + brief commentary) using a reusable prompt template so that I can bootstrap a new book or chapter quickly.

**Why this priority**: Holy scripture projects often start from a known structure (chapter/verse totals) but may not yet have content loaded; generating a consistent first draft accelerates review and iteration.

**Independent Test**: Can be tested by running a single chapter generation request and verifying that a valid, complete, chapter/verse-structured result is stored.

**Acceptance Scenarios**:

1. **Given** a prompt template and a chapter number with an expected verse count, **When** I run a generation command, **Then** the result contains verses numbered sequentially from 1 to the expected count and is marked complete.
2. **Given** a generation result that is incomplete (e.g., stopped early), **When** I resume generation from a specified verse number, **Then** the missing verses are generated and the chapter becomes complete.
3. **Given** a generation result that does not match the required output format, **When** I attempt to store it, **Then** the system rejects it with a clear error and does not overwrite existing stored content.

---

### User Story 3 - Translate Verses via Command Line (Priority: P3)

As a translator, I want to translate specific verses using command-line scripts so that I can generate or update translations efficiently.

**Why this priority**: This is the core day-to-day workflow once source text exists.

**Independent Test**: Can be tested by translating one stored verse into one language and verifying the translation is stored and retrievable.

**Acceptance Scenarios**:

1. **Given** a verse and a target language, **When** I run a translation command, **Then** a translation is generated and stored for that verse and language.
2. **Given** an existing translation for a verse and language, **When** I run the translation command again with the same inputs, **Then** the system either creates a new version or refuses with a clear message (based on configured behavior).
3. **Given** invalid credentials or a provider outage, **When** I run the translation command, **Then** an error is reported without corrupting stored data.

---

### User Story 4 - Retrieve Translations (Priority: P4)

As a user, I want to retrieve stored translations so that I can access translated content.

**Why this priority**: Completes the basic workflow after storage and translation.

**Independent Test**: Can be tested by querying translations and verifying correct data is returned.

**Acceptance Scenarios**:

1. **Given** a book, chapter, and verse, **When** I query for translations, **Then** all available translations are returned.
2. **Given** a non-existent verse, **When** I query, **Then** no results are returned.

---

### Edge Cases

- What happens when a chapter/verse number is invalid (e.g., negative or non-integer)?
- How does the system handle provider rate limits, timeouts, or failures during generation/translation?
- What if a book has no chapters or verses, or the expected verse count is unknown?
- How does the system handle duplicate translations for the same verse and language (overwrite vs versioning)?
- What happens when generated content contradicts the configured verse count (extra/missing verses)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST store books with title and chapter/verse structure in persistent storage.
- **FR-002**: System MUST support storing multiple translations per verse for different target languages.
- **FR-003**: System MUST provide a command-line workflow to translate specified verses using one or more translation providers.
- **FR-004**: System MUST allow retrieval of stored translations by book, chapter, and verse.
- **FR-005**: System MUST validate chapter and verse numbers are positive integers.
- **FR-006**: System MUST handle errors gracefully when translation or generation providers fail (clear errors, no partial corruption).
- **FR-007**: System MUST support generating first-pass chapter content from a reusable prompt template.
- **FR-008**: Generated chapter content MUST support chapter/verse numbering and an expected verse count, and MUST record whether the result is complete.
- **FR-009**: System MUST validate the structure of generated outputs before storing them (reject invalid format, preserve existing data).
- **FR-010**: System MUST support resuming an incomplete chapter generation from a specified verse number.
- **FR-011**: System MUST support storing both “source/original” text and one or more translations for each verse.

### Key Entities *(include if feature involves data)*

- **Book**: Represents a holy scripture with title, author, and collection of chapters.
- **Chapter**: Belongs to a book, has a number and collection of verses.
- **Verse**: Belongs to a chapter, has a number and original text.
- **Translation**: Belongs to a verse, has language code and translated text.
- **Prompt Template**: A reusable instruction set that defines required output structure, languages, and completeness rules for generated chapters.
- **Generation Run**: A record of a chapter generation attempt, including parameters (book/chapter/languages), completeness status, and any validation errors.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can store a complete book with 100 chapters and 1,000 verses in under 30 seconds.
- **SC-002**: A single-verse translation request completes in under 10 seconds on average (excluding provider outages).
- **SC-003**: A chapter generation run produces a “complete” chapter (no missing verses, sequential numbering) in at least 90% of attempts under normal conditions.
- **SC-004**: 95% of provider calls (translation + generation) succeed without retriable errors in normal conditions.

## Assumptions *(optional)*

- Books are primarily structured as chapters containing numbered verses.
- Verse numbers are unique within a chapter; chapter numbers are unique within a book.
- Translations are identified by a standard language identifier (e.g., language code) plus provider/source.

## Dependencies *(optional)*

- Availability of one or more external providers for (a) translation and (b) text generation.
- Access to prompt templates that define required output format, languages, and completeness/verification rules.
