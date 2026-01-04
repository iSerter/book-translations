import test from "node:test";
import assert from "node:assert/strict";
import { spawnCli } from "../helpers/spawn_cli.js";
import { createTempDb } from "../helpers/tmp_db.js";
import { storeBook } from "../../src/services/book_service.js";

test("US4: Translations get missing verse", async (t) => {
  const { db, filePath, cleanup } = createTempDb();
  t.after(cleanup);

  storeBook(db, {
      slug: "gita",
      title: "Gita",
      chapters: [{ number: 1, expected_verse_count: 5 }]
  });

  const result = await spawnCli([
      "translations", "get",
      "--book", "gita",
      "--chapter", "1",
      "--verse", "99",
      "--db", filePath,
      "--json"
  ]);

  // We expect strict validation failure (Verse not found)
  assert.notEqual(result.exitCode, 0);
  assert.match(result.stdout, /Verse .* not found/);
});
