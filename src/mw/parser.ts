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

  // parse cache namespace  const cacheNs = c.env.CACHE_NS?.trim() || "snk:cache";
  c.set("cacheNamespace", c.env.CACHE_NS?.trim() || "snk:cache");

  await next();
});
