# Tasks: Import Book JSON Content

**Feature Branch**: `003-import-book-json`
**Status**: Pending

## Phase 1: Setup
*Goal: Ensure project is ready for new feature implementation.*

- [x] T001 Verify project dependencies (zod, commander) in package.json

## Phase 2: Foundational
*Goal: Create core structures and definitions shared across user stories.*

- [x] T002 Create ImportService class structure in src/services/import_service.ts
- [x] T003 Define Zod schemas for 'sanskrit-scripture' format in src/lib/validation.ts

## Phase 3: User Story 1 - Import Single Chapter JSON (P1)
*Goal: Enable importing a single JSON file to populate Book, Chapter, Verse, and Translation tables.*

- [x] T004 [US1] Create E2E test for single file import in tests/cli/us1_import_single_chapter.test.ts
- [x] T005 [US1] Implement file parsing, validation, and metadata inference (provider/model from path) in src/services/import_service.ts
- [x] T006 [US1] Implement Book and Chapter lookup/create logic in src/services/import_service.ts
- [x] T007 [US1] Implement Verse and Translation creation logic in src/services/import_service.ts
- [x] T008 [US1] Register 'import' subcommand in src/cli/commands/translations.ts
- [x] T009 [US1] Wire up CLI 'import' command to ImportService (passing provider arg) in src/cli/commands/translations.ts

## Phase 4: User Story 2 - Idempotency and Updates (P2)
*Goal: Ensure re-running import does not duplicate data and updates existing translations.*

- [x] T010 [US2] Add idempotency and update test cases in tests/cli/us2_import_idempotency.test.ts
- [x] T011 [US2] Update Book/Chapter/Verse logic to check existence before creation in src/services/import_service.ts
- [x] T012 [US2] Implement upsert (update if exists) logic for Translations in src/services/import_service.ts

## Phase 5: User Story 3 - Bulk Import (P3)
*Goal: Support importing multiple files using glob patterns.*

- [x] T013 [US3] Add bulk import test cases in tests/cli/us3_import_bulk.test.ts
- [x] T014 [US3] Implement glob pattern expansion in src/cli/commands/translations.ts
- [x] T015 [US3] Update ImportService to handle batch processing and error aggregation in src/services/import_service.ts
- [x] T016 [US3] Add summary reporting (success/fail counts) to CLI output in src/cli/commands/translations.ts

## Phase 6: Polish
*Goal: Refine error handling and user experience.*

- [x] T017 Improve error messages for invalid JSON or schema violations in src/services/import_service.ts
- [x] T018 Ensure proper console output formatting (colors/indentation) in src/cli/commands/translations.ts

## Dependencies

1. **Setup** -> **Foundational**
2. **Foundational** -> **US1**
3. **US1** -> **US2** (Idempotency builds on basic import)
4. **US1** -> **US3** (Bulk import relies on single file logic)

## Implementation Strategy

- **MVP**: Complete Phase 1-3. This allows importing single files manually.
- **Robustness**: Phase 4 ensures data integrity during re-imports.
- **Efficiency**: Phase 5 enables batch operations for full book imports.
