import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { WordExporter } from '../../../../src/services/exporters/word_exporter.js';
import { ExportData, ExportOptions } from '../../../../src/services/exporters/types.js';

test('WordExporter', async (t) => {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'docx-export-test-'));
  
  t.after(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  await t.test('should export data to a DOCX file', async () => {
    const exporter = new WordExporter();
    const data: ExportData = {
      book: { title: 'Test Book', slug: 'test-book', author: 'Tester' },
      chapters: [
        {
          number: 1,
          verses: [
            {
              number: 1,
              sourceText: 'Source text',
              translations: [{ languageCode: 'en', text: 'Translated text', provider: 'test' }]
            }
          ]
        }
      ]
    };
    const options: ExportOptions = {
      bookSlug: 'test-book',
      formats: ['docx'],
      outputDir: tmpDir
    };

    await exporter.export(data, options);

    const expectedFilePath = path.join(tmpDir, 'test-book.docx');
    const stats = await fs.stat(expectedFilePath);
    assert.ok(stats.isFile(), 'Output file should exist');
    assert.ok(stats.size > 0, 'Output file should not be empty');
  });
});
