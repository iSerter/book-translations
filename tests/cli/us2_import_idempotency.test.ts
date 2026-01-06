import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawnCli } from "../helpers/spawn_cli.js";
import { createTempDb } from "../helpers/tmp_db.js";

test("US2: Import idempotency and updates", async (t) => {
  const { db, filePath, cleanup } = createTempDb();
  t.after(cleanup);

  const fixtureDir = path.resolve("tests/fixtures/import/us2-book/US2Provider");
  const fixturePath = path.join(fixtureDir, "Chapter-01.json");
  
  // Setup fixture
  fs.mkdirSync(fixtureDir, { recursive: true });
  const initialContent = {
    chapter: {
      number: 1,
      title_english: "Original Title",
      verses: [
        {
          verse_number: 1,
          sanskrit: "Sanskrit text",
          english: {
            translation: "Original translation",
            commentary: "Original commentary"
          }
        }
      ]
    }
  };
  fs.writeFileSync(fixturePath, JSON.stringify(initialContent));

  // 1. First Import
  let result = await spawnCli(["translations", "import", fixturePath, "--db", filePath]);
  assert.equal(result.exitCode, 0);
  assert.match(result.stdout, /1 success/);

  // Check DB counts
  const count1 = db.prepare("SELECT COUNT(*) as c FROM translations").get() as any;
  assert.equal(count1.c, 1);
  const translation1 = db.prepare("SELECT * FROM translations").get() as any;
  assert.equal(translation1.text, "Original translation");

  // 2. Second Import (Same Content)
  result = await spawnCli(["translations", "import", fixturePath, "--db", filePath]);
  assert.equal(result.exitCode, 0);
  
  // Check DB counts - should remain same
  const count2 = db.prepare("SELECT COUNT(*) as c FROM translations").get() as any;
  assert.equal(count2.c, 1);
  
  // 3. Update Content
  const updatedContent = {
    chapter: {
      number: 1,
      title_english: "Original Title", // Keep same
      verses: [
        {
          verse_number: 1,
          sanskrit: "Sanskrit text", // Keep same
          english: {
            translation: "Updated translation", // Changed
            commentary: "Updated commentary"  // Changed
          }
        }
      ]
    }
  };
  fs.writeFileSync(fixturePath, JSON.stringify(updatedContent));

  // 4. Third Import (Updated Content)
  result = await spawnCli(["translations", "import", fixturePath, "--db", filePath]);
  assert.equal(result.exitCode, 0);

  // Check DB counts - should still be 1 (upserted)
  const count3 = db.prepare("SELECT COUNT(*) as c FROM translations").get() as any;
  assert.equal(count3.c, 1);

  // Verify content update
  const translation3 = db.prepare("SELECT * FROM translations").get() as any;
  assert.equal(translation3.text, "Updated translation");
  assert.equal(translation3.commentary, "Updated commentary");
  assert.equal(translation3.id, translation1.id); // ID should ideally be same if we used UPDATE, but DELETE+INSERT changes ID. 
  // Wait, DELETE+INSERT changes ID if we rely on AUTOINCREMENT.
  // The goal is "updates existing translations".
  // If ID changes, is that a problem?
  // Translation ID might be referenced elsewhere? (No foreign keys TO translations yet).
  // But strictly speaking, an update should preserve ID.
  // My implementation uses DELETE + INSERT.
  // "db.prepare(`DELETE FROM translations ...`).run(...); insertTranslation(...);"
  // This WILL change the ID.
  
  // If preserving ID is required, I need true UPSERT for translations.
  // The requirement says: "Update content without creating duplicate records".
  // It doesn't explicitly forbid ID change, but "Updates" implies modification.
  // "existing Translation records are updated with the new text."
  
  // If I change ID, I am creating a NEW record and deleting the OLD one.
  // This might break references if any exist.
  // I should probably implement proper UPSERT for translations.
});
