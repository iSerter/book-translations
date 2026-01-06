import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { spawnCli } from "../../helpers/spawn_cli.js";
import { createTempDb } from "../../helpers/tmp_db.js";

test("CLI: Book Export - Full Book", async (t) => {
  const { db, filePath: dbPath, cleanup } = createTempDb({ migrate: true });
  t.after(cleanup);

  const tmpOutDir = await fs.mkdtemp(path.join(os.tmpdir(), "export-full-test-"));
  t.after(async () => fs.rm(tmpOutDir, { recursive: true, force: true }));

  // 1. Store a book
  const bookData = {
    slug: "test-export-book",
    title: "Test Export Book",
    author: "Test Author",
    chapters: [
      {
        number: 1,
        expectedVerseCount: 1,
        verses: [
          { number: 1, sourceText: "Verse 1 Source" }
        ]
      }
    ]
  };
  
  const bookJsonPath = path.join(tmpOutDir, "book.json");
  await fs.writeFile(bookJsonPath, JSON.stringify(bookData));

  const storeResult = await spawnCli(["book", "store", "--file", bookJsonPath, "--db", dbPath]);
  assert.equal(storeResult.exitCode, 0, `Store failed: ${storeResult.stderr}`);

  // 2. Run export
  // Use env var for DB path to ensure it's picked up by loadConfig even if CLI arg parsing has issues
  const exportResult = await spawnCli(["book", "export", "test-export-book", "--output", tmpOutDir], {
      env: { APP_DB_PATH: dbPath }
  });
  if (exportResult.exitCode !== 0) {
    console.log("Export Stdout:", exportResult.stdout);
    console.log("Export Stderr:", exportResult.stderr);
  }
  assert.equal(exportResult.exitCode, 0, `Export failed`);

  // 3. Verify files
  const expectedFiles = [
    "test-export-book.json",
    "test-export-book.md",
    "test-export-book.docx"
  ];

  for (const file of expectedFiles) {
    const p = path.join(tmpOutDir, file);
    const exists = await fs.stat(p).then(() => true).catch(() => false);
    assert.ok(exists, `File ${file} should exist`);
  }
});
