import type { Variables } from "@/types/hono";
import { Hono } from "hono";
import { auth } from "@/lib/auth";
import { authMiddleware } from "@/middleware/auth";
import api from "@/routes";

const app = new Hono<{ Variables: Variables }>()

app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

app.use(authMiddleware)

app.route("/api", api);


export default app
