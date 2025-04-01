import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";

const tags = ["OpenTelemetry"];

const commonConfig = {
  tags,
  request: {
    headers: z.object({
      "authorization": z.string(),
      "content-type": z.literal("application/x-protobuf"),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: {
      content: {
        "text/plain": {
          schema: z.string(),
        },
      },
      description: "Data received successfully",
    },
    [HttpStatusCodes.UNAUTHORIZED]: {
      content: {
        "text/plain": {
          schema: z.string(),
        },
      },
      description: "Invalid API key",
    },
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: {
      content: {
        "text/plain": {
          schema: z.string(),
        },
      },
      description: "Error processing data",
    },
  },
};

export const traces = createRoute({
  ...commonConfig,
  path: "/v1/traces",
  method: "post",
});

export const logs = createRoute({
  ...commonConfig,
  path: "/v1/logs",
  method: "post",
});

export const metrics = createRoute({
  ...commonConfig,
  path: "/v1/metrics",
  method: "post",
});

export type TracesRoute = typeof traces;
export type LogsRoute = typeof logs;
export type MetricsRoute = typeof metrics;
