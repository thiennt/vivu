import { Hono } from 'hono';
import { GoogleGenAI } from '@google/genai';
import { createHash } from 'crypto';
import { writeFile, mkdir, access, readFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = new Hono();

// Get API key from environment
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Audio storage directory
const AUDIO_DIR = join(__dirname, '../../audio');

// Ensure audio directory exists
async function ensureAudioDir() {
  try {
    await access(AUDIO_DIR);
  } catch {
    await mkdir(AUDIO_DIR, { recursive: true });
  }
}

// Initialize audio directory
ensureAudioDir();

/**
 * Generate a hash for the text to use as filename
 */
function hashText(text: string): string {
  return createHash('sha256').update(text).digest('hex');
}

/**
 * Validate if API key is properly configured
 */
function isValidApiKey(key: string | undefined): boolean {
  if (!key) return false;
  const invalidKeys = ['your_api_key_here', 'test_key_here', 'YOUR_API_KEY', ''];
  return !invalidKeys.includes(key) && key.length > 10;
}

/**
 * Generate audio using Gemini API and save to file
 */
async function generateAndSaveAudio(text: string): Promise<string> {
  if (!isValidApiKey(GEMINI_API_KEY)) {
    throw new Error('Gemini API key not configured');
  }

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-preview-tts',
    contents: [{ role: 'user', parts: [{ text }] }],
    config: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: { 
          prebuiltVoiceConfig: { voiceName: 'Puck' } 
        }
      }
    }
  });

  // Extract audio data from response
  const audioPart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
  if (!audioPart || !audioPart.inlineData) {
    throw new Error('No audio data in response');
  }

  const base64Data = audioPart.inlineData.data;
  const mimeType = audioPart.inlineData.mimeType; // Usually audio/mp3 or audio/wav
  
  // Convert Base64 to Buffer
  const audioBuffer = Buffer.from(base64Data, 'base64');
  
  // Determine file extension from mime type
  const extension = mimeType.includes('mp3') ? 'mp3' : 'wav';
  const textHash = hashText(text);
  const filename = `${textHash}.${extension}`;
  const filepath = join(AUDIO_DIR, filename);
  
  // Save audio file
  await writeFile(filepath, audioBuffer);
  
  return filename;
}

/**
 * POST /api/tts/generate
 * Generate TTS audio from text
 */
router.post('/generate', async (c) => {
  try {
    const body = await c.req.json();
    const { text } = body;
    
    if (!text) {
      return c.json({ error: 'Text is required' }, 400);
    }
    
    // Check if audio already exists
    const textHash = hashText(text);
    const mp3Filename = `${textHash}.mp3`;
    const wavFilename = `${textHash}.wav`;
    const mp3Path = join(AUDIO_DIR, mp3Filename);
    const wavPath = join(AUDIO_DIR, wavFilename);
    
    // Check if file exists (try both extensions)
    let existingFilename: string | null = null;
    try {
      await access(mp3Path);
      existingFilename = mp3Filename;
    } catch {
      try {
        await access(wavPath);
        existingFilename = wavFilename;
      } catch {
        // File doesn't exist, continue to generate
      }
    }
    
    if (existingFilename) {
      // Return existing audio URL
      return c.json({ 
        audioUrl: `/api/tts/audio/${existingFilename}`,
        cached: true
      });
    }
    
    // Generate new audio
    const filename = await generateAndSaveAudio(text);
    
    return c.json({ 
      audioUrl: `/api/tts/audio/${filename}`,
      cached: false
    });
    
  } catch (error) {
    console.error('TTS generation error:', error);
    return c.json({ 
      error: error instanceof Error ? error.message : 'Failed to generate audio' 
    }, 500);
  }
});

/**
 * GET /api/tts/audio/:filename
 * Serve audio file
 */
router.get('/audio/:filename', async (c) => {
  const filename = c.req.param('filename');
  const filepath = join(AUDIO_DIR, filename);
  
  try {
    await access(filepath);
    const audioBuffer = await readFile(filepath);
    
    // Serve the audio file
    return c.body(audioBuffer, 200, {
      'Content-Type': filename.endsWith('.mp3') ? 'audio/mpeg' : 'audio/wav',
      'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
    });
  } catch {
    return c.json({ error: 'Audio file not found' }, 404);
  }
});

export default router;
