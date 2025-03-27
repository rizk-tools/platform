import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";

const tags = ["Monitoring"];

const attributesSchema = z.object({
  "traceloop.workflow.name": z.string(),
  "traceloop.association.properties.conversation_id": z.string(),
  "traceloop.association.properties.query": z.string(),
  "traceloop.association.properties.organization_id": z.string(),
  "traceloop.association.properties.project_id": z.string(),
  "traceloop.association.properties.agent_id": z.string(),
  "traceloop.association.properties.langfuse.session.id": z.string(),
  "gen_ai.request.model": z.string(),
  "gen_ai.request.temperature": z.number(),
  "gen_ai.request.max_tokens": z.number(),
  "gen_ai.prompt": z.string(),
  "gen_ai.completion": z.string(),
  "gen_ai.usage.total_tokens": z.number(),
  "gen_ai.usage.prompt_tokens": z.number(),
  "gen_ai.usage.completion_tokens": z.number(),
  "gen_ai.usage.cost": z.number(),
});

const resourceAttributesSchema = z.object({
  "service.name": z.string(),
  "service.version": z.string(),
  "deployment.environment": z.string(),
  "langfuse.user.id": z.string(),
  "langfuse.session.id": z.string(),
  "langfuse.tags": z.array(z.string()),
});

const scopeSchema = z.object({
  name: z.string(),
});

const telemetryItemSchema = z.object({
  id: z.string(),
  attributes: attributesSchema,
  resourceAttributes: resourceAttributesSchema,
  scope: scopeSchema,
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
  },
});

export type ListResponsesRoute = typeof listResponses; 