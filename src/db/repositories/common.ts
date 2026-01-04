import { AppError, ExitCode } from "../../lib/errors.js";

type SqliteError = { code?: string };

export function isConstraintError(error: unknown): error is SqliteError {
  const e = error as SqliteError | null | undefined;
  return typeof e?.code === "string" && e.code.startsWith("SQLITE_CONSTRAINT");
}

export function conflict(message: string, cause: unknown): AppError {
  return new AppError(message, { code: ExitCode.Conflict, cause });
}
