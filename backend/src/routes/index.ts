import { Hono } from "hono";
import { cors } from "hono/cors";
import { healthRoute } from "./health-route";
import analyzeRouter from './analyze';
import authRouter from './auth';       // 両方残す！
import tanzakuRouter from "./tanzaku"; // 両方残す！

export function createApp(): Hono {
  const app = new Hono();
  const corsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:3000";

  app.use("/*", cors({ origin: corsOrigin }));

  app.route("/health", healthRoute);

  app.route('/api/analyze', analyzeRouter);
  app.route('/api/auth', authRouter);       // 両方登録する！
  app.route("/api/tanzaku", tanzakuRouter); // 両方登録する！

  return app;
}