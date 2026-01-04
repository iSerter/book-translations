import type { Database } from "better-sqlite3";
import { 
    createGenerationRun, 
    updateGenerationRun, 
    getLatestGenerationRun,
    type GenerationRunRecord,
    type CreateGenerationRunInput
} from "../db/repositories/generation_runs.js";

export function startRun(db: Database, input: CreateGenerationRunInput): GenerationRunRecord {
    return createGenerationRun(db, {
        ...input,
        status: "in_progress"
    });
}

export function completeRun(db: Database, id: number, lastVerse: number): GenerationRunRecord {
    return updateGenerationRun(db, id, {
        status: "complete",
        lastCompletedVerse: lastVerse,
        completedAt: new Date().toISOString()
    });
}

export function failRun(db: Database, id: number, error: string): GenerationRunRecord {
    return updateGenerationRun(db, id, {
        status: "failed",
        validationError: error,
        completedAt: new Date().toISOString()
    });
}

export function updateProgress(db: Database, id: number, lastVerse: number): GenerationRunRecord {
    return updateGenerationRun(db, id, {
        lastCompletedVerse: lastVerse
    });
}

export function getLatestRun(db: Database, bookId: number, chapterNumber: number): GenerationRunRecord | undefined {
    return getLatestGenerationRun(db, bookId, chapterNumber);
}
