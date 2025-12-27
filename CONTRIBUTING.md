# Contributing to ViVu

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- Google Gemini API key ([Get one here](https://ai.google.dev/))

### Quick Start

1. **Clone and install**
   ```bash
   git clone <repository-url>
   cd vivu
   npm run install:all
   ```

2. **Configure environment**
   ```bash
   # Copy environment templates
   cp .env.example .env
   cp packages/backend/.env.example packages/backend/.env
   cp packages/client/.env.example packages/client/.env
   ```

3. **Set your Gemini API key**
   
   Edit `packages/backend/.env` and set:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```

4. **Start development**
   ```bash
   # Option 1: Use the helper script (Unix/Mac)
   ./dev.sh
   
   # Option 2: Start manually
   npm run dev
   
   # Option 3: Start separately
   npm run dev:backend  # In one terminal
   npm run dev:client   # In another terminal
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## Project Structure

```
vivu/
├── packages/
│   ├── backend/           # Hono API server
│   │   ├── src/
│   │   │   ├── data/     # JSON data files
│   │   │   ├── routes/   # API route handlers
│   │   │   └── index.ts  # Server entry point
│   │   └── audio/        # Generated audio files (gitignored)
│   └── client/           # SvelteKit frontend
│       └── src/
│           ├── lib/      # Utilities
│           └── routes/   # Page components
└── dev.sh               # Development helper script
```

## Development Workflow

### Backend Development

```bash
cd packages/backend
npm run dev
```

The backend uses:
- **Hono** for the API framework
- **TypeScript** for type safety
- **tsx** for hot reloading

#### Adding new API endpoints

1. Create a new route file in `src/routes/`
2. Import and register in `src/index.ts`

Example:
```typescript
// src/routes/my-route.ts
import { Hono } from 'hono';
const router = new Hono();
router.get('/example', (c) => c.json({ message: 'Hello' }));
export default router;

// src/index.ts
import myRouter from './routes/my-route.js';
app.route('/api/my-route', myRouter);
```

### Client Development

```bash
cd packages/client
npm run dev
```

The client uses:
- **SvelteKit** for the framework
- **Vite** for fast HMR

#### Adding new pages

Create files in `src/routes/`:
- `+page.svelte` - Page component
- `+page.server.js` - Server-side data loading
- `+layout.svelte` - Layout wrapper

## API Documentation

### Topics API

**GET /api/topics**
```json
{
  "topics": [...]
}
```

**GET /api/topics/:id**
```json
{
  "topic": {...}
}
```

**GET /api/topics/:id/lesson/:lessonId**
```json
{
  "topic": {...},
  "lesson": {...}
}
```

### TTS API

**POST /api/tts/generate**

Request:
```json
{
  "text": "Hello world"
}
```

Response:
```json
{
  "audioUrl": "/api/tts/audio/abc123.mp3",
  "cached": false
}
```

**GET /api/tts/audio/:filename**

Returns the audio file with appropriate headers.

## Testing

### Manual Testing

1. Start both servers
2. Navigate to http://localhost:5173
3. Click through topics and lessons
4. Test audio playback with voice icon

### API Testing

```bash
# Test topics endpoint
curl http://localhost:3000/api/topics

# Test specific topic
curl http://localhost:3000/api/topics/1

# Test TTS generation
curl -X POST http://localhost:3000/api/tts/generate \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello"}'
```

## Building for Production

```bash
# Build both packages
npm run build

# Or build individually
cd packages/backend && npm run build
cd packages/client && npm run build
```

## Common Issues

### Port already in use

If you see "Port 3000 is already in use":
```bash
# Find and kill the process
lsof -ti:3000 | xargs kill -9
```

### CORS errors

Make sure `CLIENT_URL` in backend `.env` matches your client URL.

### API key errors

Ensure `GEMINI_API_KEY` is set in `packages/backend/.env`

## Code Style

- Use TypeScript for backend code
- Follow existing file organization
- Use meaningful variable names
- Add comments for complex logic

## Submitting Changes

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request with clear description
