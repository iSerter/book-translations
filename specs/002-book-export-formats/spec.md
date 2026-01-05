# Feature Specification: Book Export Formats

**Feature Branch**: `002-book-export-formats`
**Created**: January 5, 2026
**Status**: Draft
**Input**: User description: "export markdown, Word doc, and JSON options for books and chapters."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Export Full Book in Multiple Formats (Priority: P1)

As a content manager, I want to export an entire book into Markdown, Word, and JSON formats so that I can distribute the content to different publishing platforms and stakeholders.

**Why this priority**: Enabling distribution of the full translated work is the primary business goal.

**Independent Test**: Can be tested by running an export command for a stored book and verifying three files (.md, .docx, .json) are created and contain all book content.

**Acceptance Scenarios**:

1. **Given** a stored book with multiple chapters and translations, **When** I run the export command selecting all formats, **Then** three valid files (Markdown, Word, JSON) are generated in the specified output directory.
2. **Given** a book with 50 chapters, **When** I export to Word, **Then** the resulting document contains all 50 chapters in correct order with headings and verse text.

---

### User Story 2 - Export Single Chapter (Priority: P2)

As an editor, I want to export a specific chapter so that I can review or share just that portion of the work without generating the entire book.

**Why this priority**: Editors often work chapter-by-chapter; exporting the full book is unnecessary overhead for focused reviews.

**Independent Test**: Can be tested by running the export command with a chapter filter and verifying the output contains only that chapter's data.

**Acceptance Scenarios**:

1. **Given** a book with chapters 1-10, **When** I request an export for Chapter 5 only, **Then** the generated files contain content only for Chapter 5.
2. **Given** a request for a non-existent chapter, **When** I run the export, **Then** the system reports an error and generates no files.

---

### User Story 3 - Select Specific Export Formats (Priority: P3)

As a developer, I want to export only the JSON data so that I can inspect the structured content without waiting for document generation.

**Why this priority**: Users may only need one format; generating all formats wastes time and disk space.

**Independent Test**: Can be tested by specifying a single format flag (e.g., `--format json`) and verifying only that file type is created.

**Acceptance Scenarios**:

1. **Given** a book, **When** I run export specifying only JSON, **Then** only a `.json` file is created.
2. **Given** a book, **When** I run export specifying Markdown and Word, **Then** only `.md` and `.docx` files are created.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a CLI command to export book content.
- **FR-002**: System MUST support exporting to Markdown (`.md`) format.
- **FR-003**: System MUST support exporting to Microsoft Word (`.docx`) format.
- **FR-004**: System MUST support exporting to JSON (`.json`) format.
- **FR-005**: Users MUST be able to specify which formats to generate (one, multiple, or all).
- **FR-006**: Users MUST be able to filter the export by Book ID (exporting the whole book).
- **FR-007**: Users MUST be able to filter the export by Chapter Number (exporting a single chapter of a book).
- **FR-008**: System MUST allow specifying an output directory for the generated files.
- **FR-009**: The JSON export MUST [NEEDS CLARIFICATION: Should the JSON structure mirror the internal DB schema exactly, or follow a specific public exchange schema?]
- **FR-010**: The Markdown and Word exports MUST [NEEDS CLARIFICATION: Are there specific styling/template requirements (e.g., specific fonts, headers, layout), or is a generic clean format sufficient?]
- **FR-011**: The export MUST include [NEEDS CLARIFICATION: Should the export include ALL available translations for every verse, or should the user be able to filter/select specific languages?]

### Key Entities *(include if feature involves data)*

- **Export Job**: Represents a user request to export data, containing parameters for book, chapter, formats, and output location.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Export of a full book (approx. 100 chapters, 2000 verses) to all 3 formats completes in under 60 seconds.
- **SC-002**: Generated JSON files must be syntactically valid (parseable by standard JSON parsers).
- **SC-003**: Generated Word documents must open without errors in Microsoft Word or compatible viewers.
- **SC-004**: Generated Markdown files must render correctly in standard Markdown viewers (headers, paragraphs).

## Assumptions *(optional)*

- The export process is read-only and does not modify the database.
- Word export does not require an installed copy of Microsoft Word (uses a library like `docx`).
- File names will be automatically generated based on Book Title/Chapter unless specified.