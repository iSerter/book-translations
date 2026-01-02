import path from "node:path";
import { AppError, ExitCode } from "./errors.js";

type Env = Record<string, string | undefined>;

export type AppConfig = {
  env: "development" | "test" | "production";
  dbPath: string;
  defaultGenerationProvider: string;
  defaultTranslationProvider: string;
  deeplApiKey?: string;
  aiSdkApiKey?: string;
};

const DEFAULTS: Omit<AppConfig, "deeplApiKey" | "aiSdkApiKey"> = {
  env: "development",
  dbPath: "data/book-translations.sqlite",
  defaultGenerationProvider: "ai-sdk",
  defaultTranslationProvider: "deepl",
};

export function loadConfig(env: Env = process.env, cwd: string = process.cwd()): AppConfig {
  const resolvedEnv = normalizeEnv(env.NODE_ENV ?? env.APP_ENV ?? DEFAULTS.env);
  const dbPath = resolvePath(env.APP_DB_PATH ?? env.BOOK_APP_DB_PATH ?? DEFAULTS.dbPath, cwd);

  if (!dbPath.trim()) {
    throw new AppError("Database path is required", { code: ExitCode.Config });
  }

  return {
    env: resolvedEnv,
    dbPath,
    defaultGenerationProvider:
      env.APP_DEFAULT_GENERATION_PROVIDER ?? DEFAULTS.defaultGenerationProvider,
    defaultTranslationProvider:
      env.APP_DEFAULT_TRANSLATION_PROVIDER ?? DEFAULTS.defaultTranslationProvider,
    deeplApiKey: env.DEEPL_API_KEY,
    aiSdkApiKey: env.AI_SDK_API_KEY ?? env.OPENAI_API_KEY,
  };
}

function normalizeEnv(value: string): AppConfig["env"] {
  const normalized = value.toLowerCase();
  if (normalized === "production") return "production";
  if (normalized === "test") return "test";
  return "development";
}

function resolvePath(p: string, cwd: string): string {
  if (path.isAbsolute(p)) return p;
  return path.join(cwd, p);
}
