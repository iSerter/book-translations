import type { ChapterPackage } from "../models/domain.js";

export type GenerationOptions = {
    prompt: string;
    model?: string;
};

export interface GenerationProvider {
    generateChapter(options: GenerationOptions): Promise<ChapterPackage>;
}
