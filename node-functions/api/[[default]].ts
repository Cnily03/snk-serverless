import { Context, Hono } from "hono";
import { EnvHono } from "@/types";
import apiApp from "@/api";
import { fromBase64Url, hmacSha256, toBase64Url } from "@/utils/crypto";
import { sha1 } from "hono/utils/crypto";

type E = EnvHono & {
  Variables: {
    origin: string;
    uri: string;
    token: string;
  };
};

const app = new Hono<E>();

async function createValidation(token: string, body: ArrayBufferLike) {
  const now = Date.now();
  const nowBuf = new Uint8Array(8);
  new DataView(nowBuf.buffer).setBigUint64(0, BigInt(now), false);
  const bodyBuf = new Uint8Array(body);
  const message = new Uint8Array([...bodyBuf, ...nowBuf]);
  const sig = await hmacSha256(token, message);
  return {
    signature: sig,
    timestamp: now.toString(),
  };
}

function getOrignalUri(c: Context<E>): string {
  const url = new URL(c.req.url);
  const xForwardedHost = c.req.header("X-Forwarded-Host");
  const xForwardedProto = c.req.header("X-Forwarded-Proto");
  const xForwardedPort = c.req.header("X-Forwarded-Port");
  if (xForwardedHost) url.host = xForwardedHost;
  if (xForwardedProto) url.protocol = xForwardedProto;
  if (xForwardedPort) url.port = xForwardedPort;
  return `${url.protocol}//${url.host}/api${url.pathname}${url.search}`;
}

async function sendRemoteCache<R>(
  c: Context<E>,
  pathname: string,
  // biome-ignore lint/suspicious/noExplicitAny: depends on the arguments of each method
  args?: any[],
  replaceBody?: BodyInit,
): Promise<R> {
  args = args || [];
  while (args.length > 0 && args[args.length - 1] === undefined) {
    args.pop();
  }
  const req = c.req.raw.clone();
  let body: ArrayBufferLike;
  if (replaceBody) {
    body = await new Response(replaceBody).arrayBuffer();
  } else {
    body = await req.arrayBuffer();
  }
  const origin = c.get("origin");
  const token = c.get("token");
  const validation = await createValidation(token, body);
  const request = new Request(`${origin}/challenge/cache${pathname}`, {
    method: "POST",
    headers: {
      ...req.headers,
      "Content-Type": "application/json",
      "X-Inner-Signature": validation.signature,
      "X-Inner-Timestamp": validation.timestamp,
      "X-Req-Arguments": encodeURIComponent(JSON.stringify(args)),
      "X-Req-URI": c.get("uri"),
    },
    body: body,
  });
  const response = await fetch(request);
  if (!response.ok) {
    throw new Error(
      `Remote cache request failed with status ${response.status}: ${await response.text()}`,
    );
  }
  const ret = response.headers.get("X-Res-Result");
  if (ret) return JSON.parse(ret) as unknown as R;
  return response as unknown as R;
}

function cachesObject(c: Context<E>): CacheStorage {
  if (globalThis.caches) return globalThis.caches;
  // routes to edge functions
  return {
    open: async (cacheName: string) => ({
      match: async (request: URL | RequestInfo, options?: CacheQueryOptions) => {
        const arg0 = request instanceof Request ? null : request;
        return (
          (await sendRemoteCache<Response | null>(c, "/open/match", [cacheName, arg0, options])) ??
          undefined
        );
      },
      put: async (request: URL | RequestInfo, response: Response) => {
        const arg0 = request instanceof Request ? null : request;
        const responseInfo = {
          status: response.status,
          headers: response.headers.entries(),
          bodyBase64: await response.arrayBuffer().then(toBase64Url),
        };
        await sendRemoteCache(c, "/open/put", [cacheName, arg0], JSON.stringify(responseInfo));
      },
      add: async (request: RequestInfo | URL) => {
        const arg0 = request instanceof Request ? null : request;
        await sendRemoteCache(c, "/open/add", [cacheName, arg0]);
      },
      addAll: async (_requests: RequestInfo[]) => {
        throw new Error("addAll method is not supported in this environment");
      },
      delete: async (request: RequestInfo | URL, options?: CacheQueryOptions) => {
        const arg0 = request instanceof Request ? null : request;
        return await sendRemoteCache<boolean>(c, "/open/delete", [cacheName, arg0, options]);
      },
      keys: async (_request?: RequestInfo | URL, _options?: CacheQueryOptions) => {
        throw new Error("keys method is not supported in this environment");
      },
      matchAll: async (_request?: RequestInfo | URL, _options?: CacheQueryOptions) => {
        throw new Error("matchAll method is not supported in this environment");
      },
    }),
    delete: async (cacheName: string) => {
      return await sendRemoteCache<boolean>(c, "/delete", [cacheName]);
    },
    has: async (cacheName: string) => {
      return await sendRemoteCache<boolean>(c, "/has", [cacheName]);
    },
    keys: async () => {
      return await sendRemoteCache<string[]>(c, "/keys");
    },
    match: async (request: URL | RequestInfo, options?: MultiCacheQueryOptions) => {
      const arg0 = request instanceof Request ? null : request;
      return (await sendRemoteCache<Response | null>(c, "/match", [arg0, options])) ?? undefined;
    },
  };
}

app.use(async (c, next) => {
  const token = await sha1(c.env.GITHUB_TOKEN);
  if (!token) return c.text("service unavailable", 503);
  c.set("token", token);
  const url = getOrignalUri(c);
  const u = new URL(url);
  c.set("origin", `${u.protocol}//${u.host}`);
  c.set("uri", url);
  globalThis.caches = cachesObject(c);
  await next();
});

app.route("/", apiApp);

export default app;
