import { eq, and } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";

import type { AppRouteHandler } from "@/lib/types";

import { db } from "@/db";
import { projectsTable } from "@/db/schema";
import { ZOD_ERROR_CODES, ZOD_ERROR_MESSAGES } from "@/lib/constants";

import type { GetOneRoute, CreateRoute, ListRoute } from "./projects.routes";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const user = c.get("user")

  const projects = await db.select()
    .from(projectsTable)
    .where(
      eq(projectsTable.createdById, user.id)
    )

  return c.json(projects)
};

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const user = c.get("user")
  const data = await c.req.valid("json");

  const newProject = await db.insert(projectsTable)
    .values({
      ...data,
      createdById: user.id,
    })
    .returning();

  return c.json(newProject[0], HttpStatusCodes.CREATED);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const user = c.get("user")
  const { id } = c.req.valid("param");

  const project = await db.select()
    .from(projectsTable)
    .where(
      and(
        eq(projectsTable.createdById, user.id),
        eq(projectsTable.id, id)
      )
    )
    .limit(1);

  if (!project.length) {
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return c.json(project[0], HttpStatusCodes.OK);
}; 