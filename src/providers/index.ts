import { generationProviderRegistry, translationProviderRegistry } from "./provider_registry.js";
import { FakeGenerationProvider } from "./fake_generation_provider.js";
import { AiSdkGenerationProvider } from "./ai_sdk_generation_provider.js";
import { FakeTranslationProvider } from "./fake_translation_provider.js";
import { DeepLTranslationProvider } from "./deepl_translation_provider.js";
import { AiSdkTranslationProvider } from "./ai_sdk_translation_provider.js";

export function registerProviders() {
    // Generation
    if (!generationProviderRegistry.has("fake")) {
        generationProviderRegistry.register("fake", new FakeGenerationProvider());
    }
    if (!generationProviderRegistry.has("ai-sdk")) {
        generationProviderRegistry.register("ai-sdk", new AiSdkGenerationProvider());
    }

    // Translation
    if (!translationProviderRegistry.has("fake")) {
        translationProviderRegistry.register("fake", new FakeTranslationProvider());
    }
    
    // AI SDK as translator
    if (!translationProviderRegistry.has("ai-sdk")) {
        translationProviderRegistry.register("ai-sdk", new AiSdkTranslationProvider());
    }

    // DeepL
    if (!translationProviderRegistry.has("deepl")) {
        try {
            translationProviderRegistry.register("deepl", new DeepLTranslationProvider());
        } catch (e) {
            // Ignore missing key
        }
    }
}
