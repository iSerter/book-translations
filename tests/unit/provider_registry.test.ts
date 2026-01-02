import assert from "node:assert/strict";
import test from "node:test";

import { AppError, ExitCode } from "../../src/lib/errors.js";
import { createProviderRegistry } from "../../src/providers/provider_registry.js";

test("registers and retrieves providers", () => {
  const registry = createProviderRegistry<{ name: string }>("generation");
  registry.register("fake", { name: "fake" });
  const provider = registry.get("fake");
  assert.equal(provider.name, "fake");
  assert.equal(registry.has("fake"), true);
  assert.deepEqual(registry.list(), ["fake"]);
});

test("throws on duplicate registration", () => {
  const registry = createProviderRegistry<{}>("translation");
  registry.register("dup", {});
  assert.throws(() => registry.register("dup", {}), (err: unknown) => {
    assert.ok(err instanceof AppError);
    assert.equal(err.code, ExitCode.Config);
    return true;
  });
});

test("throws when provider is missing", () => {
  const registry = createProviderRegistry<{}>("generation");
  assert.throws(() => registry.get("missing"), (err: unknown) => {
    assert.ok(err instanceof AppError);
    assert.equal(err.code, ExitCode.Config);
    return true;
  });
});

test("resolves using default name and errors when none provided", () => {
  const registry = createProviderRegistry<{ value: number }>("translation");
  registry.register("default", { value: 42 });
  const resolved = registry.resolve(undefined, "default");
  assert.equal(resolved.value, 42);

  assert.throws(() => registry.resolve(undefined, undefined), (err: unknown) => {
    assert.ok(err instanceof AppError);
    assert.equal(err.code, ExitCode.Config);
    return true;
  });
});
