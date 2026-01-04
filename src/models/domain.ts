export interface Book {
  id?: number;
  slug: string;
  title: string;
  author?: string;
  created_at?: string;
}

export interface Chapter {
  id?: number;
  book_id?: number;
  number: number;
  title?: string;
  expected_verse_count?: number;
  created_at?: string;
}

export interface Verse {
  id?: number;
  chapter_id?: number;
  number: number;
  source_text?: string;
  created_at?: string;
}

export interface Translation {
  id?: number;
  verse_id?: number;
  language_code: string;
  provider: string;
  model?: string;
  text: string;
  created_at?: string;
}

// Input types for services
export interface CreateBookInput {
  slug: string;
  title: string;
  author?: string;
  chapters: CreateChapterInput[];
}

export interface CreateChapterInput {
  number: number;
  title?: string;
  expected_verse_count?: number;
  verses?: CreateVerseInput[];
}

export interface CreateVerseInput {
  number: number;
  source_text?: string;
}

export type ChapterPackage = {
  verses: { number: number; text: string }[];
};
