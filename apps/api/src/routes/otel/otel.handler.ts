import * as HttpStatusCodes from "stoker/http-status-codes";

import type { AppRouteHandler } from "@/lib/types";

import { auth } from "@/lib/auth";

import type { TracesRoute, LogsRoute, MetricsRoute } from "./otel.routes";

// External functions (to be implemented)
declare function getTenantByApiKey (apiKey: string): Promise<{ id: string } | null>;
declare function saveToClickHouse (rawBody: Buffer, tenantId: string): Promise<void>;
declare function enqueueForForwarding (rawBody: Buffer, tenantId: string): Promise<void>;

async function handleOtelRequest (c: any, rawBody: Buffer) {
  const key = c.req.header('x-api-key') || "";

  console.log(`Received request with key: ${key}`);

  const { valid, error } = await auth.api.verifyApiKey({
    body: {
      key
    },
  });

  console.log(`Validation result: ${valid}, error: ${error}`);

  if (!valid || error) {
    return c.text("Invalid API key", HttpStatusCodes.UNAUTHORIZED);
  }

  const tenant = await getTenantByApiKey(key);

  if (!tenant) {
    return c.text("Invalid API key", HttpStatusCodes.UNAUTHORIZED);
  }

  await Promise.all([
    saveToClickHouse(rawBody, tenant.id),
    enqueueForForwarding(rawBody, tenant.id)
  ]);

  return c.text("OK", HttpStatusCodes.OK);
}

export const traces: AppRouteHandler<TracesRoute> = async (c) => {
  const rawBody = await c.req.raw.arrayBuffer().then(Buffer.from);
  return handleOtelRequest(c, rawBody);
};

export const logs: AppRouteHandler<LogsRoute> = async (c) => {
  const rawBody = await c.req.raw.arrayBuffer().then(Buffer.from);
  return handleOtelRequest(c, rawBody);
};

export const metrics: AppRouteHandler<MetricsRoute> = async (c) => {
  const rawBody = await c.req.raw.arrayBuffer().then(Buffer.from);
  return handleOtelRequest(c, rawBody);
};

