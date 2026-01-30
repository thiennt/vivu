# ViVu - English Learning Platform

A monorepo-based English learning platform with a Hono backend API and SvelteKit frontend.

## Architecture

This project is structured as a monorepo with two main packages and supports two TTS (Text-to-Speech) providers:

```
┌─────────────────────────────────────────────────────────────────────┐
│                          ViVu Application                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────┐              ┌──────────────────┐             │
│  │                 │              │                  │             │
│  │  Client (5173)  │◄────────────►│  Backend (3000)  │             │
│  │   SvelteKit     │    HTTP      │      Hono        │             │
│  │   + Puter.js    │              │                  │             │
│  └─────────────────┘              └──────────────────┘             │
│         │                                  │                        │
│         │  (Puter.js Flow)                 │ (Gemini Flow)          │
│         │  Client-Side TTS                 │ Server-Side TTS        │
│         │                                  │                        │
│         │                                  ▼                        │
│         │                         ┌───────────────┐                 │
│         │                         │  Gemini API   │                 │
│         │                         │     (TTS)     │                 │
│         │                         └───────────────┘                 │
│         ▼                                  │                        │
│  ┌─────────────┐                           │                        │
│  │  Puter.js   │                           │                        │
│  │  TTS API    │                           │                        │
│  └─────────────┘                           │                        │
│         │                                  │                        │
│         │    Upload for caching            │                        │
│         └──────────────┬───────────────────┘                        │
│                        ▼                                            │
│                ┌───────────────┐                                    │
│                │ Audio Files   │                                    │
│                │   (cached)    │                                    │
│                └───────────────┘                                    │
│                        │                                            │
│                        ▼                                            │
│                 Plays in Browser                                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Components:

- **Backend** (`packages/backend`): Hono-based API server that handles:
  - Topic and lesson data management
  - Text-to-speech (TTS) generation using Google Gemini API (server-side)
  - Audio file storage, caching, and serving
  - Audio file upload endpoint for client-side generated audio
  
- **Client** (`packages/client`): SvelteKit-based frontend application
  - Fetches data from backend API
  - Supports two TTS providers:
    - **Gemini (Server-Side)**: Traditional backend TTS generation
    - **Puter.js (Client-Side)**: Browser-based TTS generation with backend caching
  - Provider selection via dropdown UI
  - Responsive UI for learning experience

## TTS Providers

### Gemini (Server-Side)
Traditional flow where backend generates audio:
1. Client requests audio from backend
2. Backend generates audio using Gemini API
3. Backend caches and returns audio URL
4. Client plays audio

### Puter.js (Client-Side)
Client-side generation with smart caching:
1. Client checks if audio exists on backend
2. If not, generates audio in browser using Puter.js
3. Uploads generated audio to backend for caching
4. Plays audio from backend URL

## Prerequisites

- Node.js 18+ and npm
- **For Gemini TTS**: Google Gemini API key ([Get one here](https://ai.google.dev/))
- **For Puter.js TTS** (optional): Puter API token ([Get one here](https://puter.com/))

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vivu
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Configure environment variables**
   
   Copy the `.env.example` file to `.env` in the root directory:
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env` and configure your TTS provider(s):
   ```
   # Required for Gemini TTS provider
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   
   # Optional for Puter.js TTS provider
   PUTER_API_TOKEN=your_actual_puter_token_here
   
   # Optional: Set default TTS provider (gemini or puter)
   VITE_DEFAULT_TTS_PROVIDER=gemini
   ```
   
   **Note**: You can use either or both providers. If you only configure one, that provider will be available in the UI.

4. **Start development servers**
   
   To start both backend and client:
   ```bash
   npm run dev
   ```
   
   Or start them separately:
   ```bash
   # Start backend only (runs on port 3000)
   npm run dev:backend
   
   # Start client only (runs on port 5173)
   npm run dev:client
   ```

## Project Structure

```
vivu/
├── packages/
│   ├── backend/                # Hono backend API
│   │   ├── src/
│   │   │   ├── data/          # Topics JSON data
│   │   │   ├── routes/        # API routes
│   │   │   │   ├── topics.ts  # Topics API
│   │   │   │   └── tts.ts     # TTS API
│   │   │   └── index.ts       # Server entry point
│   │   ├── audio/             # Generated audio files (gitignored)
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── client/                # SvelteKit frontend
│       ├── src/
│       │   ├── lib/           # Shared utilities
│       │   │   ├── tts-client.js      # TTS client API
│       │   │   └── tts-providers.js   # TTS provider implementations
│       │   └── routes/        # SvelteKit routes
│       ├── package.json
│       ├── svelte.config.js
│       └── vite.config.js
├── package.json               # Root workspace configuration
└── README.md
```

## Features

- 📚 Topic-based English learning with lessons
- 🎧 **Dual TTS providers**: Choose between Gemini (server-side) or Puter.js (client-side)
- 🔊 Individual word pronunciation with smart filename generation
- 💾 Intelligent audio caching for both providers
- 🎛️ Provider selection via dropdown UI
- 🎨 Clean, responsive UI with SvelteKit
- 🏗️ Monorepo architecture with clear separation of concerns

