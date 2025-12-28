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


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = new Hono();

// Get API key from environment
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
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
 * Generate audio using Gemini (backend-only TTS generation)
 * Accepts lessonTitle for filename, falls back to hash if not provided
 */
async function generateAndSaveAudio(text: string, lessonTitle?: string): Promise<string> {
  return generateGeminiAudio(text, lessonTitle);
}

/**
 * POST /api/tts/generate
 * Generate TTS audio from topicId, lessonId, and optional wordIndex using Gemini
 * Note: This endpoint only supports Gemini. Puter TTS is handled client-side.
 */
router.post('/generate', async (c) => {
  try {
    const body = await c.req.json();
    const { topicId, lessonId, wordIndex } = body;

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
    } else {
      // Generate audio for the entire lesson content
      text = lesson.content;
      lessonTitle = sanitizeFilename(lesson.title);
    }

    // Use sanitized lesson title for filename (Gemini always uses .wav)
    let baseName = lessonTitle;
    if (!baseName) baseName = hashText(text);
    const filename = `${baseName}.wav`;
    const filepath = join(AUDIO_DIR, filename);

    // Check if file exists
    try {
      await access(filepath);
      // Return existing audio URL
      return c.json({
        audioUrl: `/api/tts/audio/${filename}`,
        cached: true
      });
    } catch {
      // File doesn't exist, continue to generate
    }

    // Generate new audio with Gemini
    const generatedFilename = await generateAndSaveAudio(text, lessonTitle);

    return c.json({
      audioUrl: `/api/tts/audio/${generatedFilename}`,
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

/**
 * POST /api/tts/check
 * Check if audio file exists for given parameters
 */
router.post('/check', async (c) => {
  try {
    const body = await c.req.json();
    const { topicId, lessonId, wordIndex, provider } = body;

    // Validate required parameters
    if (topicId === undefined || lessonId === undefined) {
      return c.json({ exists: false }, 200);
    }

    const numericTopicId = Number(topicId);
    const numericLessonId = Number(lessonId);

    // Find topic and lesson
    const topic = topicsData.topics.find((t) => t.id === numericTopicId);
    if (!topic) {
      return c.json({ exists: false }, 200);
    }

    const lesson = topic.lessons.find((l) => l.id === numericLessonId);
    if (!lesson) {
      return c.json({ exists: false }, 200);
    }

    // Determine filename based on wordIndex
    let lessonTitle: string;
    if (wordIndex !== undefined && wordIndex !== null) {
      const numericWordIndex = Number(wordIndex);
      if (numericWordIndex >= 0 && numericWordIndex < lesson.vocabulary.length) {
        const vocab = lesson.vocabulary[numericWordIndex];
        lessonTitle = sanitizeFilename(vocab.word);
      } else {
        return c.json({ exists: false }, 200);
      }
    } else {
      lessonTitle = sanitizeFilename(lesson.title);
    }

    // Check for both .mp3 and .wav files
    const mp3Filename = `${lessonTitle}.mp3`;
    const wavFilename = `${lessonTitle}.wav`;
    const mp3Path = join(AUDIO_DIR, mp3Filename);
    const wavPath = join(AUDIO_DIR, wavFilename);

    let existingFilename: string | null = null;
    try {
      await access(mp3Path);
      existingFilename = mp3Filename;
    } catch {
      try {
        await access(wavPath);
        existingFilename = wavFilename;
      } catch {
        // File doesn't exist
      }
    }

    if (existingFilename) {
      return c.json({
        exists: true,
        audioUrl: `/api/tts/audio/${existingFilename}`
      });
    }

    return c.json({ exists: false });
  } catch (error) {
    console.error('Check audio error:', error);
    return c.json({ exists: false }, 200);
  }
});

/**
 * POST /api/tts/upload
 * Upload and save audio file from client
 */
router.post('/upload', async (c) => {
  try {
    const formData = await c.req.formData();
    const audioFile = formData.get('audio') as File;
    const topicId = formData.get('topicId') as string;
    const lessonId = formData.get('lessonId') as string;
    const wordIndex = formData.get('wordIndex') as string | null;
    const provider = formData.get('provider') as string;

    if (!audioFile || !topicId || !lessonId) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const numericTopicId = Number(topicId);
    const numericLessonId = Number(lessonId);

    // Find topic and lesson
    const topic = topicsData.topics.find((t) => t.id === numericTopicId);
    if (!topic) {
      return c.json({ error: 'Topic not found' }, 404);
    }

    const lesson = topic.lessons.find((l) => l.id === numericLessonId);
    if (!lesson) {
      return c.json({ error: 'Lesson not found' }, 404);
    }

    // Determine filename
    let lessonTitle: string;
    if (wordIndex !== null && wordIndex !== undefined) {
      const numericWordIndex = Number(wordIndex);
      if (numericWordIndex >= 0 && numericWordIndex < lesson.vocabulary.length) {
        const vocab = lesson.vocabulary[numericWordIndex];
        lessonTitle = sanitizeFilename(vocab.word);
      } else {
        return c.json({ error: 'Invalid wordIndex' }, 400);
      }
    } else {
      lessonTitle = sanitizeFilename(lesson.title);
    }

    // Save the audio file
    const extension = provider === 'puter' ? '.mp3' : '.wav';
    const filename = `${lessonTitle}${extension}`;
    const filepath = join(AUDIO_DIR, filename);

    // Convert File to Buffer and save
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(filepath, buffer);

    return c.json({
      audioUrl: `/api/tts/audio/${filename}`,
      cached: false
    });
  } catch (error) {
    console.error('Upload audio error:', error);
    return c.json({
      error: error instanceof Error ? error.message : 'Failed to upload audio'
    }, 500);
  }
});

export default router;
