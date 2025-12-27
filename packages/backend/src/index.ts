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
    const allowedOrigins = [clientUrl];
    
    // If CLIENT_URL uses localhost or 127.0.0.1, also allow the alternative
    try {
      const url = new URL(clientUrl);
      if (url.hostname === 'localhost') {
        url.hostname = '127.0.0.1';
        allowedOrigins.push(url.toString().replace(/\/$/, ''));
      } else if (url.hostname === '127.0.0.1') {
        url.hostname = 'localhost';
        allowedOrigins.push(url.toString().replace(/\/$/, ''));
      }
    } catch (e) {
      // If URL parsing fails, just use the original clientUrl
    }
    
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
