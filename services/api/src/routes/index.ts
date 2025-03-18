import { Variables } from "../types/hono";
import { Hono } from "hono";
import { db } from "../db";
import { policiesTable } from "../db/schema";
import { eq, and } from "drizzle-orm";

const app = new Hono<{ Variables: Variables }>()

app.get("/", async (c) => {
  const user = c.get("user")

  const policies = await db.select()
    .from(policiesTable)
    .where(
      eq(policiesTable.createdById, user.id)
    )

  return c.json({ data: policies, metadata: { total: policies.length } })
})

app.get("/:id", async (c) => {
  const user = c.get("user")
  const id = c.req.param("id")

  const policies = await db.select()
    .from(policiesTable)
    .where(
      and(
        eq(policiesTable.createdById, user.id),
        eq(policiesTable.id, id)
      )
    )

  return c.json({ data: policies })
})


export default app