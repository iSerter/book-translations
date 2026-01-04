import type { ChapterPackage } from "../models/domain.js";

export type GenerationOptions = {
    prompt: string;
    model?: string;
    format?: string;
};

export interface GenerationProvider {
    generateChapter(options: GenerationOptions): Promise<ChapterPackage>;
}
