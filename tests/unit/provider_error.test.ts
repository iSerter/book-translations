import assert from "node:assert/strict";
import test from "node:test";

import { normalizeProviderError } from "../../src/providers/provider_error.js";

test("normalizes HTTP status errors", () => {
  const rate = normalizeProviderError({ status: 429, message: "Too many" }, "fake");
  assert.equal(rate.kind, "rate_limit");
  assert.equal(rate.retryable, true);

  const invalid = normalizeProviderError({ status: 400, message: "bad" }, "fake");
  assert.equal(invalid.kind, "invalid_request");
  assert.equal(invalid.retryable, false);
});

test("detects network and timeout codes", () => {
  const timeout = normalizeProviderError({ code: "ETIMEOUT" }, "fake");
  assert.equal(timeout.kind, "timeout");
  assert.equal(timeout.retryable, true);

  const network = normalizeProviderError({ code: "ECONNRESET" }, "fake");
  assert.equal(network.kind, "network");
  assert.equal(network.retryable, true);
});

test("falls back to unknown with message", () => {
  const err = normalizeProviderError(new Error("boom"), "fake");
  assert.equal(err.kind, "unknown");
  assert.equal(err.retryable, false);
  assert.match(err.message, /boom/);
});
