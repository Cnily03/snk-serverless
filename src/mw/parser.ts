import { createMiddleware } from "hono/factory";
import type { EnvHono } from "@/types";

export const parseEnv = createMiddleware<EnvHono>(async (c, next) => {
  // parse whitelist
  const w = c.env.WHITELIST ?? "";
  const set = new Set<string>();
  w.split(",").forEach((item) => {
    const trimmed = item.trim();
    if (trimmed) {
      set.add(trimmed);
    }
  });
  c.set("whitelist", set);

  // parse cache seconds
  const cacheSeconds = c.env.CACHE_SECONDS ? parseInt(c.env.CACHE_SECONDS, 10) : 0;
  c.set("cacheSeconds", cacheSeconds);

  // parse cache name
  const cacheName = c.env.CACHE_NAME?.trim() || "snk-cache";
  c.set("cacheName", cacheName);

  await next();
});
