import util from "node:util";
import { AppError, ExitCode, toExitCode } from "./errors.js";

export type OutputMode = "json" | "text";

export type OutputTargets = {
  stdout: NodeJS.WritableStream;
  stderr: NodeJS.WritableStream;
};

const defaultTargets: OutputTargets = {
  stdout: process.stdout,
  stderr: process.stderr,
};

export function printResult(result: unknown, mode: OutputMode, targets: OutputTargets = defaultTargets): void {
  if (mode === "json") {
    targets.stdout.write(JSON.stringify(result, null, 2) + "\n");
    return;
  }
  if (typeof result === "object" && result !== null) {
      targets.stdout.write(util.inspect(result, { colors: true, depth: null }) + "\n");
  } else {
      targets.stdout.write(String(result) + "\n");
  }
}

export function printError(error: unknown, mode: OutputMode, targets: OutputTargets = defaultTargets): ExitCode {
  const exitCode = toExitCode(error);
  if (mode === "json") {
    const payload = serializeError(error);
    targets.stdout.write(JSON.stringify(payload, null, 2) + "\n");
  } else {
    targets.stderr.write(renderTextError(error) + "\n");
  }
  return exitCode;
}

function serializeError(error: unknown): { code: string; message: string; details?: unknown } {
  if (error instanceof AppError) {
    return {
      code: ExitCode[error.code] ?? "UNKNOWN",
      message: error.message,
      details: error.details,
    };
  }
  if (error instanceof Error) {
    return { code: "UNKNOWN", message: error.message };
  }
  return { code: "UNKNOWN", message: String(error) };
}

function renderTextError(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }
  return `Error: ${String(error)}`;
}
