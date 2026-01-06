import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { spawnCli } from "../../helpers/spawn_cli.js";
import { createTempDb } from "../../helpers/tmp_db.js";

test("CLI: Book Export - Specific Formats", async (t) => {
  const { filePath: dbPath, cleanup } = createTempDb({ migrate: true });
  t.after(cleanup);

  const tmpOutDir = await fs.mkdtemp(path.join(os.tmpdir(), "export-formats-test-"));
  t.after(async () => fs.rm(tmpOutDir, { recursive: true, force: true }));

  // 1. Store a book
  const bookData = {
    slug: "test-fmt-book",
    title: "Test Fmt Book",
    author: "Test Author",
    chapters: [{ number: 1, verses: [{ number: 1, sourceText: "Src" }] }]
  };
  const bookJsonPath = path.join(tmpOutDir, "book.json");
  await fs.writeFile(bookJsonPath, JSON.stringify(bookData));
  await spawnCli(["book", "store", "--file", bookJsonPath, "--db", dbPath]);

  // 2. Export only JSON
  const result = await spawnCli(["book", "export", "test-fmt-book", "--format", "json", "--output", tmpOutDir], {
      env: { APP_DB_PATH: dbPath }
  });
  assert.equal(result.exitCode, 0, result.stderr);

  // 3. Verify files
  const jsonExists = await fs.stat(path.join(tmpOutDir, "test-fmt-book.json")).then(() => true).catch(() => false);
  const mdExists = await fs.stat(path.join(tmpOutDir, "test-fmt-book.md")).then(() => true).catch(() => false);
  const docxExists = await fs.stat(path.join(tmpOutDir, "test-fmt-book.docx")).then(() => true).catch(() => false);

  assert.ok(jsonExists, "JSON file should exist");
  assert.equal(mdExists, false, "MD file should NOT exist");
  assert.equal(docxExists, false, "DOCX file should NOT exist");
});
