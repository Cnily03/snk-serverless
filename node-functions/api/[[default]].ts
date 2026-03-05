import { Hono } from "hono";
import apiApp from "@/api";
import type { EnvHono } from "@/types";

const app = new Hono<EnvHono>();

app.route("/", apiApp);

export default app;
