import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";
import { createErrorSchema, IdParamsSchema, IdUUIDParamsSchema } from "stoker/openapi/schemas";
import { createSelectSchema } from "drizzle-zod";
import { policiesTable } from "@/db/schema";
import { notFoundSchema } from "@/lib/constants";

const tags = ["Policies"];

const selectPolicySchema = createSelectSchema(policiesTable)

export const list = createRoute({
  path: "/policies",
  method: "get",
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(selectPolicySchema),
      "The list of policies",
    ),
  },
});

export const getOne = createRoute({
  path: "/policies/{id}",
  method: "get",
  request: {
    params: IdUUIDParamsSchema,
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectPolicySchema,
      "The requested policy",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Policy not found",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParamsSchema),
      "Invalid id error",
    ),
  },
});

export type ListRoute = typeof list;
export type GetOneRoute = typeof getOne;