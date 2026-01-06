CREATE TABLE chapter_translations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chapter_id INTEGER NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
        language_code TEXT NOT NULL,
        provider TEXT NOT NULL,
        model TEXT NOT NULL DEFAULT '',
        title TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        UNIQUE (chapter_id, language_code, provider, model)
);

CREATE INDEX idx_chapter_translations_chapter_id ON chapter_translations(chapter_id);
