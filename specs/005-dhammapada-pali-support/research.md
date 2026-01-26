# Research: Support Dhammapada and Pali Scripture Generation

**Status**: Phase 0 Complete
**Date**: 2026-01-25

## 1. Source Language Handling in Translation

**Question**: How does the current system determine the source language for translation?
**Finding**: The system currently does not explicitly handle the source language.
- `TranslationProvider.translateBatch(texts, targetLanguage)` interface does not accept a source language.
- `AiSdkTranslationProvider` uses a generic prompt: "Translate the following X texts into Y...".
- `DeepLTranslationProvider` relies on auto-detection (passes `null` as source).

**Decision**:
- Update `TranslationProvider` interface to accept an optional `sourceLanguage` parameter.
- Update `AiSdkTranslationProvider` to incorporate `sourceLanguage` into the prompt if provided (e.g., "Translate the following Pali texts into English...").
- Update CLI commands (`verse translate`, `chapter translate`) to accept a `--from <lang>` option.

## 2. Pali Transliteration Standards

**Question**: What is the standard for digital Pali text?
**Finding**: Romanized Pali (using IAST or similar schemes) is the standard for digital interchange and generation in this context.
- **Decision**: The system will handle Pali in Romanized script.
- **Validation**: No strict regex validation will be enforced initially, but the generation prompt should explicitly request Romanized Pali.

## 3. Database Schema

**Question**: Do we need schema changes to store Pali?
**Finding**: The existing schema is generic.
- `verses` table has `source_text` (TEXT).
- `chapters` table has `title` (TEXT).
- **Decision**: No schema changes required. `pali` content will be mapped to `source_text`. The "format" (Pali vs Sanskrit) is a concern for the Application Layer (Parsers/Generators), not the Persistence Layer.

## 4. Prompt Engineering for Dhammapada

**Question**: How to generate high-quality Pali/English Dhammapada content?
**Finding**:
- The prompt needs to specify the structure (Verse, Pali text, English translation).
- It should likely reference the specific chapter and verse numbers to ensure accuracy.
- **Decision**: Create a new `PromptTemplate` specifically for `dhammapada` (or generic `pali-scripture`) that instructs the LLM to output JSON matching our import format, with Romanized Pali.

## 5. Alternatives Considered

- **Store Language in Book Table**:
    - *Pros*: Automatic source detection.
    - *Cons*: Schema migration required.
    - *Decision*: Defer. Use CLI argument `--from` for now. If this becomes annoying, we can add the column in a future iteration.

- **Specialized Pali Provider**:
    - *Pros*: Custom logic for Pali.
    - *Cons*: Duplication of AI logic.
    - *Decision*: Rejected. Enhance `AiSdkTranslationProvider` to be more dynamic.
