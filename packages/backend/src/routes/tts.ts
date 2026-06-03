import { Hono } from 'hono';
import { GoogleGenAI } from '@google/genai';
import { createHash } from 'crypto';
import { writeFile, mkdir, access, readFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import 'dotenv/config';

import wav from 'wav';
import grade6Data from '../data/grade_6.json' with { type: 'json' };
import grade7Data from '../data/grade_7.json' with { type: 'json' };
import grade8Data from '../data/grade_8.json' with { type: 'json' };
import grade9Data from '../data/grade_9.json' with { type: 'json' };


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = new Hono();

// Combine all grade data and assign unique topic IDs
const allGrades = [grade6Data, grade7Data, grade8Data, grade9Data];
let topicIdCounter = 1;
const allTopics = allGrades.flatMap((gradeData) => 
  gradeData.topics.map((topic) => ({
    ...topic,
    id: topicIdCounter++,
    grade: gradeData.grade
  }))
);

// Get API key from environment
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Audio storage directory
const AUDIO_DIR = join(__dirname, '../../audio');
const MAX_TTS_TEXT_LENGTH = 5000;
const GEMINI_VOICE_ALIASES: Record<string, string> = {
  male: 'Guy',
  matthew: 'Guy',
  guy: 'Guy',
  female: 'Ava',
  joanna: 'Ava',
  ava: 'Ava',
};
const DEFAULT_GEMINI_VOICE = 'Ava';

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
 * Generate filename for audio using lesson title and voice
 */
function generateAudioFilename(lessonTitle: string, voice: string = 'male'): string {
  // Include voice in filename to prevent cache conflicts between different voices
  const baseName = sanitizeFilename(lessonTitle);
  return `${baseName}_${voice}`;
}

/**
 * Extract the leading alphabetic token from a voice value.
 * Example: "Joanna (Neural)" becomes "joanna".
 */
function getVoiceToken(voice: string | undefined): string {
  const trimmedVoice = voice?.trim() || '';
  return trimmedVoice ? trimmedVoice.toLowerCase().match(/^[a-z]+/)?.[0] || '' : '';
}

function normalizeGeminiVoice(voice: string | undefined): string {
  const normalized = GEMINI_VOICE_ALIASES[getVoiceToken(voice)];
  return normalized || DEFAULT_GEMINI_VOICE;
}

/**
 * Build cache lookup candidates for normalized and legacy voice-based filenames.
 */
function getAudioFilenameCandidates(lessonTitle: string, voice: string | undefined): string[] {
  const normalizedVoice = normalizeGeminiVoice(voice);
  const rawVoice = voice?.trim();
  const tokenVoice = getVoiceToken(voice);
  const candidates = [generateAudioFilename(lessonTitle, normalizedVoice)];

  if (rawVoice) {
    candidates.push(generateAudioFilename(lessonTitle, rawVoice));
  }

  if (tokenVoice && tokenVoice !== normalizedVoice.toLowerCase()) {
    candidates.push(generateAudioFilename(lessonTitle, tokenVoice));
  }

  return [...new Set(candidates)];
}

/**
 * Find the first existing audio file for the provided basename candidates.
 */
async function findExistingAudioFilename(baseNames: string[]): Promise<string | null> {
  for (const baseName of baseNames) {
    const mp3Filename = `${baseName}.mp3`;
    const wavFilename = `${baseName}.wav`;

    try {
      await access(join(AUDIO_DIR, mp3Filename));
      return mp3Filename;
    } catch {
      try {
        await access(join(AUDIO_DIR, wavFilename));
        return wavFilename;
      } catch {
        // Continue to next candidate
      }
    }
  }

  return null;
}

/**
 * Generate audio using Gemini API and save to .wav file
 * @param voice - Voice option: 'male' (Neural2-J/Guy) or 'female' (Neural2-C/Ava)
 */
async function generateAndSaveAudio(text: string, lessonTitle: string, voice: string = 'male'): Promise<string> {
  if (!isValidApiKey(GEMINI_API_KEY)) {
    throw new Error('Gemini API key not configured');
  }

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  // Map voice option to Gemini voice name
  // Option 1: American Male Young (Guy)
  // Option 2: American Female Young (Ava)
  const voiceName = normalizeGeminiVoice(voice);

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-preview-tts',
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName },
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

  // Use lesson title and voice for filename to prevent cache conflicts
  const baseName = generateAudioFilename(lessonTitle, voiceName);
  const filename = `${baseName}.wav`;
  const filepath = join(AUDIO_DIR, filename);
  await saveWaveFile(filepath, audioBuffer);
  return filename;
}

