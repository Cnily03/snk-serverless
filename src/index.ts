import { Hono } from "hono";
import { EnvHono } from "@/types";
import apiApp from "@/api";

const app = new Hono<EnvHono>();

app.get("/", (c) => c.redirect("https://github.com/Cnily03/snk-serverless", 302));

app.route("/api", apiApp);

app.notFound((c) => c.text("not found", 404));

export default app;
