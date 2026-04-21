import { Hono } from "hono";
import { cors } from "hono/cors";
import { healthRoute } from "./health-route";
import analyzeRouter from './analyze';

export function createApp(): Hono {
  const app = new Hono();
  const corsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:3000";

  app.use("/*", cors({ origin: corsOrigin }));

  app.route("/health", healthRoute);

  app.route('/api/analyze', analyzeRouter);

  return app;
}