/**
 * GET /api/tts/check/:filename
 * Check if audio file exists
 */
router.get('/check/:filename', async (c) => {
  const filename = c.req.param('filename');
  
  // Security: validate filename to prevent path traversal
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return c.json({ error: 'Invalid filename' }, 400);
  }

  // Validate filename length and characters
  if (filename.length > 128 || !/^[a-z0-9\-_]+$/i.test(filename)) {
    return c.json({ error: 'Invalid filename format' }, 400);
  }

  const mp3Path = join(AUDIO_DIR, `${filename}.mp3`);
  const wavPath = join(AUDIO_DIR, `${filename}.wav`);

  try {
    // Check for mp3 first
    await access(mp3Path);
    return c.json({ 
      exists: true, 
      audioUrl: `/api/tts/audio/${filename}.mp3`,
      format: 'mp3'
    });
  } catch {
    try {
      // Check for wav
      await access(wavPath);
      return c.json({ 
        exists: true, 
        audioUrl: `/api/tts/audio/${filename}.wav`,
        format: 'wav'
      });
    } catch {
      return c.json({ exists: false });
    }
  }
});

/**
 * POST /api/tts/upload
 * Upload audio file generated by client-side provider (e.g., Puter.js)
 */
router.post('/upload', async (c) => {
  try {
    const body = await c.req.json();
    const { filename, audioData, format } = body;

    // Validate inputs
    if (!filename || !audioData) {
      return c.json({ error: 'filename and audioData are required' }, 400);
    }

    // Security: validate filename to prevent path traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return c.json({ error: 'Invalid filename' }, 400);
    }

    // Validate filename length and characters
    if (filename.length > 128 || !/^[a-z0-9\-_]+$/i.test(filename)) {
      return c.json({ error: 'Filename must be alphanumeric with hyphens/underscores and max 128 chars' }, 400);
    }

    // Validate format
    const validFormats = ['mp3', 'wav'];
    const audioFormat = format || 'mp3';
    if (!validFormats.includes(audioFormat)) {
      return c.json({ error: 'Invalid audio format' }, 400);
    }

    // Validate audioData is valid base64 and size limit (10MB)
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB
    if (audioData.length > maxSizeBytes * 1.5) { // base64 is ~1.33x larger
      return c.json({ error: 'Audio file too large (max 10MB)' }, 400);
    }

    // Decode base64 audio data with error handling
    let audioBuffer: Buffer;
    try {
      audioBuffer = Buffer.from(audioData, 'base64');
    } catch (error) {
      return c.json({ error: 'Invalid base64 audio data' }, 400);
    }

    // Validate decoded size
    if (audioBuffer.length > maxSizeBytes) {
      return c.json({ error: 'Audio file too large (max 10MB)' }, 400);
    }
    
    // Save file atomically (write to temp, then rename)
    const filenameWithExt = `${filename}.${audioFormat}`;
    const filepath = join(AUDIO_DIR, filenameWithExt);
    const tempFilepath = join(AUDIO_DIR, `${filenameWithExt}.tmp`);
    
    await writeFile(tempFilepath, audioBuffer);
    await import('fs/promises').then(fs => fs.rename(tempFilepath, filepath));

    return c.json({
      success: true,
      audioUrl: `/api/tts/audio/${filenameWithExt}`,
      format: audioFormat
    });

  } catch (error) {
    console.error('Audio upload error:', error);
    return c.json({
      error: error instanceof Error ? error.message : 'Failed to upload audio'
    }, 500);
  }
});

