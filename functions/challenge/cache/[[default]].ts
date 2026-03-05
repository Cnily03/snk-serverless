import { Context, Hono } from "hono";
import { EnvHono } from "@/types";
import { createMiddleware } from "hono/factory";
import { sha1 } from "hono/utils/crypto";
import { fromBase64Url, hmacSha256 } from "@/utils/crypto";

type E = EnvHono & {
  Variables: {
    // biome-ignore lint/suspicious/noExplicitAny: depends on the arguments of each method
    arguments: any[];
  };
};

const app = new Hono<E>();

async function checkValidation(
  token: string,
  signature: string,
  timestamp: string,
  body: ArrayBufferLike,
) {
  // check timestamp (in 10 seconds)
  const ts = parseInt(timestamp, 10);
  const now = BigInt(Date.now());
  if (ts > now || ts < now - 10_000n) return false;
  // calc expected signature
  const tsBuf = new Uint8Array(8);
  new DataView(tsBuf.buffer).setBigUint64(0, BigInt(ts), false);
  const bodyBuf = new Uint8Array(body);
  const message = new Uint8Array([...bodyBuf, ...tsBuf]);
  // validate signature
  const expectedSig = await hmacSha256(token, message);
  if (signature === expectedSig) return true;
  return false;
}

function restoreRequest(request: Request) {
  const headers = new Headers(request.headers);
  headers.delete("X-Inner-Signature");
  headers.delete("X-Inner-Timestamp");
  headers.delete("X-Req-Arguments");
  const reqUri = headers.get("X-Req-URI");
  headers.delete("X-Req-URI");
  headers.delete("Content-Length");
  headers.delete("Content-Type");
  headers.delete("Content-Encoding");
  headers.delete("Transfer-Encoding");
  return new Request(reqUri || request.url, {
    method: "GET",
    headers: headers,
  });
}

const signMw = createMiddleware<E>(async (c, next) => {
  const token = await sha1(c.env.GITHUB_TOKEN);
  if (!token) return c.text("service unavailable", 503);
  const signature = c.req.header("X-Inner-Signature");
  const timestamp = c.req.header("X-Inner-Timestamp");
  if (!signature || !timestamp) return c.text("unauthorized", 401);
  const valid = await checkValidation(
    token,
    signature,
    timestamp,
    await c.req.raw.clone().arrayBuffer(),
  );
  if (!valid) return c.text("unauthorized", 401);
  const argsStr = c.req.header("X-Req-Arguments") ?? "[]";
  const args = JSON.parse(decodeURIComponent(argsStr));
  c.set("arguments", args);
  await next();
});

app.use(signMw);

function sendResult<R>(c: Context<E>, result: R) {
  c.header("X-Res-Result", JSON.stringify(result));
  return c.json(null);
}

app.post("/delete", async (c) => {
  const args = c.get("arguments");
  const ok = await caches.delete(args[0]);
  return sendResult(c, ok);
});

app.post("/has", async (c) => {
  const args = c.get("arguments");
  const ok = await caches.has(args[0]);
  return sendResult(c, ok);
});

app.post("/keys", async (c) => {
  const keys = await caches.keys();
  return sendResult(c, keys);
});

app.post("/match", async (c) => {
  const args = c.get("arguments");
  const arg0 = args[0] === null ? restoreRequest(c.req.raw) : args[0];
  const restArgs = args.slice(1);
  const response = await caches.match(arg0, ...restArgs);
  if (!response) {
    return sendResult(c, null);
  }
  return response;
});

app.post("/open/match", async (c) => {
  const args = c.get("arguments");
  const cacheName = args[0];
  const arg0 = args[1] === null ? restoreRequest(c.req.raw) : args[1];
  const restArgs = args.slice(2);
  const response = await caches.open(cacheName).then((cache) => cache.match(arg0, ...restArgs));
  if (!response) {
    return sendResult(c, null);
  }
  return response;
});

app.post("/open/put", async (c) => {
  const args = c.get("arguments");
  const cacheName = args[0];
  const arg0 = args[1] === null ? restoreRequest(c.req.raw) : args[1];
  const responseInfo = await c.req.json();
  const status = responseInfo.status;
  const headers = new Headers(responseInfo.headers);
  const body = fromBase64Url(responseInfo.bodyBase64);
  const response = new Response(new Uint8Array(body), { headers, status });
  await caches.open(cacheName).then((cache) => cache.put(arg0, response));
  return sendResult(c, null);
});

app.post("/open/add", async (c) => {
  const args = c.get("arguments");
  const cacheName = args[0];
  const arg0 = args[1] === null ? restoreRequest(c.req.raw) : args[1];
  await caches.open(cacheName).then((cache) => cache.add(arg0));
  return sendResult(c, null);
});

app.post("/open/delete", async (c) => {
  const args = c.get("arguments");
  const cacheName = args[0];
  const arg0 = args[1] === null ? restoreRequest(c.req.raw) : args[1];
  const restArgs = args.slice(2);
  const ok = await caches.open(cacheName).then((cache) => cache.delete(arg0, ...restArgs));
  return sendResult(c, ok);
});

app.onError((e, c) => {
  console.error(e);
  return c.text("internal server error", 500);
});

interface EventContext {
  request: Request;
  env: Env;
}

const mainApp = new Hono();
mainApp.route("/challenge/cache", app);

export default async function onRequest(context: EventContext) {
  return mainApp.fetch(context.request, context.env);
}
