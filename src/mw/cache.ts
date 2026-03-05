import type { Context } from "hono";
import { createMiddleware } from "hono/factory";
import type { EnvHono } from "@/types";

const RESERVE_QUERIES = ["theme", "_", "t"];

function inferCachesObject(): CacheStorage {
  // for who provides Cache API
  if (globalThis.caches) return globalThis.caches;
  // for who doesn't provide Cache API
  // otherwise, return a dummy object that does nothing
  return {
    open: async () => ({
      match: async () => undefined,
      put: async () => {},
      add: async () => {},
      addAll: async () => {},
      delete: async () => false,
      keys: async () => [],
      matchAll: async () => [],
    }),
    delete: async () => false,
    has: async () => false,
    keys: async () => [],
    match: async () => undefined,
  };
}

export const cacheMw = createMiddleware<EnvHono>(async (c, next) => {
  // reconstruct request query in order
  const url = new URL(c.req.url);
  const queries = new URLSearchParams();
  url.searchParams.forEach((value, key) => {
    if (RESERVE_QUERIES.includes(key)) queries.append(key, value);
  });
  queries.sort();
  url.search = queries.toString();
  const request = new Request(url.toString(), c.req);

  // detect no-cache
  const noCache =
    c.req.header("Cache-Control")?.includes("no-cache") ||
    c.req.header("Pragma")?.includes("no-cache");

  const cacheNs = c.get("cacheName");
  const cacheSec = c.get("cacheSeconds");
  const caches = inferCachesObject();
  const cache = await caches.open(cacheNs);

  if (!noCache) {
    // use cache if exists
    const cached = await cache.match(request);
    // add cache-hit
    if (cached) {
      const resHeaders = new Headers(cached.headers);
      resHeaders.set("X-Cache-Hit", "true");
      return new Response(cached.body, {
        ...cached,
        headers: resHeaders,
      });
    }
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
    "Cache-Control": `public, max-age=${seconds}, s-maxage=${seconds}`,
    Expires: new Date(now.getTime() + seconds * 1000).toUTCString(),
    "Last-Modified": now.toUTCString(),
  };
}
