import * as HttpStatusCodes from "stoker/http-status-codes";
import type { AppRouteHandler } from "@/lib/types";
import { db } from "@/db";
import { session } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import clickhouse from "@/lib/clickhouse";
import { opentelemetry } from "@/generated/otlp";
import type { ListResponsesRoute } from "./monitoring.routes";
import type { ResponseJSONResult } from "stoker/clickhouse";
// Define the return type structure to match the schema
type TelemetryResponse = {
  id: string;
  attributes: Record<string, string | number | boolean | string[] | number[] | boolean[]>;
  resourceAttributes: Record<string, string | number | boolean | string[] | number[] | boolean[]>;
  scope: { name: string };
  raw?: any;
};

export const listResponses: AppRouteHandler<ListResponsesRoute> = async (c) => {
  const user = c.get("user");

  // If no user is logged in, return unauthorized error
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
        LIMIT 100`

    // Query ClickHouse for monitoring data filtered by organization ID
    const result = await clickhouse.query({
      query,
      format: "JSON",
    });

    type Result = {
      meta: any;
      data: any;
    }

    // Convert the result to an array
    const resultRows = (await result.json()) as ResponseJSONResult<Result>;
    console.log(resultRows);


    const rows = resultRows.data.map((row: any) => {
      return JSON.parse(JSON.stringify(row.data))
    })



    // If no data found, return empty array
    if (rows.length === 0) {
      console.log("No monitoring data found for organization", activeOrganizationId);
      return c.json([], HttpStatusCodes.OK);
    }

    // Return data with minimal transformation
    const responses: TelemetryResponse[] = [];

    for (const row of rows) {
      try {
        if (!row.data) continue;

        // Parse the raw data from ClickHouse
        const parsedData = JSON.parse(row.data);

        responses.push({
          // Ensure ID is always a string
          id: row.id ? String(row.id) : String(Math.random()),
          // Default empty objects for these fields to match schema
          attributes: {},
          resourceAttributes: {},
          scope: { name: "" },
          // Include all the original data
          raw: parsedData
        });
      } catch (e) {
        console.error("Error processing row:", row.id, e);
      }
    }

    // If we couldn't process any rows properly, return empty array
    if (responses.length === 0) {
      return c.json([], HttpStatusCodes.OK);
    }

    return c.json(responses, HttpStatusCodes.OK);
  } catch (error) {
    console.error("Error fetching monitoring data:", error);
    return c.json({ error: "Failed to fetch monitoring data" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Helper function to convert OpenTelemetry KeyValue attributes to a simple object
 */
function convertKeyValuePairs (attributes: any[]): Record<string, any> {
  if (!Array.isArray(attributes)) return {};

  const result: Record<string, any> = {};

  for (const attr of attributes) {
    if (!attr || !attr.key) continue;

    // Handle different value types
    if (attr.value) {
      if (attr.value.stringValue !== undefined) {
        result[attr.key] = attr.value.stringValue;
      } else if (attr.value.boolValue !== undefined) {
        result[attr.key] = attr.value.boolValue;
      } else if (attr.value.intValue !== undefined) {
        result[attr.key] = attr.value.intValue;
      } else if (attr.value.doubleValue !== undefined) {
        result[attr.key] = attr.value.doubleValue;
      } else if (attr.value.arrayValue !== undefined && attr.value.arrayValue.values) {
        result[attr.key] = attr.value.arrayValue.values.map((v: any) => {
          if (v.stringValue !== undefined) return v.stringValue;
          if (v.intValue !== undefined) return v.intValue;
          if (v.doubleValue !== undefined) return v.doubleValue;
          if (v.boolValue !== undefined) return v.boolValue;
          return null;
        }).filter(Boolean);
      }
    }
  }

  return result;
} 