import * as HttpStatusCodes from "stoker/http-status-codes";

import type { AppRouteHandler } from "@/lib/types";

import { auth } from "@/lib/auth";

import type { CreateRoute } from "./check.routes";

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const key = c.req.header('x-api-key') || ""

  const { valid, error } = await auth.api.verifyApiKey({
    body: {
      key
    },
  });

  if (!valid || error) {
    return c.json({ message: "Invalid API key" }, HttpStatusCodes.UNAUTHORIZED);
  }

  // TODO: Send the data to the collector

  return c.json({ message: "Hello, world!" }, HttpStatusCodes.OK);
};

