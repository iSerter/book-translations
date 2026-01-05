# Implementation Plan: Book Export Formats

**Branch**: `002-book-export-formats` | **Date**: 2026-01-05 | **Spec**: [specs/002-book-export-formats/spec.md](specs/002-book-export-formats/spec.md)
**Input**: Feature specification from `specs/002-book-export-formats/spec.md`

## Summary

Implement a new CLI command to export book content into Markdown, Word (.docx), and JSON formats. The feature will support exporting full books or individual chapters, with options to filter translation languages.

## Technical Context

**Language/Version**: Node.js v24 (consistent with project)
**Primary Dependencies**: 
- `commander` (existing CLI)
- `better-sqlite3` (existing DB)
- `docx` (new dependency for Word generation) [NEEDS CLARIFICATION: Validate `docx` library suitability and alternatives]
**Storage**: SQLite (Read-only access for export)
**Testing**: `tsx --test` (consistent with project)
**Target Platform**: CLI (macOS/Linux/Windows)
**Project Type**: Single CLI project
**Performance Goals**: Export full book (100 chapters) < 60s
**Constraints**: 
- Must not modify database
- Output files must be standard and valid
- Minimal new dependencies preferred

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Accuracy and Integrity**: N/A (Read-only operation, but must ensure exported data accurately reflects DB content)
- **CLI-First Interface**: PASSED (Feature is a CLI command `export`)
- **Test-First Development**: PASSED (Will follow TDD)
- **Data Persistence**: PASSED (Reading from existing SQLite)
- **Simplicity and Modularity**: PASSED (Adding a dedicated export service/module)

## Project Structure

### Documentation (this feature)

```text
specs/002-book-export-formats/
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
├── cli/
│   └── commands/
│       └── export.ts       # New command
├── services/
│   ├── export_service.ts   # New service for orchestration
│   └── exporters/
│       ├── index.ts        # Interface
│       ├── json_exporter.ts
│       ├── markdown_exporter.ts
│       └── word_exporter.ts
└── lib/
    └── exporters/          # (Optional) Shared utilities
```

**Structure Decision**: Option 1: Single project. Extending existing `src/cli/commands` and adding `src/services/exporters` for modularity.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| New Dependency (`docx`) | Required for .docx generation | Generating binary/XML zip format manually is error-prone and complex |