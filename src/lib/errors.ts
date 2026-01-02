export enum ExitCode {
  Success = 0,
  Validation = 2,
  NotFound = 3,
  Conflict = 4,
  Provider = 5,
  Config = 6,
  Unknown = 1,
}

export type AppErrorOptions = {
  code: ExitCode;
  cause?: unknown;
  details?: Record<string, unknown>;
};

export class AppError extends Error {
  readonly code: ExitCode;
  readonly details?: Record<string, unknown>;

  constructor(message: string, options: AppErrorOptions) {
    super(message);
    this.name = "AppError";
    this.code = options.code;
    this.details = options.details;
    if (options.cause !== undefined) {
      this.cause = options.cause;
    }
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function toExitCode(error: unknown): ExitCode {
  if (error instanceof AppError) {
    return error.code;
  }
  return ExitCode.Unknown;
}
