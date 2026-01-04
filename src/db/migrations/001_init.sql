-- Books
CREATE TABLE books (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	slug TEXT NOT NULL UNIQUE,
	title TEXT NOT NULL,
	author TEXT,
	created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Chapters
CREATE TABLE chapters (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
	number INTEGER NOT NULL CHECK (number > 0),
	expected_verse_count INTEGER CHECK (expected_verse_count IS NULL OR expected_verse_count > 0),
	created_at TEXT NOT NULL DEFAULT (datetime('now')),
	UNIQUE (book_id, number)
);

CREATE INDEX idx_chapters_book_id ON chapters(book_id);

-- Verses
CREATE TABLE verses (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	chapter_id INTEGER NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
	number INTEGER NOT NULL CHECK (number > 0),
	source_text TEXT,
	created_at TEXT NOT NULL DEFAULT (datetime('now')),
	UNIQUE (chapter_id, number)
);

CREATE INDEX idx_verses_chapter_id ON verses(chapter_id);

-- Translations
CREATE TABLE translations (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	verse_id INTEGER NOT NULL REFERENCES verses(id) ON DELETE CASCADE,
	language_code TEXT NOT NULL,
	provider TEXT NOT NULL,
	model TEXT NOT NULL DEFAULT '',
	text TEXT NOT NULL,
	created_at TEXT NOT NULL DEFAULT (datetime('now')),
	UNIQUE (verse_id, language_code, provider, model)
);

CREATE INDEX idx_translations_verse_id ON translations(verse_id);

-- Prompt Templates
CREATE TABLE prompt_templates (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL UNIQUE,
	content TEXT NOT NULL,
	created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Generation Runs
CREATE TABLE generation_runs (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
	chapter_number INTEGER NOT NULL CHECK (chapter_number > 0),
	expected_verse_count INTEGER NOT NULL CHECK (expected_verse_count > 0),
	provider TEXT,
	model TEXT,
	status TEXT NOT NULL CHECK (status IN ('in_progress', 'complete', 'failed')),
	started_at TEXT NOT NULL DEFAULT (datetime('now')),
	completed_at TEXT,
	last_completed_verse INTEGER NOT NULL DEFAULT 0 CHECK (last_completed_verse >= 0),
	validation_error TEXT,
	UNIQUE (book_id, chapter_number, provider, model, started_at)
);

CREATE INDEX idx_generation_runs_book_chapter ON generation_runs(book_id, chapter_number);
