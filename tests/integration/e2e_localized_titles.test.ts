import assert from "node:assert/strict";
import test from "node:test";
import path from "node:path";
import fs from "node:fs";

import { importFile } from "../../src/services/import_service.js";
import { translateChapterTitles } from "../../src/services/translation_service.ts";
import { ExportService } from "../../src/services/export_service.js";
import { MarkdownExporter } from "../../src/services/exporters/markdown_exporter.js";
import { createTempDb } from "../helpers/tmp_db.js";
import { translationProviderRegistry } from "../../src/providers/provider_registry.js";
import { FakeTranslationProvider } from "../../src/providers/fake_translation_provider.js";

test("E2E smoke test for localized chapter titles", async () => {
  const { db, cleanup } = createTempDb();
  try {
    // 1. Setup provider
    if (!translationProviderRegistry.has("fake")) {
        translationProviderRegistry.register("fake", new FakeTranslationProvider());
    }

    // 2. Import a fixture that has title_english but NO title_turkish
    // We'll create a temporary fixture for this
    const fixturePath = path.resolve("tests/fixtures/import/e2e_chapter.json");
    const fixtureData = {
        chapter: {
            number: 10,
            title_english: "Divine Glories",
            total_verses: 1,
            verses: [{ verse_number: 1, sanskrit: "S1", english: { translation: "E1" } }]
        }
    };
    fs.mkdirSync(path.dirname(fixturePath), { recursive: true });
    fs.writeFileSync(fixturePath, JSON.stringify(fixtureData));

    importFile(db, fixturePath, {
        bookSlug: "e2e-book",
        provider: "test-import"
    });

    // 3. Translate titles to Turkish
    await translateChapterTitles(db, {
        bookSlug: "e2e-book",
        chapterNumbers: [10],
        targetLanguage: "tr",
        providerName: "fake",
        model: "fake-model"
    });

    // 4. Export to Markdown
    const outputDir = fs.mkdtempSync(path.join(fs.realpathSync(process.env.TEMP || "/tmp"), "e2e-export-"));
    const exportService = new ExportService(db);
    const exporter = new MarkdownExporter();

    await exportService.exportBook({
        bookSlug: "e2e-book",
        languages: ["tr"],
        provider: "fake",
        outputDir: outputDir,
        formats: ["md"],
        allowFallback: true
    }, [exporter]);

    // 5. Verify the markdown content
    const outputPath = path.join(outputDir, "e2e-book.md");
    const content = fs.readFileSync(outputPath, "utf-8");

    assert.ok(content.includes("## Chapter 10: [tr] Divine Glories"), "Markdown should contain translated title");
    
    // Cleanup temp export
    fs.rmSync(outputDir, { recursive: true, force: true });
    fs.unlinkSync(fixturePath);

  } finally {
    cleanup();
  }
});
