import { type Context, Hono } from "hono";
import { etag } from "hono/etag";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import z, { ZodError } from "zod";
import { cacheMw } from "@/mw";
import { cacheHeaders } from "@/mw/cache";
import { generateSnakeSvg } from "@/snake";
import type { EnvHono, Theme } from "@/types";

const zodTheme = z.enum(["light", "dark"]);

const app = new Hono<EnvHono>();

app.use(cacheMw, etag());

const checkUsername = createMiddleware<EnvHono>(async (c, next) => {
  const username = c.req.param("username")?.trim();
  if (!username) {
    throw new HTTPException(400, { message: "username is required" });
  }

  // check username in whitelist
  const whitelist = c.get("whitelist");
  if (whitelist.size > 0 && !whitelist.has(username)) {
    return c.text("username not allowed", 403);
  }

  await next();
});

async function snakeSvg(c: Context<EnvHono>, username: string, theme: Theme) {
  const key = `${username}@${theme}`;
  const svg = await c.env.KV.get(key);
  if (svg) {
    console.info(`Reused snake SVG for username=${username}, theme=${theme}`);
    return svg;
  }

  console.info(`Generating snake SVG for username=${username}, theme=${theme}`);
  const newSvg = await generateSnakeSvg(username, theme, c.env.GITHUB_TOKEN);
  await c.env.KV.put(key, newSvg);
  return newSvg;
}

app.get("/:username", checkUsername, async (c) => {
  // validate input
  const theme = zodTheme.parse(c.req.query("theme") || "light");
  if (!theme) {
    throw new HTTPException(400, { message: "invalid theme" });
  }

  const username = c.req.param("username");

  const svg = await snakeSvg(c, username, theme);
  return c.newResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      ...cacheHeaders(c),
    },
  });
});

app.notFound((c) => c.text("not found", 404));

app.onError((e, c) => {
  if (e instanceof HTTPException) {
    return c.text(e.message, e.status);
  }
  if (e instanceof ZodError) {
    return c.text("bad request", 400);
  }
  console.error(e);
  return c.text("internal server error", 500);
});

export default app;
