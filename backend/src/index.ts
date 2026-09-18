import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serve } from '@hono/node-server'//Node.js用
import analyzeRouter from './routes/analyze';
import tanzakuRouter from './routes/tanzaku';

const app = new Hono()

const corsOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:3000,http://127.0.0.1:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use('/*', cors({
  origin: (origin) => corsOrigins.includes(origin) ? origin : corsOrigins[0],
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
}))

app.get('/health', (c) => c.json({ status: 'ok' }))
app.use('*', async (c, next) => {
  console.log(`📡 [LOG] 通信が届きました: ${c.req.method} ${c.req.url}`);
  await next();
});

app.route('/api/analyze', analyzeRouter);
app.route('/api/tanzaku', tanzakuRouter);

export default {
  port: 3001,
  hostname: '0.0.0.0',
  fetch: app.fetch,
}

// ここで「この設定でサーバーを起動せよ」と命令する!!
serve({
  fetch: app.fetch,
  port: 3001,
  hostname: '0.0.0.0'
})
