import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";

const tags = ["Reports"];

export const get = createRoute({
  path: "/reports/:type",
  method: "get",
  tags,
  request: {
    params: z.object({
      type: z.enum(['eu-ai-act', 'risk-assessment']).optional().default('eu-ai-act')
    }),
    query: z.object({
      orgId: z.string().optional().default('demo'),
      orgName: z.string().optional().default('Acme Corp'),
      timeRange: z.string().optional().default('Last 90 days')
    })
  },
  responses: {
    [HttpStatusCodes.OK]: {
      content: {
        "application/pdf": {
          schema: z.any(),
        },
      },
      description: "The PDF report",
    },
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({
        error: z.string()
      }),
      "Error generating the report"
    )
  },
});

export type GetRoute = typeof get;