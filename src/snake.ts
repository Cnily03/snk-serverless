import { type Cell, getGithubUserContribution } from "@snk/github-user-contribution";
import { getBestRoute } from "@snk/solver/getBestRoute";
import { getPathToPose } from "@snk/solver/getPathToPose";
import { createSvg, type DrawOptions } from "@snk/svg-creator";
import { snake4 } from "@snk/types/__fixtures__/snake";
import { type Color, createEmptyGrid, setColor, setColorEmpty } from "@snk/types/grid";
import type { Theme } from "@/types";

const userContributionToGrid = (cells: Cell[]) => {
  const width = Math.max(0, ...cells.map((cell) => cell.x)) + 1;
  const height = Math.max(0, ...cells.map((cell) => cell.y)) + 1;

  const grid = createEmptyGrid(width, height);
  for (const cell of cells) {
    if (cell.level > 0) setColor(grid, cell.x, cell.y, cell.level as Color);
    else setColorEmpty(grid, cell.x, cell.y);
  }

  return grid;
};

const getDrawOptions = (theme: Theme): DrawOptions => {
  if (theme === "dark") {
    return {
      sizeDotBorderRadius: 2,
      sizeCell: 16,
      sizeDot: 12,
      colorDotBorder: "#1b1f230a",
      colorEmpty: "#161b22",
      colorDots: {
        1: "#01311f",
        2: "#034525",
        3: "#0f6d31",
        4: "#00c647",
      },
      colorSnake: "purple",
    };
  }

  return {
    sizeDotBorderRadius: 2,
    sizeCell: 16,
    sizeDot: 12,
    colorDotBorder: "#1b1f230a",
    colorEmpty: "#ebedf0",
    colorDots: {
      1: "#9be9a8",
      2: "#40c463",
      3: "#30a14e",
      4: "#216e39",
    },
    colorSnake: "purple",
  };
};

export async function generateSnakeSvg(username: string, theme: Theme, githubToken: string) {
  const cells = await getGithubUserContribution(username, {
    githubToken,
  });

  const grid = userContributionToGrid(cells);
  const chain = getBestRoute(grid, snake4) ?? [snake4];
  chain.push(...(getPathToPose(chain[chain.length - 1], snake4) ?? []));

  return createSvg(grid, cells, chain, getDrawOptions(theme), {
    stepDurationMs: 100,
  });
}
