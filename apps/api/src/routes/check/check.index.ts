import createRouter from "@/lib/create-router";
import * as handlers from "./check.handler";
import * as routes from "./check.routes";

const router = createRouter()
  .openapi(routes.create, handlers.create)

export default router; 