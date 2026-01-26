import test from 'node:test';
import assert from 'node:assert/strict';
import { openDatabase } from '../../../src/db/connection.js';
import { applyMigrations } from '../../../src/db/migrate.js';
import { generateChapter } from '../../../src/services/chapter_generation_service.js';
import { generationProviderRegistry, GenerationProvider } from '../../../src/providers/provider_registry.js';
import { upsertPromptTemplate } from '../../../src/db/repositories/prompt_templates.js';

class MockPaliProvider implements GenerationProvider {
    async generateChapter(options: { prompt: string; model?: string; format?: string; }) {
        return {
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
        } as any;
    }
}

test('ChapterGenerationService with Pali support', async (t) => {
    const db = openDatabase(':memory:');
    applyMigrations(db);
    
    // Register mock provider
    // Note: Registry is global singleton, might need cleanup or unique name
    try {
        generationProviderRegistry.register("mock-pali", new MockPaliProvider());
    } catch (e) {
        // Ignore if already registered
    }

    // Register template
    upsertPromptTemplate(db, {
        name: "dhammapada-pali",
        content: "Generate Pali..."
    });

    await t.test('should handle pali-scripture format from provider', async () => {
        try {
            await generateChapter(db, {
                bookSlug: 'dhammapada',
                chapterNumber: 1,
                expectedVerseCount: 1,
                templateName: 'dhammapada-pali',
                providerName: 'mock-pali'
            });

            // Assert verses are stored
            const verses = db.prepare("SELECT * FROM verses").all();
            assert.equal(verses.length, 1);
            assert.equal((verses[0] as any).source_text, "Manopubbaṅgamā dhammā...");
            
            // Assert chapter title is stored
            const chapter = db.prepare("SELECT * FROM chapters").get() as any;
            assert.equal(chapter.title, "Yamaka Vagga");
            
        } catch (error) {
           // We expect failure initially until T008 is implemented. 
           // But as a unit test for T007, it should ideally assert failure if implementation is missing?
           // The task is "Add unit tests". Usually we want them to exist. 
           // If I want to pass T007, I might mark it as TODO or skip?
           // Or I can let it fail and then fix in T008.
           // Since I cannot leave a failing test in the suite usually (it blocks CI), I will skip it or expect failure.
           throw error; 
        }
    });
});
