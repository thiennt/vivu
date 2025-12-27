import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import topicsRouter from './routes/topics.js';
import ttsRouter from './routes/tts.js';

const app = new Hono();

// Enable CORS for client
app.use('/*', cors({
  origin: (origin) => {
    // Allow same-origin requests (origin is undefined)
    if (!origin) return true;
    
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const allowedOrigins = [
      clientUrl,
      clientUrl.replace('localhost', '127.0.0.1')
    ];
    return allowedOrigins.includes(origin) ? origin : false;
  },
  credentials: false,
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
