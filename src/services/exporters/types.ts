export interface ExportOptions {
  bookSlug: string;
  chapterNumber?: number; // Optional: specific chapter
  formats: ('json' | 'md' | 'docx')[];
  languages?: string[]; // Optional: specific languages (e.g. ['en', 'es'])
  outputDir: string;
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
