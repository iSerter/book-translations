import test from 'node:test';
import assert from 'node:assert/strict';
import { openDatabase } from '../../../src/db/connection.js';
import { applyMigrations } from '../../../src/db/migrate.js';
import { translateVerses } from '../../../src/services/translation_service.js';
import { translationProviderRegistry, TranslationProvider } from '../../../src/providers/provider_registry.js';
import { upsertBook, upsertChapter, upsertVerse } from '../../../src/db/repositories/books.js';

class MockSourceAwareProvider implements TranslationProvider {
    lastSourceLanguage?: string;
    
    async translateBatch(texts: string[], target: string, source?: string) {
        this.lastSourceLanguage = source;
        return texts.map(t => `[${target}] ${t}`);
    }
}

test('TranslationService with sourceLanguage', async (t) => {
    const db = openDatabase(':memory:');
    applyMigrations(db);
    
    const mockProvider = new MockSourceAwareProvider();
    try {
        translationProviderRegistry.register("mock-source", mockProvider);
    } catch (e) {
        // Ignore duplicate registration
    }

    // Setup data
    const book = upsertBook(db, { slug: 'test', title: 'Test Book' });
    const chapter = upsertChapter(db, { bookId: book.id, number: 1, title: 'C1' });
    upsertVerse(db, { chapterId: chapter.id, number: 1, sourceText: 'Pali text' });

    await t.test('should propagate sourceLanguage to provider', async () => {
        await translateVerses(db, {
            bookSlug: 'test',
            chapterNumber: 1,
            verseNumbers: [1],
            targetLanguage: 'en',
            providerName: 'mock-source',
            sourceLanguage: 'pali' 
        });

        assert.equal(mockProvider.lastSourceLanguage, 'pali');
    });
});
