import { Hono } from 'hono';
import { GoogleGenAI } from '@google/genai';
import { createHash } from 'crypto';
import { writeFile, mkdir, access, readFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import 'dotenv/config';

import wav from 'wav';
import topicsData from '../data/topics.json' with { type: 'json' };
import puter from '@heyputer/puter.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = new Hono();

// Get API key from environment
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const PUTER_API_TOKEN = process.env.PUTER_API_TOKEN;
const DEFAULT_TTS_PROVIDER = process.env.TTS_PROVIDER || 'gemini';

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
 * Save PCM data as a .wav file using the wav package
 */
async function saveWaveFile(
  filename: string,
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const writer = new (wav as any).FileWriter(filename, {
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    writer.on('finish', resolve);
    writer.on('error', reject);

    writer.write(pcmData);
    writer.end();
  });
}

/**
 * Sanitize a string for use as a filename
 */
function sanitizeFilename(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\-_ ]+/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 64); // limit length
}

/**
 * Generate audio using Gemini API and save to .wav file
 * Accepts lessonTitle for filename, falls back to hash if not provided
 */
async function generateGeminiAudio(text: string, lessonTitle?: string): Promise<string> {
  if (!isValidApiKey(GEMINI_API_KEY)) {
    throw new Error('Gemini API key not configured');
  }


  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  // If the text is a single word, add a clear instruction to only generate audio
  let promptText = text;
  if (/^\w+$/.test(text)) {
    promptText = `Only generate audio for pronouncing this word, do not generate any text: ${text}`;
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-preview-tts',
    contents: [{ parts: [{ text: promptText }] }],
    config: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Puck' },
        },
      },
    },
  });

  // Extract audio data from response
  const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!data) {
    throw new Error('No audio data in response');
  }

  const audioBuffer = Buffer.from(data, 'base64');

  // Use sanitized lesson title for filename if provided, else fallback to hash
  let baseName = lessonTitle ? sanitizeFilename(lessonTitle) : hashText(text);
  if (!baseName) baseName = hashText(text);
  const filename = `${baseName}.wav`;
  const filepath = join(AUDIO_DIR, filename);
  await saveWaveFile(filepath, audioBuffer);
  return filename;
}

/**
 * Generate audio using Puter.js AI TTS and save to .wav file
 * Accepts lessonTitle for filename, falls back to hash if not provided
 */
async function generatePuterAudio(text: string, lessonTitle?: string): Promise<string> {
  // Authenticate with Puter if token is provided
  if (PUTER_API_TOKEN && isValidApiKey(PUTER_API_TOKEN)) {
    puter.setAuthToken(PUTER_API_TOKEN);
  }

  try {
    // Use Puter's AI text-to-speech
    const response = await puter.ai.txt2speech(text);
    
    // The response is already a Blob, convert to Buffer
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);

    // Use sanitized lesson title for filename if provided, else fallback to hash
    let baseName = lessonTitle ? sanitizeFilename(lessonTitle) : hashText(text);
    if (!baseName) baseName = hashText(text);
    const filename = `${baseName}.mp3`;
    const filepath = join(AUDIO_DIR, filename);
    
    // Save as MP3 file (Puter typically returns MP3)
    await writeFile(filepath, audioBuffer);
    return filename;
  } catch (error) {
    throw new Error(`Puter TTS error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate audio using the specified provider (or default)
 * Accepts lessonTitle for filename, falls back to hash if not provided
 */
async function generateAndSaveAudio(text: string, lessonTitle?: string, provider?: string): Promise<string> {
  const ttsProvider = provider || DEFAULT_TTS_PROVIDER;
  
  if (ttsProvider === 'puter') {
    return generatePuterAudio(text, lessonTitle);
  } else if (ttsProvider === 'gemini') {
    return generateGeminiAudio(text, lessonTitle);
  } else {
    throw new Error(`Invalid TTS provider: ${ttsProvider}. Use 'gemini' or 'puter'.`);
  }
}

/**
 * POST /api/tts/generate
 * Generate TTS audio from topicId, lessonId, and optional wordIndex
 */
router.post('/generate', async (c) => {
  try {
    const body = await c.req.json();
    const { topicId, lessonId, wordIndex, provider } = body;

    // Validate required parameters
    if (topicId === undefined || lessonId === undefined) {
      return c.json({ error: 'topicId and lessonId are required' }, 400);
    }

    // Validate that topicId and lessonId are valid numbers
    const numericTopicId = Number(topicId);
    const numericLessonId = Number(lessonId);
    
    if (!Number.isInteger(numericTopicId) || numericTopicId < 1) {
      return c.json({ error: 'topicId must be a positive integer' }, 400);
    }
    
    if (!Number.isInteger(numericLessonId) || numericLessonId < 1) {
      return c.json({ error: 'lessonId must be a positive integer' }, 400);
    }

    // Find topic
    const topic = topicsData.topics.find((t) => t.id === numericTopicId);
    if (!topic) {
      return c.json({ error: 'Topic not found' }, 404);
    }

    // Find lesson
    const lesson = topic.lessons.find((l) => l.id === numericLessonId);
    if (!lesson) {
      return c.json({ error: 'Lesson not found' }, 404);
    }

    // Determine text and filename based on wordIndex
    let text: string;
    let lessonTitle: string;
    let isSingleWord = false;

    if (wordIndex !== undefined && wordIndex !== null) {
      // Validate wordIndex
      const numericWordIndex = Number(wordIndex);
      
      if (!Number.isInteger(numericWordIndex) || numericWordIndex < 0) {
        return c.json({ error: 'wordIndex must be a non-negative integer' }, 400);
      }
      
      // Check bounds
      if (numericWordIndex >= lesson.vocabulary.length) {
        return c.json({ error: 'Vocabulary word not found' }, 404);
      }
      
      // Generate audio for a specific vocabulary word
      const vocab = lesson.vocabulary[numericWordIndex];
      text = vocab.word;
      // For single words, use just the word as the filename
      lessonTitle = sanitizeFilename(vocab.word);
      isSingleWord = true;
      isSingleWord = true;
    } else {
      // Generate audio for the entire lesson content
      text = lesson.content;
      lessonTitle = sanitizeFilename(lesson.title);
      isSingleWord = false;
    }

    // Determine TTS provider to use
    const ttsProvider = provider || DEFAULT_TTS_PROVIDER;
    
    // Determine file extension based on provider
    const fileExtension = ttsProvider === 'puter' ? '.mp3' : '.wav';
    
    // Use sanitized lesson title for filename
    let baseName = lessonTitle;
    if (!baseName) baseName = hashText(text);
    const filename = `${baseName}${fileExtension}`;
    const filepath = join(AUDIO_DIR, filename);

    // For provider-specific caching, check both extensions
    const mp3Filename = `${baseName}.mp3`;
    const wavFilename = `${baseName}.wav`;
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
        cached: true,
        provider: existingFilename.endsWith('.mp3') ? 'puter' : 'gemini'
      });
    }

    // Generate new audio with the specified provider
    const generatedFilename = await generateAndSaveAudio(text, lessonTitle, ttsProvider);

    return c.json({
      audioUrl: `/api/tts/audio/${generatedFilename}`,
      cached: false,
      provider: ttsProvider
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
  
  console.log(`Requesting audio file: ${filename} at path: ${filepath}`);

  try {
    await access(filepath);
    const audioBuffer = await readFile(filepath);
    
    console.log(`Serving audio file: ${filename}`, audioBuffer);

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
