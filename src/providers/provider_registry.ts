import { AppError, ExitCode } from "../lib/errors.js";

export type ProviderRegistry<T> = {
  register(name: string, provider: T): void;
  get(name: string): T;
  resolve(name: string | undefined, defaultName?: string): T;
  has(name: string): boolean;
  list(): string[];
  clear(): void;
};

export function createProviderRegistry<T>(kind: string): ProviderRegistry<T> {
  const providers = new Map<string, T>();

  function register(name: string, provider: T): void {
    const trimmed = name.trim();
    if (!trimmed) {
      throw new AppError(`${kind} provider name is required`, { code: ExitCode.Config });
    }
    if (providers.has(trimmed)) {
      throw new AppError(`${kind} provider '${trimmed}' is already registered`, {
        code: ExitCode.Config,
      });
    }
    providers.set(trimmed, provider);
  }

  function get(name: string): T {
    const trimmed = name.trim();
    const provider = providers.get(trimmed);
    if (!provider) {
      throw new AppError(`${kind} provider '${trimmed}' is not registered`, {
        code: ExitCode.Config,
        details: { availableProviders: list() },
      });
    }
    return provider;
  }

  function resolve(name: string | undefined, defaultName?: string): T {
    const target = name ?? defaultName;
    if (!target) {
      throw new AppError(`No ${kind} provider specified`, { code: ExitCode.Config });
    }
    return get(target);
  }

  function has(name: string): boolean {
    return providers.has(name.trim());
  }

  function list(): string[] {
    return Array.from(providers.keys()).sort();
  }

  function clear(): void {
    providers.clear();
  }

  return { register, get, resolve, has, list, clear };
}

export const generationProviderRegistry = createProviderRegistry<unknown>("generation");
export const translationProviderRegistry = createProviderRegistry<unknown>("translation");
