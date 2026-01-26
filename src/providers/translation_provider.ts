export interface TranslationProvider {
    translateBatch(texts: string[], targetLanguage: string, sourceLanguage?: string): Promise<string[]>;
}
