/** biome-ignore-all lint/correctness/noUnusedVariables: tsconfig loads these types for the worker environment */

interface Env {
  // Bindings

  /**
   * KV namespace for generated snake SVGs, keyed as `username@theme` (lowercase username).
   */
  KV: KVNamespace;

  // Environment secrets

  GITHUB_TOKEN: string;

  // Environment variables

  /**
   * Comma-separated list of allowed GitHub usernames. If not set, all usernames are allowed.
   */
  WHITELIST?: string;

  /**
   * The namespace for the cache.
   */
  CACHE_NAME?: string;

  /**
   * The number of seconds to cache the generated SVGs.
   */
  CACHE_SECONDS?: string;
}
