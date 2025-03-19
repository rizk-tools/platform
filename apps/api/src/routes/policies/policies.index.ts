import createRouter from "@/lib/create-router";

import * as handlers from "./policies.handler";
import * as routes from "./policies.routes";

const router = createRouter()
  .openapi(routes.list, handlers.list)
  .openapi(routes.getOne, handlers.getOne);

export default router;