/**
 * POST /api/tts/generate
 * Generate TTS audio from topicId and lessonId
 */
router.post('/generate', async (c) => {
  try {
    const body = await c.req.json();
    const { topicId, lessonId, voice } = body;

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
    const topic = allTopics.find((t) => t.id === numericTopicId);
    if (!topic) {
      return c.json({ error: 'Topic not found' }, 404);
    }

    // Find lesson
    const lesson = topic.lessons.find((l) => l.id === numericLessonId);
    if (!lesson) {
      return c.json({ error: 'Lesson not found' }, 404);
    }

    // Generate audio for the entire lesson content
    const text = lesson.content;
    const normalizedVoice = normalizeGeminiVoice(voice);
    const existingFilename = await findExistingAudioFilename(getAudioFilenameCandidates(lesson.title, voice));

    if (existingFilename) {
      // Return existing audio URL
      return c.json({
        audioUrl: `/api/tts/audio/${existingFilename}`,
        cached: true
      });
    }

    // Generate new audio
    const filename = await generateAndSaveAudio(text, lesson.title, normalizedVoice);

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
 * POST /api/tts/generate-text
 * Generate TTS audio directly from provided text
 */
router.post('/generate-text', async (c) => {
  try {
    const body = await c.req.json();
    const { text, key, voice } = body;

    if (typeof text !== 'string' || !text.trim()) {
      return c.json({ error: 'text is required' }, 400);
    }

    if (text.length > MAX_TTS_TEXT_LENGTH) {
      return c.json({ error: `Text exceeds maximum length of ${MAX_TTS_TEXT_LENGTH} characters` }, 400);
    }

    const normalizedVoice = normalizeGeminiVoice(voice);
    const audioIdentifier = typeof key === 'string' && key.trim() ? key : hashText(text).slice(0, 16);
    const titleForFilename = `${audioIdentifier}_${hashText(text).slice(0, 8)}`;
    const existingFilename = await findExistingAudioFilename(getAudioFilenameCandidates(titleForFilename, voice));

    if (existingFilename) {
      return c.json({
        audioUrl: `/api/tts/audio/${existingFilename}`,
        cached: true
      });
    }

    const filename = await generateAndSaveAudio(text, titleForFilename, normalizedVoice);

    return c.json({
      audioUrl: `/api/tts/audio/${filename}`,
      cached: false
    });
  } catch (error) {
    console.error('TTS text generation error:', error);
    return c.json({
      error: error instanceof Error ? error.message : 'Failed to generate text audio'
    }, 500);
  }
});

/**
 * GET /api/tts/audio/:filename
 * Serve audio file
 */
router.get('/audio/:filename', async (c) => {
  const filename = c.req.param('filename');
  
  // Security: validate filename to prevent path traversal
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return c.json({ error: 'Invalid filename' }, 400);
  }

  // Validate filename format
  if (filename.length > 128 || !/^[a-z0-9\-_]+\.(mp3|wav)$/i.test(filename)) {
    return c.json({ error: 'Invalid filename format' }, 400);
  }

  const filepath = join(AUDIO_DIR, filename);
  
  // Defense-in-depth: verify resolved path is within audio directory
  if (!filepath.startsWith(AUDIO_DIR)) {
    return c.json({ error: 'Invalid file path' }, 400);
  }
  
  console.log(`Requesting audio file: ${filename} at path: ${filepath}`);

  try {
    await access(filepath);
    const audioBuffer = await readFile(filepath);
    
    console.log(`Serving audio file: ${filename}`, audioBuffer);

    // Serve the audio file with case-insensitive Content-Type detection
    return c.body(audioBuffer, 200, {
      'Content-Type': filename.toLowerCase().endsWith('.mp3') ? 'audio/mpeg' : 'audio/wav',
      'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
    });
  } catch (error) {
    console.error(`Error serving audio file ${filename}:`, error);
    return c.json({ error: 'Audio file not found' }, 404);
  }
});

export default router;
