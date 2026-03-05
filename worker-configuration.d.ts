/** biome-ignore-all lint/correctness/noUnusedVariables: tsconfig loads these types for the worker environment */

interface Env {
  // Environment secrets

  GITHUB_TOKEN: string;

  // Environment variables

  /**
   * Comma-separated list of allowed GitHub usernames. If not set, all usernames are allowed.
   */
  WHITELIST?: string;
  /**
   * Number of seconds to cache the generated SVG. Set to 0 to disable.
   * @default 86400 // 1 day
   */
  CACHE_SECONDS?: string;
  /**
   * Namespace for cache keys.
   * @default "snk-cache"
   */
  CACHE_NAME?: string;
}
