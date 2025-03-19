import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { policiesTable } from "@/db/schema";
import createRouter from "@/lib/create-router";

const router = createRouter()

router.get("/", async (c) => {
  const user = c.get("user")

  const policies = await db.select()
    .from(policiesTable)
    .where(
      eq(policiesTable.createdById, user.id)
    )

  return c.json({
    data: policies,
    metadata: {
      total: policies.length
    }
  })
})

router.get("/:id", async (c) => {
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

  return c.json({
    data: policies
  })
})

export default router;