import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";
import { createErrorSchema, IdParamsSchema, IdUUIDParamsSchema } from "stoker/openapi/schemas";
import { createSelectSchema } from "drizzle-zod";
import { projectsTable } from "@/db/schema";
import { notFoundSchema } from "@/lib/constants";

const tags = ["Projects"];

const selectProjectSchema = createSelectSchema(projectsTable);

// Schema for creating a new project
const createProjectSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  organizationId: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export const list = createRoute({
  path: "/projects",
  method: "get",
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(selectProjectSchema),
      "The list of projects",
    ),
  },
});

export const create = createRoute({
  path: "/projects",
  method: "post",
  tags,
  request: {
    body: {
      content: {
        "application/json": {
          schema: createProjectSchema,
        },
      },
    },
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      selectProjectSchema,
      "The created project",
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      createErrorSchema(createProjectSchema),
      "Invalid project data",
    ),
  },
});

export const getOne = createRoute({
  path: "/projects/{id}",
  method: "get",
  request: {
    params: IdUUIDParamsSchema,
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectProjectSchema,
      "The requested project",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Project not found",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParamsSchema),
      "Invalid id error",
    ),
  },
});

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type GetOneRoute = typeof getOne; 