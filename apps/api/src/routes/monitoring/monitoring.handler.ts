import * as HttpStatusCodes from "stoker/http-status-codes";
import type { AppRouteHandler } from "@/lib/types";
import { db } from "@/db";
import { session } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import clickhouse from "@/lib/clickhouse";
import type { ListResponsesRoute } from "./monitoring.routes";

// Define types for database row
type ClickhouseRow = {
  tenant_id: string;
  timestamp: string;
  data: string;
};

export const listResponses: AppRouteHandler<ListResponsesRoute> = async (c) => {
  const user = c.get("user");

  if (!user) {
    return c.json({ error: "Unauthorized" }, HttpStatusCodes.UNAUTHORIZED);
  }

  try {
    // Get the user's active session to find the organization ID
    const sessions = await db
      .select()
      .from(session)
      .where(eq(session.userId, user.id))
      .orderBy(desc(session.updatedAt))
      .limit(1);

    const activeOrganizationId = sessions[0]?.activeOrganizationId;

    if (!activeOrganizationId) {
      return c.json({ error: "No active organization found" }, HttpStatusCodes.BAD_REQUEST);
    }

    const query = `SELECT tenant_id, timestamp, data
        FROM traces_raw
        WHERE tenant_id = '${activeOrganizationId}'
        ORDER BY timestamp DESC
        LIMIT 100`;

    // Query ClickHouse for monitoring data
    const result = await clickhouse.query({
      query,
      format: "JSON",
    });

    type Result = {
      meta: any;
      data: ClickhouseRow[];
    }

    const resultRows = (await result.json()) as Result;

    if (!resultRows.data || resultRows.data.length === 0) {
      console.log("No monitoring data found for organization", activeOrganizationId);
      return c.json([], HttpStatusCodes.OK);
    }

    // Extract only the data field from each row
    const dataOnly = resultRows.data.map((row: ClickhouseRow) => JSON.parse(row.data));
    return c.json(dataOnly, HttpStatusCodes.OK);
  } catch (error) {
    console.error("Error fetching monitoring data:", error);
    return c.json({ error: "Failed to fetch monitoring data" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};