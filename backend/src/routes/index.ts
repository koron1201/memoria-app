import { Hono } from "hono";
import { cors } from "hono/cors";
import { healthRoute } from "./health-route";

export function createApp(): Hono {
  const app = new Hono();
  const corsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:3000";

  app.use("/*", cors({ origin: corsOrigin }));

  app.route("/health", healthRoute);

  return app;
}
