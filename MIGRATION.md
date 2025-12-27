# Migration Summary: Monorepo Restructure

## Overview
This document summarizes the changes made to restructure the ViVu codebase from a single SvelteKit application to a monorepo architecture with separate backend and client packages.

## Major Changes

### 1. Monorepo Structure
- **Before**: Single package with SvelteKit handling both frontend and backend
- **After**: Monorepo with two packages:
  - `packages/backend`: Hono-based API server
  - `packages/client`: SvelteKit frontend application

### 2. Backend Changes

#### New Backend Package (`packages/backend`)
- **Framework**: Hono (lightweight, fast HTTP framework)
- **Language**: TypeScript
- **Port**: 3000 (default)

#### API Endpoints Created:
1. **Topics API**:
   - `GET /api/topics` - Get all topics
   - `GET /api/topics/:id` - Get specific topic
   - `GET /api/topics/:id/lesson/:lessonId` - Get specific lesson

2. **TTS (Text-to-Speech) API**:
   - `POST /api/tts/generate` - Generate audio from text
   - `GET /api/tts/audio/:filename` - Serve audio files

#### Data Migration:
- `src/lib/data/topics.json` → `packages/backend/src/data/topics.json`
- Topics data now served via API instead of direct import

#### TTS Implementation:
- **Before**: Client-side audio generation using Gemini API
- **After**: Server-side audio generation and file storage
  - Audio files stored in `packages/backend/audio/` directory
  - Files cached based on text hash for efficiency
  - Audio served directly from backend

### 3. Client Changes

#### Updated to API-based Data Fetching:
- **Before**: Direct JSON imports
- **After**: HTTP requests to backend API

Modified files:
- `src/routes/+page.server.js` - Fetch topics from API
- `src/routes/topic/[id]/+page.server.js` - Fetch topic from API
- `src/routes/topic/[id]/lesson/[lessonId]/+page.server.js` - Fetch lesson from API

#### New TTS Client:
- Created `src/lib/tts-client.js` for backend TTS communication
- **Before**: `getSpeechAndCache()` with client-side generation
- **After**: `generateSpeech()` calling backend API

Removed files:
- `src/lib/tts.js` - Old client-side TTS logic
- `src/routes/api/tts-config/+server.js` - API key exposure endpoint
- `src/lib/data/topics.json` - Moved to backend

#### Updated Lesson Component:
- Removed `@google/genai` dependency from client
- Simplified audio playback (no more object URL management)
- Audio now loaded directly from backend URLs

### 4. Configuration Changes

#### Root Package.json:
```json
{
  "workspaces": ["packages/*"],
  "scripts": {
    "dev": "npm run dev --workspace=packages/backend & npm run dev --workspace=packages/client",
    "dev:backend": "npm run dev --workspace=packages/backend",
    "dev:client": "npm run dev --workspace=packages/client",
    "build": "npm run build --workspaces"
  }
}
```

#### Environment Variables:
**Backend** (`packages/backend/.env`):
- `GEMINI_API_KEY` - Gemini API key for TTS
- `PORT` - Server port (default: 3000)
- `CLIENT_URL` - Client URL for CORS

**Client** (`packages/client/.env`):
- `VITE_BACKEND_URL` - Backend API URL for browser requests
- `BACKEND_URL` - Backend URL for server-side requests

### 5. New Documentation

#### Files Added:
1. **README.md** - Updated with monorepo architecture
2. **CONTRIBUTING.md** - Comprehensive development guide
3. **dev.sh** - Helper script to start both servers

### 6. Security Improvements

- **Before**: API key exposed to client browser
- **After**: API key kept server-side only
- CORS configured for client-server communication

### 7. Performance Improvements

- **Audio Caching**: Files stored on disk instead of browser cache
- **Server-side Generation**: Reduces client-side processing
- **Reusable Audio**: Same text generates same filename (hash-based)

## Migration Benefits

1. **Separation of Concerns**: Clear boundary between frontend and backend
2. **Scalability**: Backend and client can be deployed independently
3. **Security**: API keys and sensitive logic stay on server
4. **Performance**: Server-side audio generation and caching
5. **Maintainability**: Clearer project structure
6. **Type Safety**: TypeScript backend with proper types

## File Structure Comparison

### Before:
```
vivu/
├── src/
│   ├── lib/
│   │   ├── data/topics.json
│   │   └── tts.js
│   └── routes/
│       ├── api/tts-config/+server.js
│       ├── +page.server.js
│       └── topic/[id]/...
├── package.json
└── svelte.config.js
```

### After:
```
vivu/
├── packages/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── data/topics.json
│   │   │   ├── routes/
│   │   │   │   ├── topics.ts
│   │   │   │   └── tts.ts
│   │   │   └── index.ts
│   │   └── package.json
│   └── client/
│       ├── src/
│       │   ├── lib/tts-client.js
│       │   └── routes/
│       │       ├── +page.server.js
│       │       └── topic/[id]/...
│       └── package.json
├── package.json (workspace root)
├── README.md
├── CONTRIBUTING.md
└── dev.sh
```

## Testing Checklist

- [x] Backend API endpoints respond correctly
- [x] Topics data loads from backend API
- [x] Client displays topics correctly
- [x] TTS endpoint accepts requests
- [x] Error handling works (invalid API key)
- [x] CORS configured properly
- [x] Both servers start successfully
- [x] Environment variables handled correctly

## Next Steps for Users

1. Clone the repository
2. Run `npm run install:all`
3. Configure `.env` files with Gemini API key
4. Run `./dev.sh` or `npm run dev`
5. Access http://localhost:5173

## Breaking Changes

- Direct JSON imports no longer work
- Client code must use backend API
- Environment variables structure changed
- Different startup commands
