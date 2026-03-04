import type { Context } from "hono";
import { createMiddleware } from "hono/factory";
import type { EnvHono } from "@/types";

const RESERVE_QUERIES = ["theme", "_", "t"];

export const cacheMw = createMiddleware<EnvHono>(async (c, next) => {
  // reconstruct request query in order
  const url = new URL(c.req.url);
  const queries = new URLSearchParams();
  for (const [key, value] of url.searchParams) {
    if (RESERVE_QUERIES.includes(key)) queries.append(key, value);
  }
  queries.sort();
  url.search = queries.toString();
  const request = new Request(url.toString(), c.req);

  // detect no-cache
  const noCache =
    c.req.header("Cache-Control")?.includes("no-cache") ||
    c.req.header("Pragma")?.includes("no-cache");

  const cacheNs = c.get("cacheNamespace");
  const cacheSec = c.get("cacheSeconds");
  const cache = await caches.open(cacheNs);

  if (!noCache) {
    // use cache if exists
    const cached = await cache.match(request);
    if (cached) return cached;
  }

  await next();

  // try cache request
  if (c.res.status === 200 && cacheSec > 0) {
    const cacheControl = c.res.headers.get("Cache-Control") || "";
    const needCache = cacheControl.includes("s-maxage") || cacheControl.includes("max-age");
    if (needCache) {
      await cache.put(request, c.res.clone());
    }
  }
});

export function cacheHeaders(c: Context<EnvHono>, seconds?: number): HeadersInit {
  seconds = seconds ?? c.get("cacheSeconds");
  if (Number.isNaN(seconds) || seconds <= 0) return {};
  const now = new Date();
  return {
    "Cache-Control": `public, max-age=${seconds}`,
    Expires: new Date(now.getTime() + seconds * 1000).toUTCString(),
    "Last-Modified": now.toUTCString(),
  };
}
