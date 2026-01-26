export interface ExportOptions {
  bookSlug: string;
  chapterNumber?: number; // Optional: specific chapter
  formats: ('json' | 'md' | 'docx' | 'pali-scripture')[];
  languages?: string[]; // Optional: specific languages (e.g. ['en', 'es'])
  provider?: string;    // Optional: specific provider (e.g. 'Sonnet-4.5')
  outputDir: string;
  includeSource?: boolean;
  allowFallback?: boolean;
  includeVerseNumbers?: boolean;
}

export interface ExportTranslation {
  languageCode: string;
  text: string;
  provider: string; // To distinguish if multiple exist
}

export interface ExportVerse {
  number: number;
  sourceText: string; // The original text
  translations: ExportTranslation[];
}

export interface ExportChapter {
  number: number;
  title?: string;
  verses: ExportVerse[];
}

export interface ExportData {
  book: {
    title: string;
    slug: string;
    author?: string;
  };
  chapters: ExportChapter[];
}
