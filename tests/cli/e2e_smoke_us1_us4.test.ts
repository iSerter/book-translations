import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawnCli } from "../helpers/spawn_cli.js";
import { createTempDb } from "../helpers/tmp_db.js";

test("E2E Smoke: US1 -> US4", async (t) => {
  const { db, filePath, cleanup } = createTempDb();
  t.after(cleanup);

  // 1. Store Book
  const bookFixture = path.resolve("tests/fixtures/us1_book_small.json");
  // Ensure fixture exists (created in US1)
  if (!fs.existsSync(bookFixture)) {
      throw new Error("Fixture missing: " + bookFixture);
  }
  
  await spawnCli(["book", "store", "--file", bookFixture, "--db", filePath, "--json"]);

  // 2. Add Template
  const tmplPath = path.resolve("tests/fixtures/simple_template.md");
  fs.writeFileSync(tmplPath, "START:{{startVerse}} COUNT:{{count}}");
  
  await spawnCli(["template", "add", "--name", "simple", "--file", tmplPath, "--db", filePath, "--json"]);

  // 3. Generate Chapter (US2)
  // Book slug from fixture: 'the-little-schemer', chapter 1, expected 10 (fixture)
  // We use 5 here
  await spawnCli([
      "chapter", "generate",
      "--book", "the-little-schemer",
      "--chapter", "1",
      "--expected-verses", "5",
      "--template", "simple",
      "--provider", "fake",
      "--db", filePath,
      "--json"
  ]);

  // 4. Translate Verse (US3)
  // Verse 1 should exist (Fake provider returns 1..5)
  await spawnCli([
      "verse", "translate",
      "--book", "the-little-schemer",
      "--chapter", "1",
      "--verses", "1",
      "--to", "fr",
      "--provider", "fake",
      "--db", filePath,
      "--json"
  ]);

  // 5. Get Translations (US4)
  const result = await spawnCli([
      "translations", "get",
      "--book", "the-little-schemer",
      "--chapter", "1",
      "--verse", "1",
      "--db", filePath,
      "--json"
  ]);

  assert.equal(result.exitCode, 0);
  const json = JSON.parse(result.stdout);
  assert.equal(json.data.length, 1);
  assert.equal(json.data[0].languageCode, "fr");
  // Fake translation: "[fr] Fake verse 1"
  assert.match(json.data[0].text, /\[fr\]/);
  
  // Cleanup temp file
  fs.rmSync(tmplPath);
});
