import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { openDatabase } from '../../src/db/connection.js';
import { applyMigrations } from '../../src/db/migrate.js';
import { importFile } from '../../src/services/import_service.js';
import { ExportService } from '../../src/services/export_service.js';
// @ts-ignore - will be created in T016
import { PaliScriptureExporter } from '../../src/services/exporters/pali_scripture_exporter.js';

test('Pali Import/Export Integration', async (t) => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pali-test-'));
    const db = openDatabase(':memory:');
    applyMigrations(db);

    t.after(async () => {
        await fs.rm(tmpDir, { recursive: true, force: true });
    });

    const paliData = {
        format: "pali-scripture",
        book: {
            slug: "dhammapada",
            title: "Dhammapada",
            chapters: [
                {
                    number: 1,
                    title_pali: "Yamaka Vagga",
                    verses: [
                        {
                            number: 1,
                            pali: "Manopubbaṅgamā dhammā..."
                        }
                    ]
                }
            ]
        }
    };

    const filePath = path.join(tmpDir, 'dhammapada_input.json');
    await fs.writeFile(filePath, JSON.stringify(paliData));

    await t.test('should import pali-scripture format', async () => {
        const result = importFile(db, filePath, { bookSlug: 'dhammapada' });
        assert.ok(result.success, result.errors.join(', '));
        assert.equal(result.count.verses, 1);

        const chapter = db.prepare("SELECT title FROM chapters WHERE number = 1").get() as any;
        assert.equal(chapter.title, "Yamaka Vagga");

        const verse = db.prepare("SELECT source_text FROM verses WHERE number = 1").get() as any;
        assert.equal(verse.source_text, "Manopubbaṅgamā dhammā...");
    });

    await t.test('should export back to pali-scripture format', async () => {
        const exporter = new PaliScriptureExporter();
        const exportService = new ExportService(db);
        
        const exportOptions = {
            bookSlug: 'dhammapada',
            outputDir: tmpDir,
            formats: ['pali-scripture']
        };

        await exportService.exportBook(exportOptions as any, [exporter]);

        // PaliScriptureExporter likely uses book slug as filename
        const exportedFile = path.join(tmpDir, 'dhammapada.json');
        const content = await fs.readFile(exportedFile, 'utf-8');
        const exportedData = JSON.parse(content);

        assert.equal(exportedData.format, "pali-scripture");
        assert.equal(exportedData.book.slug, "dhammapada");
        assert.equal(exportedData.book.chapters[0].title_pali, "Yamaka Vagga");
        assert.equal(exportedData.book.chapters[0].verses[0].pali, "Manopubbaṅgamā dhammā...");
    });
});
