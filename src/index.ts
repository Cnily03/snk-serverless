import app from "@/app";
import { parseWhitelist } from "@/mw/parser";
import { getSnakeCells, renderSnakeSvg } from "@/snake";
import type { EnvHono, Theme } from "@/types";

export default {
  async fetch(request: Request, env: EnvHono["Bindings"]): Promise<Response> {
    return app.fetch(request, env);
  },

  async scheduled(
    _controller: ScheduledController,
    env: EnvHono["Bindings"],
    ctx: ExecutionContext,
  ): Promise<void> {
    ctx.waitUntil(
      (async () => {
        // Generating snake SVG for each whitelisted username and theme to warm up
        const whitelist = parseWhitelist(env.WHITELIST);
        if (whitelist.size === 0) return;

        const themes: Theme[] = ["light", "dark"];
        const pools = Array.from(whitelist).map((username) =>
          (async () => {
            const cells = await getSnakeCells(username, env.GITHUB_TOKEN);
            console.info(`Fetched snake cells for username=${username}`);
            await Promise.all(
              themes.map((theme) =>
                (async () => {
                  const key = `${username}@${theme}`;
                  const newSvg = await renderSnakeSvg(cells, theme);
                  console.info(`Generated snake SVG for username=${username}, theme=${theme}`);
                  await env.KV.put(key, newSvg);
                })(),
              ),
            );
          })(),
        );
        await Promise.all(pools);
      })(),
    );
  },
};
