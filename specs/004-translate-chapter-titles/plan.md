# Implementation Plan: Translate Chapter Titles

**Branch**: `004-translate-chapter-titles` | **Date**: 2026-01-06 | **Spec**: [specs/004-translate-chapter-titles/spec.md]
**Input**: Feature specification from `/specs/004-translate-chapter-titles/spec.md`

## Summary
Implement support for chapter title translations. This involves adding a new `chapter_translations` table to store localized titles, updating the `ImportService` to persist titles from JSON, extending the `TranslationService` to automate title translation, and ensuring the `ExportService` uses localized titles with fallbacks to the source title.

## Technical Context

**Language/Version**: Node.js v24  
**Primary Dependencies**: better-sqlite3, zod, ai-sdk  
**Storage**: SQLite  
**Testing**: vitest (based on existing test files)  
**Target Platform**: CLI / Local
**Project Type**: Single project (CLI application)  
**Performance Goals**: N/A (CLI operations are local and low-volume)
**Constraints**: SQLite concurrency, AI provider API limits  
**Scale/Scope**: ~700 chapters (Gita scale)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Accuracy and Integrity**: Translations will be stored with provider/model metadata to ensure traceability.
- **CLI-First Interface**: New commands will be added to support title-specific translations.
- **Test-First Development**: Integration tests will be created for import/export flows *before* implementation.
- **Data Persistence**: New `chapter_translations` table follows standard normalization patterns.
- **Simplicity and Modularity**: Separate table for chapter translations keeps the schema modular and avoids complexity in the main `translations` table.

## Project Structure

### Documentation (this feature)

```text
specs/004-translate-chapter-titles/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (to be created)
```

### Source Code (repository root)

```text
src/
├── db/
│   ├── migrations/      # 005_add_chapter_translations.sql
│   └── repositories/    # chapter_translations.ts
├── models/              # domain.ts updates
├── services/
│   ├── import_service.ts # Update to support title_lang
│   ├── export_service.ts # Update to include localized titles
│   └── translation_service.ts # Add translateChapterTitles
└── cli/
    └── commands/        # Add/update commands for titles
```

**Structure Decision**: Single project structure is maintained.

## Complexity Tracking

No constitution violations detected.