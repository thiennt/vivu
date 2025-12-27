import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import topicsRouter from './routes/topics.js';
import ttsRouter from './routes/tts.js';

const app = new Hono();

// Enable CORS for client
app.use('/*', cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Routes
app.route('/api/topics', topicsRouter);
app.route('/api/tts', ttsRouter);

// Health check
app.get('/health', (c) => c.json({ status: 'ok' }));

const port = Number(process.env.PORT) || 3000;

console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port
});
