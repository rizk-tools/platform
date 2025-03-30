import type { AppOpenAPI } from "@/lib/types";
import { auth } from "@/lib/auth";
import { BASE_PATH } from "@/lib/constants";
import createRouter from "@/lib/create-router";
import { authMiddleware } from "@/middleware/auth";
import { cors } from "hono/cors";

import policies from "@/routes/policies/policies.index";
import projects from "@/routes/projects/projects.index";
import monitoring from "@/routes/monitoring/monitoring.index";
import check from "@/routes/check/check.index";
import reports from "@/routes/reports/reports.index";

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
    .get('/health', (c) => {
      return c.json({
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      })
    })
    // Auth routes should be before the authMiddleware
    .on(["POST", "GET"], "/auth/**", async (c) => {
      return auth.handler(c.req.raw);
    })
    .route("/", check)
    .route("/", reports)
    // Apply auth middleware to all other routes
    .use(authMiddleware)
    .route("/", policies)
    .route("/", projects)
    .route("/", monitoring);
}

export const router = registerRoutes(
  createRouter().basePath(BASE_PATH),
);

export type Router = typeof router;