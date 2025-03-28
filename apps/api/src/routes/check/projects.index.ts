import createRouter from "@/lib/create-router";
import * as handlers from "./projects.handler";
import * as routes from "./projects.routes";

const router = createRouter()
  .openapi(routes.create, handlers.create)

export default router; 