import * as deepl from "deepl-node";
import type { TranslationProvider } from "./translation_provider.js";
import { AppError, ExitCode } from "../lib/errors.js";

export class DeepLTranslationProvider implements TranslationProvider {
    private translator: deepl.Translator;

    constructor(apiKey?: string) {
        const key = apiKey || process.env.DEEPL_API_KEY;
        if (!key) {
            // We only throw if instantiated. Registration might happen without key, 
            // but usually we instantiate on registration.
            // If key missing, we can't usage it.
            // However, for testing environment where we might not have key, maybe we shouldn't throw 
            // until method call? 
            // But 'new DeepLTranslationProvider()' is called in registerProviders().
            // So if I run tests without DEEPL_API_KEY, it might crash?
            // Yes.
            // So `registerProviders` should only register if key exists?
            // Or `constructor` should handle it gracefully?
            // `new deepl.Translator(key)` throws if key is empty.
            // I'll let it throw, but handle in registerProviders.
            throw new AppError("DEEPL_API_KEY is required for DeepL provider", { code: ExitCode.Config });
        }
        this.translator = new deepl.Translator(key);
    }

    async translateBatch(texts: string[], targetLanguage: string): Promise<string[]> {
        try {
            let target = targetLanguage as deepl.TargetLanguageCode;
            if (targetLanguage.toLowerCase() === "en") target = "en-US";

            const results = await this.translator.translateText(texts, null, target);
            const array = Array.isArray(results) ? results : [results];
            return array.map(r => r.text);
        } catch (error) {
            throw new AppError("DeepL translation failed", { code: ExitCode.Provider, cause: error });
        }
    }
}
