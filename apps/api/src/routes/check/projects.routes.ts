import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";

const tags = ["Check"];

export const create = createRoute({
  path: "/check",
  method: "post",
  tags,
  request: {
    headers: z.object({
      "x-api-key": z.string(),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        message: z.string(),
      }),
      "The created project",
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      z.object({
        message: z.string(),
      }),
      "Invalid API key",
    ),
  },
});


export type CreateRoute = typeof create;
