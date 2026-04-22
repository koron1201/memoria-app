import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serve } from '@hono/node-server'//Node.js用
import analyzeRouter from './routes/analyze';

const app = new Hono()

app.use('/*', cors({
  origin: 'http://localhost:3000',
}))

app.get('/health', (c) => c.json({ status: 'ok' }))
app.use('*', async (c, next) => {
  console.log(`📡 [LOG] 通信が届きました: ${c.req.method} ${c.req.url}`);
  await next();
});

app.route('/api/analyze', analyzeRouter);

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
