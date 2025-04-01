import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";

const tags = ["Monitoring"];

// More flexible schema that accepts any attribute keys
const attributesSchema = z.record(z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.array(z.string()),
  z.array(z.number()),
  z.array(z.boolean())
])).default({});

const resourceAttributesSchema = z.record(z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.array(z.string()),
  z.array(z.number()),
  z.array(z.boolean())
])).default({});

const scopeSchema = z.object({
  name: z.string(),
}).default({ name: "" });

// Allow any data structure for the raw data
const rawDataSchema = z.any();

// This schema now matches what the handler actually returns
const telemetryItemSchema = z.object({
  id: z.string(),
  attributes: attributesSchema,
  resourceAttributes: resourceAttributesSchema,
  scope: scopeSchema,
  raw: rawDataSchema.optional()
});

const errorSchema = z.object({
  error: z.string()
});

export const listResponses = createRoute({
  path: "/monitoring/responses",
  method: "get",
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(telemetryItemSchema),
      "The list of OpenTelemetry traces",
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      errorSchema,
      "User is not authenticated"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      errorSchema,
      "Bad request, e.g. missing organization"
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      errorSchema,
      "Internal server error"
    ),
  },
});

export type ListResponsesRoute = typeof listResponses; 