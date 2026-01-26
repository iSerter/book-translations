# Implementation Plan: Support Dhammapada and Pali Scripture Generation

**Branch**: `005-dhammapada-pali-support` | **Date**: 2026-01-25 | **Spec**: [specs/005-dhammapada-pali-support/spec.md](./spec.md)
**Input**: Feature specification from `specs/005-dhammapada-pali-support/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This feature adds support for the Pali language and the Dhammapada scripture to the book translation application. It introduces a new `pali-scripture` import/export format, updates the generation and translation pipelines to handle Pali content (specifically Roman transliterated Pali), and ensures the database can store and retrieve these texts using existing structures where possible.

## Technical Context

**Language/Version**: Node.js v24
**Primary Dependencies**: `commander` (CLI), `better-sqlite3` (DB), `zod` (Validation)
**Storage**: SQLite (`src/data/book-translations.sqlite`)
**Testing**: Node.js built-in test runner (`node --test`), `tsx` for execution
**Target Platform**: CLI (macOS/Linux/Windows)
**Project Type**: Single CLI project
**Performance Goals**: N/A (CLI tool)
**Constraints**: Must work offline for basic operations (excluding AI generation/translation)
**Scale/Scope**: Support for complete Dhammapada (~423 verses)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

*   **Accuracy and Integrity**: Ensure Pali text is preserved correctly in the database.
*   **CLI-First Interface**: New format support must be exposed via `import`, `export`, and `generate` commands.
*   **Test-First Development**: All new logic (parsers, validators, generators) must be unit tested.
*   **Data Persistence**: Uses existing SQLite schema.
*   **Simplicity and Modularity**: Logic for Pali should parallel Sanskrit logic, possibly sharing common abstractions.

## Project Structure

### Documentation (this feature)

```text
specs/005-dhammapada-pali-support/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
src/
├── models/              # Domain models (no changes expected, verify assumptions)
├── services/            # Business logic
│   ├── book_service.ts
│   ├── export_service.ts
│   ├── import_service.ts
│   ├── translation_service.ts # Update for Pali source
│   └── prompt_template_service.ts # New Pali prompts
├── lib/
│   ├── validation.ts    # Zod schemas for pali-scripture
│   └── config.ts
└── cli/                 # CLI commands (updates to support --format)
```

**Structure Decision**: Continue with existing single-project structure.