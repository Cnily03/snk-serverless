import { Hono } from "hono";
import { parseEnv } from "@/mw/parser";
import snkImgApp from "@/routes/snk";
import type { EnvHono } from "@/types";

const app = new Hono<EnvHono>();

app.use(parseEnv);

app.get("/", (c) => c.redirect("https://github.com/Cnily03/snk-serverless", 302));

app.route("/snk", snkImgApp);

app.notFound((c) => c.text("not found", 404));

export default app;
