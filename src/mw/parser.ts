import { createMiddleware } from "hono/factory";
import { kv } from "@/kv";
import type { EnvHono } from "@/types";

export function parseWhitelist(whitelist: string | undefined): Set<string> {
  const set = new Set<string>();
  (whitelist ?? "").split(",").forEach((item) => {
    const trimmed = item.trim();
    if (trimmed) set.add(trimmed);
  });
  return set;
}

export const parseEnv = createMiddleware<EnvHono>(async (c, next) => {
  // set env according to Redis or KV binding
  c.env.KV = kv(c.env.KV, c.env);

  // parse whitelist
  c.set("whitelist", parseWhitelist(c.env.WHITELIST));

  // parse cacheSeconds and cacheName
  const cacheSeconds = c.env.CACHE_SECONDS ? parseInt(c.env.CACHE_SECONDS, 10) : undefined;
  c.set(
    "cacheSeconds",
    typeof cacheSeconds === "number" && cacheSeconds <= 0 ? undefined : cacheSeconds,
  );
  const cacheName = c.env.CACHE_NAME;
  c.set("cacheName", cacheName);

  await next();
});
