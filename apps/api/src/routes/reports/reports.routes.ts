import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";

const tags = ["Reports"];

export const get = createRoute({
  path: "/reports",
  method: "get",
  tags,
  responses: {
    [HttpStatusCodes.OK]: {
      content: {
        "application/pdf": {
          schema: z.any(),
        },
      },
      description: "The PDF report",
    },
  },
});

export type GetRoute = typeof get;