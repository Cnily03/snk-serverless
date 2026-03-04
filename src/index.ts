import { Hono } from "hono";
import { etag } from "hono/etag";
import { HTTPException } from "hono/http-exception";
import z, { ZodError } from "zod";
import { cacheMw, parseEnv } from "@/mw";
import { generateSnakeSvg } from "@/snake";
import type { EnvHono } from "@/types";

const zodTheme = z.enum(["light", "dark"]);

const app = new Hono<EnvHono>();

app.use(parseEnv, cacheMw, etag());

app.get("/:username", async (c) => {
  // validate input

  const username = c.req.param("username").trim();
  if (!username) {
    throw new HTTPException(400, { message: "username is required" });
  }

  const theme = zodTheme.parse(c.req.query("theme") || "light");
  if (!theme) {
    throw new HTTPException(400, { message: "invalid theme" });
  }

  const whitelist = c.get("whitelist");
  if (whitelist.size > 0 && !whitelist.has(username)) {
    return c.text("username not allowed", 403);
  }

  const svg = await generateSnakeSvg(username, theme, c.env.GITHUB_TOKEN);
  return c.newResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": `public, max-age=${c.get("cacheSeconds")}`,
      Expires: new Date(Date.now() + c.get("cacheSeconds") * 1000).toUTCString(),
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
