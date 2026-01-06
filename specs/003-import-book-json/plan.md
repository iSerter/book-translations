# Implementation Plan: Import Book JSON Content

**Branch**: `003-import-book-json` | **Date**: 2026-01-06 | **Spec**: [specs/003-import-book-json/spec.md](../spec.md)
**Input**: Feature specification from `specs/003-import-book-json/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement a new CLI command `translations import` to parse and store book content (books, chapters, verses, translations) from JSON files. This feature supports single file imports and bulk operations via glob patterns, ensuring idempotency and data integrity. It includes an extensible architecture to support multiple import formats, starting with `sanskrit-scripture`.

## Technical Context


**Language/Version**: Node.js >=22 <23 (per package.json)
**Primary Dependencies**: `commander` (CLI), `better-sqlite3` (DB), `zod` (Validation)
**Storage**: SQLite
**Testing**: Node.js Test Runner (`tsx --test`)
**Target Platform**: CLI
**Project Type**: Single project
**Performance Goals**: N/A (CLI tool, reasonable parsing speed expected)
**Constraints**: Must support `ChapterPackage` type structure or similar JSON schema.
**Scale/Scope**: Imports are local file-based.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Accuracy and Integrity**: N/A (Tool imports existing data, does not generate it, but must preserve fidelity).
- [x] **CLI-First Interface**: Feature is a CLI command.
- [x] **Test-First Development**: Plan includes independent tests.
- [x] **Data Persistence**: Uses SQLite.
- [x] **Simplicity and Modularity**: Uses existing command structure and likely a new service for import logic.

## Project Structure

### Documentation (this feature)

```text
specs/003-import-book-json/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
src/
├── cli/
│   └── commands/
│       └── translations.ts  # Add import command registration
├── services/
│   └── import_service.ts    # New service for import logic
└── lib/
    └── validation.ts        # Schema validation for JSON input

tests/
├── cli/
│   └── translations_import.test.ts # E2E/Integration test for the command
└── unit/
    └── services/
        └── import_service.test.ts  # Unit tests for parsing and logic
```

**Structure Decision**: Single project structure extending existing CLI and Service layers.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | | |