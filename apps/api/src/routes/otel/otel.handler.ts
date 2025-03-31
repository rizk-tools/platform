import * as HttpStatusCodes from "stoker/http-status-codes";
import * as protobuf from 'protobufjs'

import type { AppRouteHandler } from "@/lib/types";

import { auth } from "@/lib/auth";

import type { TracesRoute, LogsRoute, MetricsRoute } from "./otel.routes";

// External functions (to be implemented)
declare function getTenantByApiKey (apiKey: string): Promise<{ id: string } | null>;
declare function saveToClickHouse (rawBody: Buffer, tenantId: string): Promise<void>;
declare function enqueueForForwarding (rawBody: Buffer, tenantId: string): Promise<void>;

const root = await protobuf.load([
  "../../proto/opentelemetry/proto/collector/trace/v1/trace_service.proto",
  "../../proto/opentelemetry/proto/trace/v1/trace.proto",
  "../../proto/opentelemetry/proto/common/v1/common.proto",
  "../../proto/opentelemetry/proto/resource/v1/resource.proto",
])

const ExportTraceServiceRequest = root.lookupType('opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest')

async function handleOtelRequest (c: any, rawBody: Buffer) {
  const key = c.req.header('authorization') || "";

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

  console.log(`Raw body: ${rawBody}`);

  const message = ExportTraceServiceRequest.decode(new Uint8Array(rawBody))
  const object = ExportTraceServiceRequest.toObject(message, { enums: String, longs: String })

  console.log(`Object: ${JSON.stringify(object)}`);
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

