import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { MarkdownExporter } from '../../../../src/services/exporters/markdown_exporter.js';
import { ExportData, ExportOptions } from '../../../../src/services/exporters/types.js';

test('MarkdownExporter', async (t) => {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'md-export-test-'));
  
  t.after(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  await t.test('should export data to a Markdown file', async () => {
    const exporter = new MarkdownExporter();
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
      formats: ['md'],
      outputDir: tmpDir
    };

    await exporter.export(data, options);

    const expectedFilePath = path.join(tmpDir, 'test-book.md');
    const fileExists = await fs.stat(expectedFilePath).then(() => true).catch(() => false);
    assert.ok(fileExists, 'Output file should exist');

    const fileContent = await fs.readFile(expectedFilePath, 'utf-8');
    
    // Verify basic Markdown structure
    assert.match(fileContent, /# Test Book/);
    assert.match(fileContent, /## Chapter 1/);
    assert.match(fileContent, /### Verse 1/);
    assert.match(fileContent, /> Source text/);
    assert.match(fileContent, /\*\*en\*\*: Translated text/);
  });
});
