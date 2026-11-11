import { kv } from "@/kv";
import { parseWhitelist } from "@/mw/parser";
import { getSnakeCells, renderSnakeSvg } from "@/snake";
import type { Theme } from "@/types";

const themes: Theme[] = ["light", "dark"];

export async function trigger(env: Env): Promise<void> {
  const KV = kv(env.KV, env);

  const whitelist = parseWhitelist(env.WHITELIST);
  if (whitelist.size === 0) return;

  const pools = Array.from(whitelist).map(async (username) => {
    const cells = await getSnakeCells(username, env.GITHUB_TOKEN);
    console.info(`Fetched snake cells for username=${username}`);

    await Promise.all(
      themes.map(async (theme) => {
        const key = `${username}@${theme}`;
        const svg = await renderSnakeSvg(cells, theme);
        console.info(`Generated snake SVG for username=${username}, theme=${theme}`);
        await KV.put(key, svg);
      }),
    );
  });

  await Promise.all(pools);
}
