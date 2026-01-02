import { AppError, ExitCode } from "../../lib/errors.js";

type SqliteError = { code?: string };

export function isConstraintError(error: unknown): error is SqliteError {
  return typeof (error as SqliteError)?.code === "string" && (error as SqliteError).code.startsWith("SQLITE_CONSTRAINT");
}

export function conflict(message: string, cause: unknown): AppError {
  return new AppError(message, { code: ExitCode.Conflict, cause });
}
