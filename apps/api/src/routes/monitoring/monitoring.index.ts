import createRouter from "@/lib/create-router";
import * as handlers from "./monitoring.handler";
import * as routes from "./monitoring.routes";

const router = createRouter()
  .openapi(routes.listResponses, handlers.listResponses);

export default router; 