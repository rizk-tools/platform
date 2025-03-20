import { eq, and } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";

import type { AppRouteHandler } from "@/lib/types";

import { db } from "@/db";
import { policiesTable } from "@/db/schema";
import { ZOD_ERROR_CODES, ZOD_ERROR_MESSAGES } from "@/lib/constants";

import type { GetOneRoute, ListRoute } from "./policies.routes";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  console.log("list")

  const user = c.get("user") || { id: "1" }

  const policies = await db.select()
    .from(policiesTable)
    .where(
      eq(policiesTable.createdById, user.id)
    )

  return c.json(policies)
};


export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const user = c.get("user")
  const { id } = c.req.valid("param");

  const policy = await db.select()
    .from(policiesTable)
    .where(
      and(
        eq(policiesTable.createdById, user.id),
        eq(policiesTable.id, id)
      )
    )

  if (!policy) {
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return c.json(policy, HttpStatusCodes.OK);
};
