import type { AppOpenAPI } from "@/lib/types";
import { auth } from "@/lib/auth";
import { BASE_PATH } from "@/lib/constants";
import createRouter from "@/lib/create-router";
import { authMiddleware } from "@/middleware/auth";
import { cors } from "hono/cors";

import policies from "@/routes/policies/policies.index";

export function registerRoutes (app: AppOpenAPI) {
  return app
    .use("*", cors({
      origin: "*",
      allowHeaders: ["Content-Type", "Authorization"],
      allowMethods: ["POST", "GET", "PUT", "DELETE", "OPTIONS"],
      exposeHeaders: ["Content-Length"],
      maxAge: 600,
      credentials: true,
    }))
    // Auth routes should be before the authMiddleware
    .on(["POST", "GET"], "/auth/**", async (c) => {
      return auth.handler(c.req.raw);
    })
    // Apply auth middleware to all other routes
    .use(authMiddleware)
    .route("/", policies);
}

export const router = registerRoutes(
  createRouter().basePath(BASE_PATH),
);

export type Router = typeof router;