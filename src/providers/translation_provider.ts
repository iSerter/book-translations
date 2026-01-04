export interface TranslationProvider {
    translateBatch(texts: string[], targetLanguage: string): Promise<string[]>;
}
