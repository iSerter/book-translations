import type { Database as BetterSqlite3Database } from "better-sqlite3";
import { AppError, ExitCode } from "../../lib/errors.js";

export type BookRecord = {
  id: number;
  slug: string;
  title: string;
  author: string | null;
  createdAt: string;
};

export type ChapterRecord = {
  id: number;
  bookId: number;
  number: number;
  expectedVerseCount: number | null;
  createdAt: string;
};

export type VerseRecord = {
  id: number;
  chapterId: number;
  number: number;
  sourceText: string | null;
  createdAt: string;
};

export type UpsertBookInput = {
  slug: string;
  title: string;
  author?: string | null;
};

export type UpsertChapterInput = {
  bookId: number;
  number: number;
  expectedVerseCount?: number | null;
};

export type UpsertVerseInput = {
  chapterId: number;
  number: number;
  sourceText?: string | null;
};

export function upsertBook(db: BetterSqlite3Database, input: UpsertBookInput): BookRecord {
  db.prepare(`
    INSERT INTO books (slug, title, author)
    VALUES (@slug, @title, @author)
    ON CONFLICT(slug) DO UPDATE SET
      title = excluded.title,
      author = excluded.author
  `).run({ slug: input.slug, title: input.title, author: input.author ?? null });

  const row = db
    .prepare(
      `SELECT id, slug, title, author, created_at as createdAt FROM books WHERE slug = @slug`,
    )
    .get({ slug: input.slug });

  if (!row) {
    throw new AppError("Failed to upsert book", { code: ExitCode.Unknown });
  }
  return mapBook(row);
}

export function findBookBySlug(
  db: BetterSqlite3Database,
  slug: string,
): BookRecord | undefined {
  const row = db
    .prepare(`SELECT id, slug, title, author, created_at as createdAt FROM books WHERE slug = @slug`)
    .get({ slug });
  return row ? mapBook(row) : undefined;
}

export function findBookById(db: BetterSqlite3Database, id: number): BookRecord | undefined {
  const row = db
    .prepare(`SELECT id, slug, title, author, created_at as createdAt FROM books WHERE id = @id`)
    .get({ id });
  return row ? mapBook(row) : undefined;
}

export function listBooks(db: BetterSqlite3Database): BookRecord[] {
  const rows = db
    .prepare(`SELECT id, slug, title, author, created_at as createdAt FROM books ORDER BY id ASC`)
    .all();
  return rows.map(mapBook);
}

export function upsertChapter(db: BetterSqlite3Database, input: UpsertChapterInput): ChapterRecord {
  db.prepare(`
    INSERT INTO chapters (book_id, number, expected_verse_count)
    VALUES (@bookId, @number, @expectedVerseCount)
    ON CONFLICT(book_id, number) DO UPDATE SET
      expected_verse_count = excluded.expected_verse_count
  `).run({
    bookId: input.bookId,
    number: input.number,
    expectedVerseCount: input.expectedVerseCount ?? null,
  });

  const row = db
    .prepare(
      `SELECT id, book_id as bookId, number, expected_verse_count as expectedVerseCount, created_at as createdAt
       FROM chapters WHERE book_id = @bookId AND number = @number`,
    )
    .get({ bookId: input.bookId, number: input.number });

  if (!row) {
    throw new AppError("Failed to upsert chapter", { code: ExitCode.Unknown });
  }
  return mapChapter(row);
}

export function findChapter(
  db: BetterSqlite3Database,
  bookId: number,
  number: number,
): ChapterRecord | undefined {
  const row = db
    .prepare(
      `SELECT id, book_id as bookId, number, expected_verse_count as expectedVerseCount, created_at as createdAt
       FROM chapters WHERE book_id = @bookId AND number = @number`,
    )
    .get({ bookId, number });
  return row ? mapChapter(row) : undefined;
}

export function listChaptersForBook(db: BetterSqlite3Database, bookId: number): ChapterRecord[] {
  const rows = db
    .prepare(
      `SELECT id, book_id as bookId, number, expected_verse_count as expectedVerseCount, created_at as createdAt
       FROM chapters WHERE book_id = @bookId ORDER BY number ASC`,
    )
    .all({ bookId });
  return rows.map(mapChapter);
}

export function upsertVerse(db: BetterSqlite3Database, input: UpsertVerseInput): VerseRecord {
  db.prepare(`
    INSERT INTO verses (chapter_id, number, source_text)
    VALUES (@chapterId, @number, @sourceText)
    ON CONFLICT(chapter_id, number) DO UPDATE SET
      source_text = excluded.source_text
  `).run({
    chapterId: input.chapterId,
    number: input.number,
    sourceText: input.sourceText ?? null,
  });

  const row = db
    .prepare(
      `SELECT id, chapter_id as chapterId, number, source_text as sourceText, created_at as createdAt
       FROM verses WHERE chapter_id = @chapterId AND number = @number`,
    )
    .get({ chapterId: input.chapterId, number: input.number });

  if (!row) {
    throw new AppError("Failed to upsert verse", { code: ExitCode.Unknown });
  }
  return mapVerse(row);
}

export function findVerse(
  db: BetterSqlite3Database,
  chapterId: number,
  number: number,
): VerseRecord | undefined {
  const row = db
    .prepare(
      `SELECT id, chapter_id as chapterId, number, source_text as sourceText, created_at as createdAt
       FROM verses WHERE chapter_id = @chapterId AND number = @number`,
    )
    .get({ chapterId, number });
  return row ? mapVerse(row) : undefined;
}

export function listVersesForChapter(db: BetterSqlite3Database, chapterId: number): VerseRecord[] {
  const rows = db
    .prepare(
      `SELECT id, chapter_id as chapterId, number, source_text as sourceText, created_at as createdAt
       FROM verses WHERE chapter_id = @chapterId ORDER BY number ASC`,
    )
    .all({ chapterId });
  return rows.map(mapVerse);
}

function mapBook(row: any): BookRecord {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    author: row.author ?? null,
    createdAt: row.createdAt,
  };
}

function mapChapter(row: any): ChapterRecord {
  return {
    id: row.id,
    bookId: row.bookId,
    number: row.number,
    expectedVerseCount: row.expectedVerseCount ?? null,
    createdAt: row.createdAt,
  };
}

function mapVerse(row: any): VerseRecord {
  return {
    id: row.id,
    chapterId: row.chapterId,
    number: row.number,
    sourceText: row.sourceText ?? null,
    createdAt: row.createdAt,
  };
}
