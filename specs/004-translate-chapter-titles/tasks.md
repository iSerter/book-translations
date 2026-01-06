# Tasks: Translate Chapter Titles

## Phase 1: Database & Models (TDD)
- [x] **Task 1.1**: Create integration test for `chapter_translations` repository.
- [x] **Task 1.2**: Implement migration `005_add_chapter_translations.sql`.
- [x] **Task 1.3**: Update `src/models/domain.ts` to include `ChapterTranslation` and update `Chapter` / `ChapterPackage`.
- [x] **Task 1.4**: Implement `src/db/repositories/chapter_translations.ts`.

## Phase 2: Import Service (TDD)
- [x] **Task 2.1**: Create integration test for `ImportService` verifying `title_turkish` import.
- [x] **Task 2.2**: Update `ImportFileSchema` in `src/lib/validation.ts` to support dynamic title keys.
- [x] **Task 2.3**: Update `ImportService.importFile` to persist chapter translations.

## Phase 3: Translation Service (TDD)
- [x] **Task 3.1**: Create integration test for `TranslationService.translateChapterTitles`.
- [x] **Task 3.2**: Implement `translateChapterTitles` in `src/services/translation_service.ts`.
- [x] **Task 3.3**: Add `translate-titles` command to CLI.

## Phase 4: Export Service (TDD)
- [x] **Task 4.1**: Create integration test for `ExportService` verifying localized titles in output.
- [x] **Task 4.2**: Update `ExportService.aggregateData` to join with `chapter_translations`.
- [x] **Task 4.3**: Update `MarkdownExporter` and `DocxExporter` to use the localized title.

## Phase 5: Verification
- [x] **Task 5.1**: Run full E2E smoke test: Import -> Translate Titles -> Export.
- [x] **Task 5.2**: Final code quality check (lint, type-check).