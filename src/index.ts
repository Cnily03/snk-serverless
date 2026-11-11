import app from "@/app";
import { trigger } from "@/scheduled";
import type { EnvHono } from "@/types";

export default {
  async fetch(request: Request, env: EnvHono["Bindings"]): Promise<Response> {
    return app.fetch(request, env);
  },

  async scheduled(
    _controller: ScheduledController,
    env: EnvHono["Bindings"],
    ctx: ExecutionContext,
  ): Promise<void> {
    ctx.waitUntil(trigger(env));
  },
};
