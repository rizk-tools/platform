import createRouter from "@/lib/create-router";
import * as handlers from "./monitoring.handler";
import * as routes from "./monitoring.routes";

const router = createRouter()
  .openapi(routes.listTraces, handlers.listTraces)
  .openapi(routes.listMetrics, handlers.listMetrics);

export default router; 