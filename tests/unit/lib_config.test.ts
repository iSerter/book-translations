import assert from "node:assert/strict";
import test from "node:test";
import path from "node:path";

import { loadConfig } from "../../src/lib/config.js";

const fixtureCwd = path.join(process.cwd(), "tmp-fixture");

test("loadConfig applies defaults and resolves relative db path", () => {
  const config = loadConfig({}, fixtureCwd);
  assert.equal(config.env, "development");
  assert.equal(config.dbPath, path.join(fixtureCwd, "data/book-translations.sqlite"));
});

test("loadConfig honors env overrides", () => {
  const env = {
    NODE_ENV: "production",
    APP_DB_PATH: "/abs/path/my.db",
    APP_DEFAULT_GENERATION_PROVIDER: "fake-gen",
    APP_DEFAULT_TRANSLATION_PROVIDER: "fake-trans",
    DEEPL_API_KEY: "deepl-key",
    AI_SDK_API_KEY: "ai-sdk-key",
  };
  const config = loadConfig(env, fixtureCwd);
  assert.equal(config.env, "production");
  assert.equal(config.dbPath, "/abs/path/my.db");
  assert.equal(config.defaultGenerationProvider, "fake-gen");
  assert.equal(config.defaultTranslationProvider, "fake-trans");
  assert.equal(config.deeplApiKey, "deepl-key");
  assert.equal(config.aiSdkApiKey, "ai-sdk-key");
});
