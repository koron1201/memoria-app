import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serve } from '@hono/node-server'//Node.js用

const app = new Hono()

app.use('/*', cors({
  origin: 'http://localhost:3000',
}))

app.get('/health', (c) => c.json({ status: 'ok' }))

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
