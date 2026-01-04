import type { GenerationProvider, GenerationOptions } from "./generation_provider.js";
import type { ChapterPackage } from "../models/domain.js";

export class FakeGenerationProvider implements GenerationProvider {
    async generateChapter(options: GenerationOptions): Promise<ChapterPackage> {
        // Simple logic: check if prompt requests specific range
        // Format: "START:(\d+) COUNT:(\d+)"
        const startMatch = options.prompt.match(/START:(\d+)/);
        const countMatch = options.prompt.match(/COUNT:(\d+)/);
        
        const start = startMatch ? parseInt(startMatch[1], 10) : 1;
        const count = countMatch ? parseInt(countMatch[1], 10) : 5; // Default 5 verses
        
        const verses = [];
        for (let i = 0; i < count; i++) {
            verses.push({
                number: start + i,
                text: `Fake verse ${start + i}`
            });
        }
        
        return { verses };
    }
}
