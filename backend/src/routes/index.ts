import { Hono } from "hono";
import { cors } from "hono/cors";
import { healthRoute } from "./health-route";
import analyzeRouter from './analyze';
import tanzakuRouter from "./tanzaku";

export function createApp(): Hono {
  const app = new Hono();
  const corsOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:3000,http://127.0.0.1:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.use("/*", cors({
    origin: (origin) => corsOrigins.includes(origin) ? origin : corsOrigins[0],
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  }));

  app.route("/health", healthRoute);

  app.route('/api/analyze', analyzeRouter);
  app.route("/api/tanzaku", tanzakuRouter);

  return app;
}
