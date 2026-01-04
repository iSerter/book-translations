import type { ChapterPackage } from "../models/domain.js";

export function validateChapterPackage(
  pkg: ChapterPackage,
  expectedCount?: number,
  startVerse: number = 1
): { isValid: boolean; error?: string } {
  if (!pkg.verses || pkg.verses.length === 0) {
      return { isValid: false, error: "Package is empty" };
  }

  // Sort verses by number just in case
  const verses = [...pkg.verses].sort((a, b) => a.number - b.number);

  // Check start with startVerse
  if (verses[0].number !== startVerse) {
      return { isValid: false, error: `Must start with verse ${startVerse}` };
  }

  // Check sequential
  for (let i = 0; i < verses.length; i++) {
      if (verses[i].number !== startVerse + i) {
          return { isValid: false, error: `Non-sequential verses: expected ${startVerse + i}, got ${verses[i].number}` };
      }
  }

  // Check count
  if (expectedCount !== undefined && verses.length !== expectedCount) {
      return { isValid: false, error: `Count mismatch: expected ${expectedCount}, got ${verses.length}` };
  }

  return { isValid: true };
}