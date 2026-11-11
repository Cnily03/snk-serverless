import { handleSchedule, type ScheduleMetadata } from "@vercel/schedules";
import { type Context, Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { trigger } from "@/scheduled";
import type { EnvHono } from "@/types";

interface ExtendEnv {
  Variables: {
    meta: ScheduleMetadata;
  };
}

const app = new Hono<EnvHono & ExtendEnv>();

function extractBearerToken(c: Context<EnvHono & ExtendEnv>): string | undefined {
  const authHeader = c.req.header("Authorization");
  if (!authHeader) return undefined;
  if (!authHeader.startsWith("Bearer ")) return undefined;
  return authHeader.slice("Bearer ".length).trim();
}

const authMw = createMiddleware<EnvHono & ExtendEnv>(async (c, next) => {
  const token = extractBearerToken(c);
  if (!token || token !== c.env.CRON_SECRET) {
    return c.text("unauthorized", 401);
  }
  await next();
});

const scheduleMw = createMiddleware<EnvHono & ExtendEnv>(async (c, next) => {
  return handleSchedule(async (meta, _req) => {
    c.set("meta", meta);
    await next();
  })(c.req.raw);
});

app.use(async (c, next) => {
  if (c.req.method !== "POST") {
    return c.text("method not allowed", 405);
  }
  await next();
});

app.use(authMw);

app.post("/update", scheduleMw, async (c) => {
  const meta = c.get("meta");
  console.info(
    `Running scheduled task: name=${meta.name} id=${meta.scheduleId} time=${meta.scheduledAt}`,
  );
  await trigger(c.env);
  return c.text("Ran scheduled task");
});

export default app;
