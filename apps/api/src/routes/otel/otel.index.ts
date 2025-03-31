import createRouter from "@/lib/create-router";
import * as routes from "./otel.routes";
import * as handlers from "./otel.handler";

const router = createRouter();

// Register OpenTelemetry routes
router.openapi(routes.traces, handlers.traces);
router.openapi(routes.logs, handlers.logs);
router.openapi(routes.metrics, handlers.metrics);

export default router; 