import test from "node:test";
import assert from "node:assert/strict";
import { validateChapterPackage } from "../../src/services/chapter_package_validator.js";

test("US2: validateChapterPackage", async (t) => {
  await t.test("accepts valid sequential package matching count", () => {
    const pkg = {
      verses: [
        { number: 1, text: "One" },
        { number: 2, text: "Two" },
        { number: 3, text: "Three" },
      ],
    };
    const result = validateChapterPackage(pkg, 3);
    assert.equal(result.isValid, true);
    assert.equal(result.error, undefined);
  });

  await t.test("rejects count mismatch", () => {
    const pkg = {
        verses: [
            { number: 1, text: "One" },
        ]
    };
    const result = validateChapterPackage(pkg, 2);
    assert.equal(result.isValid, false);
    assert.match(result.error!, /count mismatch/i);
  });

  await t.test("rejects gaps in numbering", () => {
    const pkg = {
        verses: [
            { number: 1, text: "One" },
            { number: 3, text: "Three" },
        ]
    };
    const result = validateChapterPackage(pkg); // count optional or implied max?
    // If expectedCount not provided, maybe it just checks sequence?
    assert.equal(result.isValid, false);
    assert.match(result.error!, /non-sequential/i);
  });

  await t.test("rejects starting from non-1 (unless partial? spec says chapter package 1..N)", () => {
     // The goal is "Generate and store a chapter package (verses 1..N)"
     // So it should start at 1.
     const pkg = {
         verses: [
             { number: 2, text: "Two" },
         ]
     };
     const result = validateChapterPackage(pkg);
     assert.equal(result.isValid, false);
     assert.match(result.error!, /must start with verse 1/i);
  });
});
