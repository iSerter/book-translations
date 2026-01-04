import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawnCli } from "../helpers/spawn_cli.js";
import { createTempDb } from "../helpers/tmp_db.js";

test("US1: CLI book store command", async (t) => {
  const { db, filePath, cleanup } = createTempDb();
  t.after(cleanup);

  const fixturePath = path.resolve("tests/fixtures/us1_book_small.json");
  
  // We need to ensure the fixture exists (created in previous step)
  assert.ok(fs.existsSync(fixturePath), "Fixture file must exist");

  const result = await spawnCli(
    ["book", "store", "--file", fixturePath, "--db", filePath, "--json"],
  );

  assert.equal(result.exitCode, 0, `CLI failed: ${result.stderr}`);
  
  const output = JSON.parse(result.stdout);
  assert.equal(output.success, true);
  assert.equal(output.data.slug, "the-little-schemer");

  // Verify DB
  const book = db.prepare("SELECT * FROM books WHERE slug = ?").get("the-little-schemer") as any;
  assert.ok(book);
  assert.equal(book.title, "The Little Schemer");

  const chapters = db.prepare("SELECT * FROM chapters WHERE book_id = ?").all(book.id);
  assert.equal(chapters.length, 2);
});
