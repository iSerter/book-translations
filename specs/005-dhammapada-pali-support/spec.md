# Feature Specification: Support Dhammapada and Pali Scripture Generation

**Feature Branch**: `005-dhammapada-pali-support`
**Created**: 2026-01-25
**Status**: Draft
**Input**: User description: "I want to generate and translate the prominent scripture Dhammapada. I think its original language is Pali. So far, the app worked with only 'sanskrit-scripture' format for import/export and I'm not sure if it matters for generating contents.. Analyze the app and create specs to implement feature to support generation and translation of Dhammapada and perhaps other Pali scriptures. Dhammapada will be the first book I will generate/translate."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Generate Dhammapada Content (Priority: P1)

As a content creator, I want to generate chapters of the Dhammapada in its original Pali language so that I can expand the library of scriptures.

**Why this priority**: This is the primary goal of the request. The user wants to add this specific book.

**Independent Test**: Can be tested by running the generation command for "Dhammapada" and verifying the output contains Pali text and correct metadata.

**Acceptance Scenarios**:

1. **Given** the generator is configured for Dhammapada, **When** I request generation for Chapter 1, **Then** the system produces a JSON file containing the Pali verses and chapter metadata (using `title_pali`).
2. **Given** a generated Pali chapter, **When** I save it, **Then** it passes validation against the `pali-scripture` schema.

---

### User Story 2 - Translate Pali Scriptures (Priority: P1)

As a content creator, I want to translate Pali verses into other languages (e.g., English, Turkish) so that I can make the Dhammapada accessible to a wider audience.

**Why this priority**: Essential for the "translate" part of the user's request.

**Independent Test**: Can be tested by running the translation command on a file containing Pali verses.

**Acceptance Scenarios**:

1. **Given** a stored chapter with Pali verses, **When** I run the translation command for English, **Then** the system generates English translations for each verse using an appropriate Pali-to-English translation prompt.
2. **Given** a Pali verse, **When** the translation provider processes it, **Then** it correctly identifies the source language as Pali.

---

### User Story 3 - Import and Export Pali Format (Priority: P2)

As an administrator, I want to import and export data in a `pali-scripture` format so that I can manage Pali texts using the same workflow as Sanskrit texts.

**Why this priority**: Necessary infrastructure to support storage and exchange of the generated content.

**Independent Test**: Can be tested by creating a sample JSON with `pali` fields and attempting to import it via CLI.

**Acceptance Scenarios**:

1. **Given** a JSON file with `format: "pali-scripture"`, `title_pali`, and `pali` verse fields, **When** I import it, **Then** it is successfully stored in the database.
2. **Given** stored Pali content, **When** I export it with `--format pali-scripture`, **Then** the output JSON contains the expected Pali fields.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST support a new content format `pali-scripture` distinct from `sanskrit-scripture`.
- **FR-002**: System MUST validate `pali-scripture` files, requiring `title_pali` (instead of `title_sanskrit`) for chapters and `pali` text (instead of `sanskrit`) for verses.
- **FR-003**: System MUST provide a generation prompt template specifically optimized for the Dhammapada and Pali language.
- **FR-004**: System MUST allow the user to specify `--format pali-scripture` in CLI commands (optional for import if auto-detectable, required for export/generate if ambiguous).
- **FR-005**: System MUST support translation from Pali source text to target languages.
- **FR-006**: The database schema MUST store Pali text content (utilizing existing flexible text columns or adding specific support if needed). *Assumption: Existing schema uses generic text columns or JSON that can accommodate this, but validation logic needs update.*

### Key Entities

- **Chapter**: Updated to support `title_pali` metadata.
- **Verse**: Updated to support `pali` text content.
- **PromptTemplate**: New template(s) for Pali/Dhammapada generation and translation.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: User can successfully generate and import all chapters of the Dhammapada in Pali without validation errors.
- **SC-002**: System accepts valid `pali-scripture` JSON files and rejects files missing mandatory Pali fields.
- **SC-003**: Translation operations on Pali content produce non-empty outputs in the target language.

### Assumptions

- **A-001**: Pali text will be handled in Roman transliteration (standard for digital Pali inputs in this context).
- **A-002**: The existing database structure for translations (likely JSON or generic columns) can store Pali text without schema migration, or minimal migration to allow the `pali` key in JSON blobs.