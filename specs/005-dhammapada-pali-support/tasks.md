# Tasks: Support Dhammapada and Pali Scripture Generation

**Feature Branch**: `005-dhammapada-pali-support`
**Status**: Finished
**Total Tasks**: 17

## Phase 1: Setup
*Goal: Ensure project environment is ready for implementation.*

- [X] T001 Verify project builds and tests pass in `tests/`

## Phase 2: Foundational
*Goal: Implement core types, validation schemas, and interface updates required for all user stories.*

- [X] T002 Update `src/models/domain.ts` to include `PaliScripture` types and update `Book` interfaces if necessary
- [X] T003 Implement `pali-scripture` Zod validation schema in `src/lib/validation.ts`
- [X] T004 Add unit tests for `pali-scripture` validation logic in `tests/unit/validation.test.ts`
- [X] T005 Update `TranslationProvider` interface in `src/providers/translation_provider.ts` to accept optional `sourceLanguage`

## Phase 3: Generate Dhammapada Content (P1)
*Goal: Enable generation of Dhammapada chapters in Pali language.*
*Story: [US1]*

- [X] T006 [P] [US1] Create `dhammapada-pali` prompt template in `src/services/prompt_template_service.ts`
- [X] T007 [US1] Add unit tests for Pali generation logic in `tests/unit/chapter_generation_service.test.ts`
- [X] T008 [US1] Update `ChapterGenerationService` in `src/services/chapter_generation_service.ts` to support `dhammapada-pali` template and validation

## Phase 4: Translate Pali Scriptures (P1)
*Goal: Enable translation from Pali source text to target languages.*
*Story: [US2]*

- [X] T009 [US2] Add unit tests for `TranslationService` with source language in `tests/unit/translation_service.test.ts`
- [X] T010 [P] [US2] Update `AiSdkTranslationProvider` in `src/providers/ai_sdk_translation_provider.ts` to support `sourceLanguage` parameter
- [X] T011 [P] [US2] Update `DeepLTranslationProvider` in `src/providers/deepl_translation_provider.ts` to support `sourceLanguage` parameter
- [X] T012 [US2] Update `TranslationService` in `src/services/translation_service.ts` to propagate `sourceLanguage` to providers
- [X] T013 [US2] Update `verse translate` command in `src/cli/commands/verse.ts` to accept `--from` flag

## Phase 5: Import and Export Pali Format (P2)
*Goal: Support storage and exchange of Pali scriptures via JSON files.*
*Story: [US3]*

- [X] T014 [US3] Create integration test for Pali import/export cycle in `tests/integration/import_export_pali.test.ts`
- [X] T015 [US3] Update `ImportService` in `src/services/import_service.ts` to detect and parse `pali-scripture` format
- [X] T016 [US3] Update `ExportService` in `src/services/export_service.ts` to implement `pali-scripture` export logic
- [X] T017 [US3] Update `book export` command in `src/cli/commands/book.ts` to support `--format pali-scripture`

## Implementation Strategy
- **Foundational First**: We must define the shape of Pali data (Zod schema) and the contract for translation providers before building feature logic.
- **US1 (Generation)**: Can be built immediately after validation schemas are ready.
- **US2 (Translation)**: Can be built in parallel with US1 as it touches different services (Translation vs Generation), provided the `TranslationProvider` interface change (T004) is done.
- **US3 (Import/Export)**: Depends on the validation logic from Phase 2 and tests the full lifecycle.

## Dependencies
- US1 requires T003 (Validation)
- US2 requires T004 (Interface Update)
- US3 requires T003 (Validation)
