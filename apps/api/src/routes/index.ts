import type { AppOpenAPI } from "@/lib/types";
import { auth } from "@/lib/auth";
import { BASE_PATH } from "@/lib/constants";
import createRouter from "@/lib/create-router";
import { authMiddleware } from "@/middleware/auth";

import policies from "@/routes/policies";

export function registerRoutes (app: AppOpenAPI) {
  // app.on(["POST", "GET"], "/auth/**", (c) => auth.handler(c.req.raw));

  // app.use(authMiddleware)

  // app.route("/policies", policies);

  return app.route("/", policies);
}

export const router = registerRoutes(
  createRouter().basePath(BASE_PATH),
);

export type router = typeof router;