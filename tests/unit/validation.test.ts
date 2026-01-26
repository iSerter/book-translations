import assert from 'node:assert/strict';
import test from 'node:test';
import { PaliScriptureSchema } from '../../src/lib/validation.js';

test('PaliScriptureSchema validation', async (t) => {
  await t.test('accepts valid Pali scripture JSON', () => {
    const validData = {
      format: 'pali-scripture',
      book: {
        slug: 'dhammapada',
        title: 'Dhammapada',
        author: 'Traditional',
        chapters: [
          {
            number: 1,
            title_pali: 'Yamaka Vagga',
            verses: [
              {
                number: 1,
                pali: 'Manopubbaṅgamā dhammā...'
              }
            ]
          }
        ]
      }
    };
    const result = PaliScriptureSchema.safeParse(validData);
    assert.ok(result.success);
  });

  await t.test('rejects invalid format', () => {
    const invalidData = {
      format: 'other-format',
      book: { slug: 'test', title: 'test', chapters: [] }
    };
    const result = PaliScriptureSchema.safeParse(invalidData);
    assert.ok(!result.success);
  });

  await t.test('rejects missing pali fields', () => {
    const invalidData = {
      format: 'pali-scripture',
      book: {
        slug: 'dhammapada',
        title: 'Dhammapada',
        chapters: [
          {
            number: 1,
            // title_pali missing
            verses: []
          }
        ]
      }
    };
    const result = PaliScriptureSchema.safeParse(invalidData);
    assert.ok(!result.success);
  });

  await t.test('rejects invalid verse structure', () => {
    const invalidData = {
      format: 'pali-scripture',
      book: {
        slug: 'dhammapada',
        title: 'Dhammapada',
        chapters: [
          {
            number: 1,
            title_pali: 'Title',
            verses: [
              {
                number: 1,
                // pali missing
                sanskrit: 'text'
              }
            ]
          }
        ]
      }
    };
    const result = PaliScriptureSchema.safeParse(invalidData);
    assert.ok(!result.success);
  });
});
