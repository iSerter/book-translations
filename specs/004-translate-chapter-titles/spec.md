# Feature Specification: Translate Chapter Titles

**Feature Branch**: `004-translate-chapter-titles`  
**Created**: 2026-01-06  
**Status**: Draft  
**Input**: User description: "currently we're neglecting to translate chapter titles... only verses are translated... but we must translate the chapter titles too -when they're present. analyze the app, understand the current state, and then create a plan/specs to implement title translations too. the export and import features should handle them as well. and of course the generation and translate processes too."

## User Scenarios & Testing

### User Story 1 - Import Translated Titles (Priority: P1)

As a content manager, I want the system to import translated chapter titles from existing JSON files so that I don't lose existing translation work when importing books.

**Why this priority**: Importing existing data correctly is fundamental to the integrity of the book data. Losing titles during import would be a regression/data loss.

**Independent Test**: Can be tested by importing a JSON file containing a translated title and verifying it is stored.

**Acceptance Scenarios**:

1. **Given** a JSON book file with a "title_turkish" (or similar language key) field, **When** I run the import command, **Then** the system stores the Turkish translation of the chapter title.
2. **Given** a JSON book file with no translated title, **When** I run the import command, **Then** the system stores the book and verses without error, leaving the translated title empty.

---

### User Story 2 - Export Translated Titles (Priority: P1)

As a reader, I want to see the chapter title in my language when I export a book, so that the entire document is consistent.

**Why this priority**: The end value of the system is the exported book. If the title remains in English while verses are in Turkish, the experience is broken.

**Independent Test**: Can be tested by exporting a book that has stored chapter translations and checking the output file.

**Acceptance Scenarios**:

1. **Given** a book with a stored Turkish chapter title, **When** I export the book in Turkish, **Then** the output document (Markdown/Docx) displays the Turkish title at the chapter heading.
2. **Given** a book *without* a Turkish chapter title, **When** I export the book in Turkish, **Then** the system falls back to the source language title (e.g., English) for the heading.

---

### User Story 3 - Translate Missing Titles (Priority: P2)

As a translator (or automated system), I want to identify and translate chapter titles that are missing translations, so that the book is fully localized.

**Why this priority**: Automating the gap-filling ensures 100% coverage without manual intervention.

**Independent Test**: Can be tested by running the translation command on a book with untranslated chapters.

**Acceptance Scenarios**:

1. **Given** a chapter with a source title but no Turkish translation, **When** I run the translation process for Turkish, **Then** the system generates/fetches a translation for the chapter title and stores it.
2. **Given** a chapter that is already fully translated, **When** I run the translation process, **Then** the system preserves the existing title translation.

## Requirements

### Functional Requirements

- **FR-001**: System MUST store translated chapter titles for any supported language.
- **FR-002**: Import process MUST parse and persist translated chapter titles when provided in the source file (e.g., `title_turkish`, `title_spanish`).
- **FR-003**: Export process MUST retrieve the translated chapter title for the requested target language.
- **FR-004**: Export process MUST insert the translated title into the document structure (headings) during export.
- **FR-005**: Translation process MUST be able to target Chapter Titles as a translatable entity (distinct from Verses).
- **FR-006**: Translation process MUST detect when a chapter title translation is missing and attempt to generate it via the configured AI provider.
- **FR-007**: Generation process (when creating new content) MUST support generating the title in the target language if immediate translation is requested/configured.

### Key Entities

- **Chapter**: The core unit of a book, containing a source title.
- **ChapterTranslation**: Represents the localized title of a specific Chapter for a specific Language.
- **Verse**: Existing entity containing text.
- **Translation**: Existing entity, currently used for verses. (May need to be conceptually expanded or mirrored for Chapters).

## Success Criteria

### Measurable Outcomes

- **SC-001**: 100% of imported chapter titles (where present in source) are retrievable from the system.
- **SC-002**: Exported documents in a target language contain the translated chapter title (if available) in the correct heading format.
- **SC-003**: The translation command successfully fills 100% of missing chapter title translations for a target language when run.

### Edge Cases

- **EC-001**: Source title is missing or empty. (System should handle gracefully, likely skipping translation).
- **EC-002**: Translation provider fails to translate the title. (System should log error but potentially continue with verses, or retry).
- **EC-003**: Multiple conflicting translations for the same title in import. (System should likely update or respect the latest).