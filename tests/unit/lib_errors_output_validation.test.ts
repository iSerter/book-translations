import assert from "node:assert/strict";
import test from "node:test";
import { PassThrough } from "node:stream";

import { AppError, ExitCode, isAppError, toExitCode } from "../../src/lib/errors.js";
import { printError, printResult } from "../../src/lib/output.js";
import { requireLanguageCode, requirePositiveInt } from "../../src/lib/validation.js";

test("AppError identifies and maps exit codes", () => {
  const err = new AppError("boom", { code: ExitCode.Validation });
  assert.equal(isAppError(err), true);
  assert.equal(toExitCode(err), ExitCode.Validation);
  assert.equal(toExitCode(new Error("other")), ExitCode.Unknown);
});

test("requirePositiveInt passes valid integers and rejects invalid", () => {
  assert.equal(requirePositiveInt(3, "chapter"), 3);
  assert.throws(() => requirePositiveInt(0, "chapter"), /positive integer/);
  assert.throws(() => requirePositiveInt(2.5, "chapter"), /positive integer/);
});

test("requireLanguageCode normalizes and validates", () => {
  assert.equal(requireLanguageCode("EN"), "en");
  assert.throws(() => requireLanguageCode("e"), /2-5 letters/);
  assert.throws(() => requireLanguageCode(123 as unknown as string), /must be a string/);
});

test("printResult outputs JSON or text", () => {
  const stdout = new PassThrough();
  const textOut = new PassThrough();
  printResult({ ok: true }, "json", { stdout, stderr: process.stderr });
  printResult("hello", "text", { stdout: textOut, stderr: process.stderr });
  assert.equal(stdout.read()?.toString().trim(), "{\n  \"ok\": true\n}");
  assert.equal(textOut.read()?.toString().trim(), "hello");
});

test("printError formats errors and returns exit code", () => {
  const stdout = new PassThrough();
  const stderr = new PassThrough();
  const err = new AppError("nope", { code: ExitCode.Validation });
  const codeJson = printError(err, "json", { stdout, stderr });
  const parsed = JSON.parse(stdout.read()?.toString() ?? "{}") as { code: string };
  assert.equal(codeJson, ExitCode.Validation);
  assert.equal(parsed.code, "Validation");

  const stderrOut = new PassThrough();
  const codeText = printError(err, "text", { stdout: stdout, stderr: stderrOut });
  assert.equal(codeText, ExitCode.Validation);
  assert.match(stderrOut.read()?.toString() ?? "", /AppError: nope/);
});
