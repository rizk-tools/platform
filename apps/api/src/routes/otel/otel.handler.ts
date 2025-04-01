import * as HttpStatusCodes from "stoker/http-status-codes";
import clickhouse from "@/lib/clickhouse";
import { opentelemetry } from "@/generated/otlp";

import type { AppRouteHandler } from "@/lib/types";
import { auth } from "@/lib/auth";
import type { TracesRoute, LogsRoute, MetricsRoute } from "./otel.routes";

/**
 * Verify API key and extract organization ID
 */
async function verifyApiKey (c: any): Promise<{ isValid: boolean; organizationId?: string }> {
  const header = c.req.header('authorization') || "";
  const [type, token] = header.split(' ');

  if (type !== 'Bearer' || !token) {
    return { isValid: false };
  }

  const { valid, error, key } = await auth.api.verifyApiKey({
    body: { key: token }
  });

  // TODO: Remove this once we have a proper organization ID
  const organizationId = key?.metadata?.organizationId || '1';

  if (!valid || error || !organizationId) {
    return { isValid: false };
  }

  return { isValid: true, organizationId };
}

/**
 * Handler for trace data - uses generated types
 */
export const traces: AppRouteHandler<TracesRoute> = async (c) => {
  const { isValid, organizationId } = await verifyApiKey(c);

  if (!isValid) {
    return c.text("Invalid API key", HttpStatusCodes.UNAUTHORIZED);
  }

  try {
    const rawBody = await c.req.raw.arrayBuffer().then(Buffer.from);
    const message = opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest.decode(new Uint8Array(rawBody));
    const request = opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest.toObject(message, {
      longs: Number,
      enums: String,
      bytes: Array,
      defaults: true
    });

    // Store trace data
    await clickhouse.insert({
      table: 'traces_raw',
      values: [{
        tenant_id: organizationId,
        timestamp: new Date(),
        data: JSON.stringify(request)
      }],
      format: 'JSONEachRow'
    });

    return c.text("OK", HttpStatusCodes.OK);
  } catch (error) {
    console.error('Error processing trace data:', error);
    return c.text("Error processing data", HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Handler for logs data - uses generated types
 */
export const logs: AppRouteHandler<LogsRoute> = async (c) => {
  const { isValid, organizationId } = await verifyApiKey(c);

  if (!isValid) {
    return c.text("Invalid API key", HttpStatusCodes.UNAUTHORIZED);
  }

  try {
    const rawBody = await c.req.raw.arrayBuffer().then(Buffer.from);
    const message = opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest.decode(new Uint8Array(rawBody));
    const request = opentelemetry.proto.collector.logs.v1.ExportLogsServiceRequest.toObject(message, {
      longs: Number,
      enums: String,
      bytes: Array,
      defaults: true
    });

    // Store logs data
    await clickhouse.insert({
      table: 'logs_raw',
      values: [{
        tenant_id: organizationId,
        timestamp: new Date(),
        data: JSON.stringify(request)
      }],
      format: 'JSONEachRow'
    });

    return c.text("OK", HttpStatusCodes.OK);
  } catch (error) {
    console.error('Error processing logs data:', error);
    return c.text("Error processing data", HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Handler for metrics data - uses generated types
 */
export const metrics: AppRouteHandler<MetricsRoute> = async (c) => {
  const { isValid, organizationId } = await verifyApiKey(c);

  if (!isValid) {
    return c.text("Invalid API key", HttpStatusCodes.UNAUTHORIZED);
  }

  try {
    const rawBody = await c.req.raw.arrayBuffer().then(Buffer.from);
    const message = opentelemetry.proto.collector.metrics.v1.ExportMetricsServiceRequest.decode(new Uint8Array(rawBody));
    const request = opentelemetry.proto.collector.metrics.v1.ExportMetricsServiceRequest.toObject(message, {
      longs: Number,
      enums: String,
      bytes: Array,
      defaults: true
    });

    // Store metrics data
    await clickhouse.insert({
      table: 'metrics_raw',
      values: [{
        tenant_id: organizationId,
        timestamp: new Date(),
        data: JSON.stringify(request)
      }],
      format: 'JSONEachRow'
    });

    return c.text("OK", HttpStatusCodes.OK);
  } catch (error) {
    console.error('Error processing metrics data:', error);
    return c.text("Error processing data", HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

