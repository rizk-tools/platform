import createRouter from "@/lib/create-router";
import * as handlers from "./reports.handler";
import * as routes from "./reports.routes";

const router = createRouter()
  .openapi(routes.get, handlers.get)

export default router; 