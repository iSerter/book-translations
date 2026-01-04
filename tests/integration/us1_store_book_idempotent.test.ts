import test from "node:test";
import assert from "node:assert/strict";
import { createTempDb } from "../helpers/tmp_db.js";
import { storeBook } from "../../src/services/book_service.js";
import type { CreateBookInput } from "../../src/models/domain.js";

test("US1: storeBook should be idempotent", (t) => {
  const { db, cleanup } = createTempDb();
  t.after(cleanup);

  const bookInput: CreateBookInput = {
    slug: "idempotent-book",
    title: "Idempotent Book",
    author: "Tester",
    chapters: [
      { number: 1, title: "Chapter 1", expected_verse_count: 10 },
      { number: 2, title: "Chapter 2", expected_verse_count: 5 },
    ],
  };

  // First insert
  storeBook(db, bookInput);

  const books = db.prepare("SELECT * FROM books WHERE slug = ?").all("idempotent-book");
  assert.equal(books.length, 1);
  const bookId = (books[0] as any).id;

  const chapters = db.prepare("SELECT * FROM chapters WHERE book_id = ? ORDER BY number").all(bookId);
  assert.equal(chapters.length, 2);

  // Second insert (should not fail, should verify data matches)
  assert.doesNotThrow(() => {
    storeBook(db, bookInput);
  });

  // Verify no duplicates
  const booksAfter = db.prepare("SELECT * FROM books WHERE slug = ?").all("idempotent-book");
  assert.equal(booksAfter.length, 1);

  const chaptersAfter = db.prepare("SELECT * FROM chapters WHERE book_id = ? ORDER BY number").all(bookId);
  assert.equal(chaptersAfter.length, 2);
});
