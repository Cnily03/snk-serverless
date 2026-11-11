/** biome-ignore-all lint/correctness/noUnusedVariables: tsconfig loads these types for the worker environment */

interface KVStorage {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
  list(options?: { prefix?: string }): Promise<{ keys: string[] }>;
}

interface Env {
  // * Bindings

  /**
   * KV namespace
   *
   * Auto fallback to Upstash Redis KV storage. And finally fallback to empty KV storage that does nothing.
   */
  KV: KVStorage | KVNamespace;

  // * Environment secrets

  GITHUB_TOKEN: string;

  // * Environment variables

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

  // * Environment variables (Vercel only)

  /**
   * Upstash Redis REST URL, used as the KV storage on Vercel / Node.js.
   */
  UPSTASH_REDIS_REST_URL?: string;
  KV_REST_API_URL?: string;

  /**
   * Upstash Redis REST token.
   */
  UPSTASH_REDIS_REST_TOKEN?: string;
  KV_REST_API_TOKEN?: string;

  /**
   * Secret required by the Vercel cron endpoint (`/api/cron`).
   * Vercel Cron sends it as `Authorization: Bearer <CRON_SECRET>`.
   */
  CRON_SECRET?: string;
}
