---

description: "Task list for feature implementation"

---

# Tasks: Book Translation App

**Input**: Design documents from `specs/001-book-translation-app/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/, quickstart.md

**Tests**: INCLUDED. The constitution mandates test-first development.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] T### [P?] [US#?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[US#]**: Which user story this task belongs to (US1..US4). Only used in user story phases.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create initial Node/TypeScript project skeleton in package.json and tsconfig.json
- [X] T002 Create directory structure per plan in src/cli/, src/db/, src/models/, src/providers/, src/services/, tests/unit/, tests/integration/, tests/cli/
- [X] T003 Configure TypeScript build output in tsconfig.json (outDir dist/, rootDir src/)
- [X] T004 Configure npm scripts in package.json for build/test/lint (e.g., build, test, lint)
- [X] T005 Configure ESLint + Prettier config files (.eslint* and .prettierrc) for TypeScript sources

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 Implement environment/config loader in src/lib/config.ts (DB path, provider keys, defaults)
- [X] T007 [P] Implement app error types and error-to-exit-code mapping in src/lib/errors.ts
- [X] T008 [P] Implement stdout/stderr output helpers (text vs --json) in src/lib/output.ts
- [X] T009 [P] Implement input validation utilities (positive ints, language code) in src/lib/validation.ts

- [X] T010 [P] Implement shared provider error normalization (kind/retryable/retryAfterMs) in src/providers/provider_error.ts
- [X] T011 Implement provider registry/selection utilities in src/providers/provider_registry.ts

- [X] T012 Add SQLite connection helper with required pragmas in src/db/connection.ts
- [X] T013 Add migration runner and schema_version tracking in src/db/migrate.ts
- [X] T014 [P] Create initial schema migration in src/db/migrations/001_init.sql (books, chapters, verses, translations, prompt_templates, generation_runs)

- [X] T015 Create DB repository helpers for book/chapter/verse CRUD in src/db/repositories/books.ts
- [X] T016 [P] Create DB repository helpers for translations in src/db/repositories/translations.ts
- [X] T017 [P] Create DB repository helpers for prompt templates in src/db/repositories/prompt_templates.ts
- [X] T018 [P] Create DB repository helpers for generation runs in src/db/repositories/generation_runs.ts

- [X] T019 Create CLI entrypoint and global options (--json, --db) in src/cli/index.ts
- [X] T020 Add CLI wiring utilities (command error handling, process exitCode) in src/cli/run.ts

- [X] T021 [P] Add integration test harness for temp DB creation in tests/helpers/tmp_db.ts
- [X] T022 Add integration test verifying migrations apply cleanly in tests/integration/db_migrations.test.ts
- [X] T023 [P] Add CLI test harness for spawning CLI in tests/helpers/spawn_cli.ts

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Store Book Structure (Priority: P1) 🎯 MVP

**Goal**: Store a book title and chapter/verse structure in SQLite via CLI.

**Independent Test**: Running the store command persists a book with chapters/verses that can be verified by querying the DB.

### Tests for User Story 1 (TDD)

- [X] T024 [P] [US1] Add small book fixture JSON in tests/fixtures/us1_book_small.json
- [X] T025 [US1] Add CLI test for storing a book in tests/cli/us1_book_store.test.ts
- [X] T026 [P] [US1] Add integration test for idempotent chapter insert behavior in tests/integration/us1_store_book_idempotent.test.ts

### Implementation for User Story 1

- [X] T027 [P] [US1] Define Book/Chapter/Verse TypeScript types in src/models/domain.ts
- [X] T028 [US1] Implement store-book service (transactional insert/upsert) in src/services/book_service.ts
- [X] T029 [US1] Implement `book store` command (file/stdin input, validation, --json output) in src/cli/commands/book.ts
- [X] T030 [US1] Wire `book` commands into src/cli/index.ts
- [X] T031 [US1] Ensure DB constraints + service logic prevent invalid chapter/verse numbers (FR-005) in src/services/book_service.ts


**Checkpoint**: User Story 1 functional and independently testable

---

## Phase 4: User Story 2 - Generate First-Pass Chapter Content from a Prompt (Priority: P2)

**Goal**: Generate and store a chapter package (verses 1..N) using a reusable prompt template, with resume support.

**Independent Test**: Run chapter generation for a small N with a deterministic test provider, verify verses are sequential and chapter becomes complete; verify resume fills missing verses.

### Tests for User Story 2 (TDD)

- [X] T032 [P] [US2] Add unit tests for generated chapter validation rules in tests/unit/us2_chapter_package_validator.test.ts
- [X] T033 [P] [US2] Add CLI test for chapter generation with resume in tests/cli/us2_chapter_generate_resume.test.ts
- [X] T034 [P] [US2] Add CLI test for rejecting invalid generated output without overwriting stored data in tests/cli/us2_chapter_generate_reject_invalid.test.ts

### Implementation for User Story 2

- [X] T035 [P] [US2] Implement chapter package validator (sequential numbering, expected count) in src/services/chapter_package_validator.ts
- [X] T036 [P] [US2] Implement prompt template storage service in src/services/prompt_template_service.ts
- [X] T037 [US2] Implement `template add` and `template get` commands in src/cli/commands/template.ts

- [X] T038 [P] [US2] Define generation provider interface in src/providers/generation_provider.ts
- [X] T039 [P] [US2] Implement deterministic fake generation provider for tests in src/providers/fake_generation_provider.ts
- [X] T040 [US2] Register generation providers (fake + ai-sdk) in src/providers/provider_registry.ts
- [X] T041 [US2] Implement ai-sdk generation provider wrapper with timeouts/retries in src/providers/ai_sdk_generation_provider.ts

- [X] T042 [US2] Implement generation-run persistence (start/update/complete/fail) in src/services/generation_run_service.ts
- [X] T043 [US2] Implement chapter generation orchestrator (resume from verse, store progress) in src/services/chapter_generation_service.ts
- [X] T044 [US2] Implement `chapter generate` command in src/cli/commands/chapter.ts
- [X] T045 [US2] Wire `template` and `chapter` commands into src/cli/index.ts

**Checkpoint**: User Stories 1 and 2 both independently functional

---

## Phase 5: User Story 3 - Translate Verses via Command Line (Priority: P3)

**Goal**: Translate one or more stored verses into a target language via CLI and store translations.

**Independent Test**: Store a small book, translate one verse using a deterministic test provider, and verify translation is stored; verify provider failure does not corrupt stored data.

### Tests for User Story 3 (TDD)

- [X] T046 [P] [US3] Add CLI test for translating a verse using fake provider in tests/cli/us3_verse_translate.test.ts
- [X] T047 [P] [US3] Add CLI test for duplicate translation behavior (refuse vs overwrite flag) in tests/cli/us3_duplicate_translation_policy.test.ts
- [X] T048 [P] [US3] Add CLI test ensuring provider failures do not overwrite existing translations in tests/cli/us3_provider_failure_no_corruption.test.ts

### Implementation for User Story 3

- [X] T049 [P] [US3] Define translation provider interface in src/providers/translation_provider.ts
- [X] T050 [P] [US3] Implement deterministic fake translation provider for tests in src/providers/fake_translation_provider.ts
- [X] T051 [P] [US3] Implement DeepL translation provider wrapper in src/providers/deepl_translation_provider.ts
- [X] T052 [P] [US3] Implement AI-SDK-as-translator provider wrapper in src/providers/ai_sdk_translation_provider.ts
- [X] T053 [US3] Register translation providers in src/providers/provider_registry.ts

- [X] T054 [US3] Implement translation service (fetch verses, call provider, store results, handle duplicates) in src/services/translation_service.ts
- [X] T055 [US3] Implement `verse translate` command (multiple verses, --overwrite, --json) in src/cli/commands/verse.ts
- [X] T056 [US3] Wire `verse` commands into src/cli/index.ts

**Checkpoint**: User Stories 1–3 independently functional

---

## Phase 6: User Story 4 - Retrieve Translations (Priority: P4)

**Goal**: Retrieve stored translations for a book/chapter/verse via CLI.

**Independent Test**: After storing a book and a translation, query translations and verify all available translations are returned; query a non-existent verse returns empty results.

### Tests for User Story 4 (TDD)

- [X] T057 [P] [US4] Add CLI test for retrieving translations in tests/cli/us4_translations_get.test.ts
- [X] T058 [P] [US4] Add CLI test for non-existent verse returning empty results in tests/cli/us4_translations_get_missing.test.ts

### Implementation for User Story 4

- [X] T059 [US4] Implement translations query service in src/services/translations_query_service.ts
- [X] T060 [US4] Implement `translations get` command in src/cli/commands/translations.ts
- [X] T061 [US4] Wire `translations` commands into src/cli/index.ts

**Checkpoint**: All user stories functional and independently testable

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T062 [P] Update documentation for env vars and providers in README.md
- [X] T063 Update quickstart commands to match implemented CLI in specs/001-book-translation-app/quickstart.md
- [X] T064 Add performance check for bulk insert (SC-001) in tests/integration/perf_us1_bulk_insert_smoke.test.ts
- [X] T065 Add end-to-end smoke test covering US1→US4 flow in tests/cli/e2e_smoke_us1_us4.test.ts

---

## Dependencies & Execution Order

### User Story Completion Order (Dependency Graph)

- Setup (Phase 1) → Foundational (Phase 2) → US1 (Phase 3) → US2 (Phase 4) → US3 (Phase 5) → US4 (Phase 6) → Polish (Phase 7)

### Notes on Dependencies

- All stories depend on Phase 2 (DB + CLI skeleton + shared error/output patterns).
- US2 depends on having a stored book/chapter scaffolding (US1) to attach generation results.
- US3 depends on having stored verses (US1) and provider integration (US3 phase tasks).
- US4 depends on translations existing (US3), but can be tested independently by seeding data in its test setup.

---

## Parallel Execution Examples (per User Story)

### US1 parallel opportunities

- T024 (fixture) and T027 (types) can be done in parallel.
- T028 (service) and T029 (CLI command) can be split once interfaces are agreed.

### US2 parallel opportunities

- T035 (validator), T036 (template service), T038–T041 (providers) can be parallelized by file.

### US3 parallel opportunities

- T049–T052 (provider wrappers) can be parallelized by file.
- T046–T048 (tests) can be parallelized by file.

### US4 parallel opportunities

- T057 and T058 (tests) can be parallelized by file.

---

## Implementation Strategy

### MVP Scope (Recommended)

- MVP = Setup + Foundational + User Story 1 (Phases 1–3)
- Validate via CLI test + DB verification before proceeding to US2

### Incremental Delivery

- Deliver one user story per phase, keeping each phase independently testable.
- Maintain CLI JSON/text contract across all commands.
- Keep provider integrations behind interfaces so failures don’t corrupt data.
