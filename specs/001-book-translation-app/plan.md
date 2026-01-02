# Implementation Plan: Book Translation App

**Branch**: `001-book-translation-app` | **Date**: 2026-01-02 | **Spec**: specs/001-book-translation-app/spec.md
**Input**: Feature specification from `specs/001-book-translation-app/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a CLI-first Node.js app with SQLite persistence to store books (chapter/verse structure), generate first-pass chapter packages from reusable prompt templates, translate specified verses via providers, and retrieve stored translations. Provider calls must be robust (timeouts/retries, clear errors) and storage must validate and avoid partial corruption.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript on Node.js v22 (temporary until better-sqlite3 supports v24)  
**Primary Dependencies**: `commander` (CLI), `better-sqlite3` (SQLite access), `ai-sdk` + provider SDKs, `deepl-node` (DeepL)  
**Storage**: SQLite (local file DB)  
**Testing**: `node:test` + `node:assert/strict` (optionally `c8` later for coverage)  
**Target Platform**: macOS/Linux (local CLI), CI via Node.js runtime
**Project Type**: Single project (CLI app + libraries)  
**Performance Goals**: Meet SC-001/SC-002 targets; bulk inserts via transactions; avoid per-verse DB commits  
**Constraints**: CLI-first I/O contract (JSON on stdout with `--json`, errors to stderr); provider failures must not corrupt data  
**Scale/Scope**: Up to 100 chapters / 1,000 verses per book baseline (SC-001)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Accuracy and Integrity: Ensure generated/translated outputs are stored with metadata (provider/model), and outputs are validated before persistence.
- CLI-First Interface: All workflows exposed via CLI; with `--json` stdout is machine-readable JSON only; errors to stderr.
- Test-First Development (NON-NEGOTIABLE): Add `node:test` coverage for core services and CLI commands before implementation.
- Data Persistence: Use SQLite with foreign keys, indexes, and safe transaction boundaries.
- Simplicity and Modularity: Keep minimal dependencies; isolate provider integrations behind interfaces.

GATE RESULT (pre-research): PASS

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
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
├── db/
├── models/
├── providers/
└── services/

tests/
├── integration/
├── unit/
└── cli/
```

**Structure Decision**: Single-project CLI. Keep provider adapters and persistence isolated behind services for testability and to satisfy CLI-first + TDD requirements.

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
