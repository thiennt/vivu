# ViVu - English Learning Application

An interactive English learning application built with SvelteKit that uses Google's Gemini API for speech generation.

## Features

- Interactive English lessons organized by topics
- Text-to-speech using Google's Gemini API
- Individual word pronunciation
- Vocabulary with IPA phonetic transcriptions
- Vietnamese translations
- Audio caching for better performance

## Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd vivu
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Add your Gemini API key to `.env`:
     ```
     GEMINI_API_KEY=your_actual_api_key_here
     ```
   - Get your API key from: https://ai.google.dev/

4. Run the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

## Gemini API Integration

This application uses Google's Gemini API for speech generation as documented at:
https://ai.google.dev/gemini-api/docs/speech-generation

The implementation:
- Uses the `gemini-2.0-flash-exp` model with audio generation capabilities
- Configures the `Puck` voice for natural-sounding English pronunciation
- Falls back to browser's native text-to-speech if API key is not configured
- Caches generated audio in localStorage for better performance

### Audio Generation Features

- **Lesson Audio**: Generates audio for entire lesson vocabulary
- **Word Pronunciation**: Individual word pronunciation on click
- **Graceful Fallback**: Uses browser TTS if Gemini API is unavailable
- **Error Handling**: Comprehensive error handling with user-friendly messages

## Development

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

## Project Structure

```
src/
├── routes/
│   ├── api/
│   │   └── generate-audio/
│   │       └── +server.js          # Gemini API integration
│   ├── topic/
│   │   └── [id]/
│   │       ├── lesson/
│   │       │   └── [lessonId]/
│   │       │       └── +page.svelte # Lesson page with audio
│   │       └── +page.svelte         # Topic overview
│   ├── +page.svelte                 # Home page
│   └── +layout.svelte               # App layout
└── lib/
    └── data/
        └── topics.json              # Lesson data

```

## Environment Variables

- `GEMINI_API_KEY`: Your Google Gemini API key (required for speech generation)

Without the API key, the application will fall back to using the browser's built-in text-to-speech functionality.

## License

[Your License Here]
