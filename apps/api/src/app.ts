import createApp from "@/lib/create-app";
import { registerRoutes } from "@/routes";

const app = registerRoutes(createApp());

export default {
  port: 3001,
  fetch: app.fetch,
} 
