# Tasks: Book Export Formats

**Branch**: `002-book-export-formats` | **Spec**: [specs/002-book-export-formats/spec.md](specs/002-book-export-formats/spec.md)

## Phase 1: Setup
*Goal: Initialize project dependencies and structure for the export feature.*

- [X] T001 Install `docx` dependency for Word document generation
- [X] T002 Create directory structure `src/services/exporters`
- [X] T003 Create directory structure `src/lib/exporters` (if needed for shared utils)

## Phase 2: Foundations
*Goal: Establish core data structures and interfaces for the export pipeline.*

- [X] T004 Define `ExportOptions`, `ExportData`, `ExportChapter`, `ExportVerse`, `ExportTranslation` interfaces in `src/models/export_domain.ts` (or `src/services/exporters/types.ts`)
- [X] T005 Create `IExporter` interface in `src/services/exporters/index.ts` defining `export(data: ExportData, options: ExportOptions): Promise<void>`
- [X] T006 Implement `ExportService` skeleton in `src/services/export_service.ts`
- [X] T007 Implement data aggregation logic in `ExportService` (fetch book, chapters, verses, translations) using `src/db/repositories`

## Phase 3: User Story 1 - Export Full Book in Multiple Formats (P1)
*Goal: Enable exporting an entire book to JSON, Markdown, and Word formats.*
*Independent Test: Run `book export <slug>` and verify 3 files are created with correct content.*

### Exporters
- [X] T008 [P] [US1] Implement `JsonExporter` in `src/services/exporters/json_exporter.ts`
- [X] T009 [P] [US1] Implement `MarkdownExporter` in `src/services/exporters/markdown_exporter.ts`
- [X] T010 [P] [US1] Implement `WordExporter` in `src/services/exporters/word_exporter.ts` using `docx` library

### CLI Integration
- [X] T011 [US1] Create `src/cli/commands/export.ts` with basic command structure `book export <slug>`
- [X] T012 [US1] Register `export` command in `src/cli/index.ts` (or main entry point)
- [X] T013 [US1] Wire up `ExportService` to `export` command to run all exporters by default

### Tests
- [X] T014 [US1] Create unit test for `JsonExporter` in `tests/unit/services/exporters/json_exporter.test.ts`
- [X] T015 [US1] Create unit test for `MarkdownExporter` in `tests/unit/services/exporters/markdown_exporter.test.ts`
- [X] T016 [US1] Create integration test for full book export in `tests/integration/cli/export_full_book.test.ts`

## Phase 4: User Story 2 - Export Single Chapter (P2)
*Goal: Allow users to export only a specific chapter.*
*Independent Test: Run `book export <slug> --chapter 5` and verify output contains only Chapter 5.*

- [X] T017 [US2] Update `ExportOptions` and `ExportService` to accept `chapterNumber`
- [X] T018 [US2] Update data aggregation query in `ExportService` to filter by chapter number
- [X] T019 [US2] Update CLI command in `src/cli/commands/export.ts` to accept `--chapter` flag
- [X] T020 [US2] Add test case for chapter filtering in `tests/integration/cli/export_single_chapter.test.ts`

## Phase 5: User Story 3 - Select Specific Export Formats & Languages (P3)
*Goal: Allow users to specify output formats and filter languages.*
*Independent Test: Run `book export <slug> --format json --languages en` and verify only JSON file with English text.*

- [X] T021 [US3] Update `ExportService` to respect `formats` list and only run selected exporters
- [X] T022 [US3] Update `ExportService` data aggregation to filter translations by `languageCode`
- [X] T023 [US3] Update CLI command in `src/cli/commands/export.ts` to accept `--format` and `--languages` flags
- [X] T024 [US3] Add validation: ensure at least one valid format is selected
- [X] T025 [US3] Add test case for format filtering in `tests/integration/cli/export_formats.test.ts`
- [X] T026 [US3] Add test case for language filtering in `tests/integration/cli/export_languages.test.ts`

## Final Phase: Polish
*Goal: Final cleanup and end-to-end verification.*

- [X] T027 Verify file naming conventions (`[slug]_[timestamp].[ext]` or `[slug]_chapter-[N]_[timestamp].[ext]`)
- [X] T028 Ensure output directory is created if it doesn't exist in `ExportService`
- [X] T029 Update README or CLI help text with new command usage

## Dependencies

1. **Phase 1 & 2** are blocking for all User Stories.
2. **Phase 3 (US1)** implements the core exporters.
3. **Phase 4 (US2)** and **Phase 5 (US3)** can technically be done in parallel after Phase 3, but linear execution is safer for CLI flag integration.

## Parallel Execution Examples

- **In Phase 3**: `JsonExporter` (T008), `MarkdownExporter` (T009), and `WordExporter` (T010) can be implemented simultaneously by different developers.
- **In Phase 5**: Format filtering (T021/T023) and Language filtering (T022) are distinct logic paths in `ExportService`.

## Implementation Strategy

1. **MVP (Phase 1-3)**: Deliver a working CLI that exports EVERYTHING (all chapters, all formats). This proves the core value.
2. **Refinement (Phase 4)**: Add granularity (chapters).
3. **Optimization (Phase 5)**: Add selection (formats/languages).
