import type { TranslationProvider } from "./translation_provider.js";

export class FakeTranslationProvider implements TranslationProvider {
    async translateBatch(texts: string[], targetLanguage: string): Promise<string[]> {
        if (texts.some(t => t.includes("FAIL"))) {
            throw new Error("Simulated provider failure");
        }
        return texts.map(text => `[${targetLanguage}] ${text}`);
    }
}
