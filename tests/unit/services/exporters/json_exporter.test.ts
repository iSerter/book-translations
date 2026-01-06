import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { JsonExporter } from '../../../../src/services/exporters/json_exporter.js';
import { ExportData, ExportOptions } from '../../../../src/services/exporters/types.js';

test('JsonExporter', async (t) => {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'json-export-test-'));
  
  t.after(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  await t.test('should export data to a JSON file', async () => {
    const exporter = new JsonExporter();
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
      formats: ['json'],
      outputDir: tmpDir
    };

    await exporter.export(data, options);

    const expectedFilePath = path.join(tmpDir, 'test-book.json');
    const fileExists = await fs.stat(expectedFilePath).then(() => true).catch(() => false);
    assert.ok(fileExists, 'Output file should exist');

    const fileContent = await fs.readFile(expectedFilePath, 'utf-8');
    const json = JSON.parse(fileContent);

    assert.deepStrictEqual(json, data);
  });
});
