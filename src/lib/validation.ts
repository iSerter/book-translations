import { AppError, ExitCode } from "./errors.js";

export function requirePositiveInt(value: unknown, fieldName: string): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    throw new AppError(`${fieldName} must be a positive integer`, {
      code: ExitCode.Validation,
      details: { field: fieldName, value },
    });
  }
  return value;
}

export function requireLanguageCode(value: unknown, fieldName = "languageCode"): string {
  if (typeof value !== "string") {
    throw new AppError(`${fieldName} must be a string`, {
      code: ExitCode.Validation,
      details: { field: fieldName, value },
    });
  }
  const trimmed = value.trim();
  if (!/^[a-z]{2,5}$/i.test(trimmed)) {
    throw new AppError(`${fieldName} must be 2-5 letters`, {
      code: ExitCode.Validation,
      details: { field: fieldName, value },
    });
  }
  return trimmed.toLowerCase();
}
