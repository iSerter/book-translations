import test from "node:test";
import assert from "node:assert/strict";
import { createTempDb } from "../helpers/tmp_db.js";
import { storeBook } from "../../src/services/book_service.js";

test("Perf: Bulk insert smoke test (100 chapters, 1000 verses)", (t) => {
  const { db, cleanup } = createTempDb();
  t.after(cleanup);

  const chapters = [];
  for (let i = 1; i <= 100; i++) {
      const verses = [];
      for (let j = 1; j <= 10; j++) {
          verses.push({ number: j, source_text: `Verse content ${j}` });
      }
      chapters.push({
          number: i,
          expected_verse_count: 10,
          verses: verses
      });
  }

  const input = {
      slug: "perf-book",
      title: "Perf Book",
      chapters: chapters
  };

  const start = performance.now();
  storeBook(db, input);
  const end = performance.now();
  const duration = end - start;

  console.log(`Bulk insert took ${duration.toFixed(2)}ms`);
  assert.ok(duration < 2000, `Bulk insert too slow: ${duration}ms > 2000ms`);

  const count = db.prepare("SELECT COUNT(*) as c FROM verses").get() as any;
  assert.equal(count.c, 1000);
});
