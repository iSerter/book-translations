export type NormalizedProviderErrorKind =
  | "rate_limit"
  | "timeout"
  | "unauthorized"
  | "invalid_request"
  | "network"
  | "internal"
  | "unknown";

export type NormalizedProviderError = {
  kind: NormalizedProviderErrorKind;
  retryable: boolean;
  retryAfterMs?: number;
  message: string;
  provider?: string;
  raw?: unknown;
};

type HttpLikeError = {
  status?: number;
  code?: string | number;
  message?: string;
  retryAfter?: number;
};

type AbortLike = {
  name?: string;
};

export function normalizeProviderError(
  error: unknown,
  provider?: string,
): NormalizedProviderError {
  const http = error as HttpLikeError;
  const abort = error as AbortLike;

  // HTTP status based mapping
  if (typeof http.status === "number") {
    return normalizeFromStatus(http.status, http.message, http.retryAfter, provider, error);
  }

  // Abort/timeout detection
  if (abort?.name === "AbortError" || (typeof http.code === "string" && http.code === "ETIMEOUT")) {
    return build("timeout", true, http.message ?? "Request timed out", provider, error);
  }

  // Network-ish node codes
  if (typeof http.code === "string" && isNetworkCode(http.code)) {
    return build("network", true, http.message ?? http.code, provider, error);
  }

  // Unauthorized/forbidden via code
  if (http.code === 401 || http.code === 403 || http.code === "EUNAUTHORIZED") {
    return build("unauthorized", false, http.message ?? "Unauthorized", provider, error);
  }

  return build("unknown", false, getMessage(error), provider, error);
}

function normalizeFromStatus(
  status: number,
  message: string | undefined,
  retryAfter: number | undefined,
  provider: string | undefined,
  raw: unknown,
): NormalizedProviderError {
  if (status === 401 || status === 403) {
    return build("unauthorized", false, message ?? "Unauthorized", provider, raw);
  }
  if (status === 408 || status === 504) {
    return build("timeout", true, message ?? "Request timed out", provider, raw);
  }
  if (status === 429) {
    return build("rate_limit", true, message ?? "Rate limited", provider, raw, retryAfterMs(retryAfter));
  }
  if (status >= 500) {
    return build("internal", true, message ?? "Provider error", provider, raw);
  }
  if (status >= 400) {
    return build("invalid_request", false, message ?? "Invalid request", provider, raw);
  }
  return build("unknown", false, message ?? "Unknown error", provider, raw);
}

function retryAfterMs(value: number | undefined): number | undefined {
  if (typeof value === "number" && value > 0) return value * 1000;
  return undefined;
}

function isNetworkCode(code: string): boolean {
  return ["ENOTFOUND", "ECONNRESET", "ECONNREFUSED", "EHOSTUNREACH", "EAI_AGAIN", "ENETDOWN", "ENETUNREACH"].includes(code);
}

function getMessage(error: unknown): string {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  return "Unknown error";
}

function build(
  kind: NormalizedProviderErrorKind,
  retryable: boolean,
  message: string,
  provider: string | undefined,
  raw: unknown,
  retryAfterMs?: number,
): NormalizedProviderError {
  return { kind, retryable, message, provider, raw, retryAfterMs };
}
