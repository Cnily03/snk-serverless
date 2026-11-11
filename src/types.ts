import z from "zod";

export type Theme = "light" | "dark";

interface Variables {
  whitelist: Set<string>;
  cacheName?: string;
  cacheSeconds?: number;
}

export type EnvHono = {
  Bindings: Env;
  Variables: Variables;
};

export const zVercelEnv = z.object({
  GITHUB_TOKEN: z.string(),
  WHITELIST: z.string().optional(),
  CACHE_NAME: z.string().optional(),
  CACHE_SECONDS: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  KV_REST_API_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  KV_REST_API_TOKEN: z.string().optional(),
  CRON_SECRET: z.string().optional(),
});
