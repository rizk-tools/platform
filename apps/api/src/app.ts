import createApp from "@/lib/create-app";
import { registerRoutes } from "@/routes";

console.log("Starting server...");

const app = registerRoutes(createApp());

export default {
  port: 3001,
  fetch: app.fetch,
} 