## API Endpoints

### Backend API (http://localhost:3000)

- **GET /api/topics** - Get all topics
- **GET /api/topics/:id** - Get a specific topic
- **GET /api/topics/:id/lesson/:lessonId** - Get a specific lesson
- **POST /api/tts/generate** - Generate audio using Gemini (server-side)
  - Body: `{ "topicId": 1, "lessonId": 1 }`
  - Returns: `{ "audioUrl": "/api/tts/audio/filename.wav", "cached": boolean }`
- **GET /api/tts/check/:filename** - Check if audio file exists
  - Returns: `{ "exists": boolean, "audioUrl": string, "format": string }`
- **POST /api/tts/upload** - Upload client-generated audio for caching
  - Body: `{ "filename": "lesson_title", "audioData": "base64...", "format": "mp3" }`
  - Returns: `{ "success": true, "audioUrl": "/api/tts/audio/filename.mp3", "format": "mp3" }`
- **GET /api/tts/audio/:filename** - Serve audio file

## Development

### Backend Development

```bash
cd packages/backend
npm run dev
```

The backend uses TypeScript and tsx for hot reloading.

### Client Development

```bash
cd packages/client
npm run dev
```

The client uses Vite for fast HMR (Hot Module Replacement).

## Building for Production

This project uses [Turborepo](https://turbo.build/) for efficient builds and caching.

```bash
# Build both packages using Turborepo
npm run build

# Or build individually
cd packages/backend && npm run build
cd packages/client && npm run build
```

## Deploying to Vercel

This project is optimized for deployment on [Vercel](https://vercel.com) using Turborepo.

### Prerequisites

1. A [Vercel account](https://vercel.com/signup)
2. The [Vercel CLI](https://vercel.com/docs/cli) installed (optional, for local testing)

### Deployment Steps

1. **Connect your repository to Vercel**
   - Go to [Vercel](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   
2. **Configure Environment Variables**
   
   In your Vercel project settings, add the following environment variables:
   
   **Required for Gemini TTS:**
   - `GEMINI_API_KEY` - Your Google Gemini API key
   
   **Optional for Puter.js TTS:**
   - `PUTER_API_TOKEN` - Your Puter API token
   - `VITE_PUTER_API_TOKEN` - Your Puter API token for client-side authentication
   
   **Other settings:**
   - `VITE_DEFAULT_TTS_PROVIDER` - Set to `gemini` or `puter` (default: `gemini`)
   - `VITE_BACKEND_URL` - Your backend API URL (if deploying backend separately)

3. **Deploy**
   
   The project will automatically build and deploy. The SvelteKit Vercel adapter (`@sveltejs/adapter-vercel`) handles the build configuration automatically.
   
   - The adapter detects and configures the build process for Vercel
   - Turborepo manages the monorepo build orchestration
   - No manual build/output directory configuration is needed

### Note on Backend Deployment

The current Vercel configuration is set up to deploy the SvelteKit frontend. If you need to deploy the backend API separately, consider:

- Using Vercel Serverless Functions
- Deploying the backend to a separate service (e.g., Railway, Render, or another Vercel project)
- Updating the `VITE_BACKEND_URL` environment variable to point to your backend deployment

## Environment Variables

### Backend
- `GEMINI_API_KEY` - Your Google Gemini API key (required for Gemini provider)
- `PUTER_API_TOKEN` - Your Puter API token (optional, for Puter.js provider)
- `PORT` - Backend server port (default: 3000)
- `ALLOWED_ORIGINS` - Allowed CORS origins (default: http://localhost:5173,http://127.0.0.1:5173)

### Client
- `VITE_BACKEND_URL` - Backend API URL (default: http://localhost:3000)
- `BACKEND_URL` - Backend URL for server-side requests (default: http://localhost:3000)
- `VITE_DEFAULT_TTS_PROVIDER` - Default TTS provider: `gemini` or `puter` (default: gemini)
- `VITE_PUTER_API_TOKEN` - Puter API token for client-side authentication (optional)

## TTS Provider Integration

### Gemini API (Server-Side)

This application uses Google's Gemini API for server-side speech generation as documented at:
https://ai.google.dev/gemini-api/docs/speech-generation

The Gemini implementation:
- Uses the `gemini-2.5-flash-preview-tts` model with audio generation capabilities
- Configures the `Puck` voice for natural-sounding English pronunciation
- Generates audio on the backend server
- Stores generated audio files for efficient caching
- Serves audio files directly from the backend

### Puter.js API (Client-Side)

Puter.js provides client-side text-to-speech generation:
https://puter.com/

The Puter.js implementation:
- Generates audio directly in the browser using `@heyputer/puter.js`
- Checks backend cache before generating
- Uploads generated audio to backend for future caching
- Enables TTS without requiring server-side API keys
- Falls back gracefully if Puter API is unavailable

### Audio Filename Strategy

- **Single words**: Uses the word itself as filename (e.g., `hello.wav`)
- **Lesson content**: Uses sanitized lesson title (e.g., `hello_and_goodbye.wav`)
- **Benefits**: Human-readable filenames, better caching, easier debugging

## License

MIT
