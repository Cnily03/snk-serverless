// Vercel entry source

import { Hono } from "hono";
import app from "@/app";
import scheduleApp from "@/routes/api/schedule";
import { type EnvHono, zVercelEnv } from "@/types";

const vercelApp = new Hono<EnvHono>();

vercelApp.route("/api/schedule", scheduleApp);
vercelApp.route("/", app);

export default {
  async fetch(request: Request, _env: EnvHono["Bindings"]): Promise<Response> {
    const env = zVercelEnv.parse(process.env) as Env;
    return vercelApp.fetch(request, env);
  },
};
