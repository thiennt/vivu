import { Hono } from 'hono';
import { promises as fs } from 'fs';
import path from 'path';

const router = new Hono();

// Path to audio/words directory
const WORDS_DIR = path.join(process.cwd(), 'audio', 'words');
const WORDS_JSON_PATH = path.join(WORDS_DIR, 'words.json');

// Ensure audio/words directory exists
async function ensureWordsDirectory() {
  try {
    await fs.mkdir(WORDS_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating words directory:', error);
  }
}

// Load words cache from words.json
async function loadWordsCache(): Promise<Record<string, any>> {
  try {
    const data = await fs.readFile(WORDS_JSON_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // File doesn't exist or is invalid, return empty object
    return {};
  }
}

// Save words cache to words.json
async function saveWordsCache(cache: Record<string, any>) {
  try {
    await fs.writeFile(WORDS_JSON_PATH, JSON.stringify(cache, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving words cache:', error);
  }
}

// Download audio file from URL and save it locally
async function downloadAudioFile(audioUrl: string, filename: string): Promise<void> {
  try {
    const response = await fetch(audioUrl);
    if (!response.ok) return;
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filePath = path.join(WORDS_DIR, filename);
    
    await fs.writeFile(filePath, buffer);
  } catch (error) {
    console.error(`Error downloading audio file ${filename}:`, error);
  }
}

// Get word definition from dictionary API
router.get('/:word', async (c) => {
  const word = c.req.param('word');
  
  if (!word) {
    return c.json({ error: 'Word parameter is required' }, 400);
  }
  
  // Validate word length and format
  if (word.length > 100) {
    return c.json({ error: 'Word is too long' }, 400);
  }
  
  // Only allow letters, hyphens, and apostrophes (common in English words)
  if (!/^[a-zA-Z'-]+$/.test(word)) {
    return c.json({ error: 'Invalid word format' }, 400);
  }
  
  // Ensure directory exists
  await ensureWordsDirectory();
  
  // Check cache first
  const cache = await loadWordsCache();
  const normalizedWord = word.toLowerCase();
  
  if (cache[normalizedWord]) {
    console.log(`Returning cached data for word: ${normalizedWord}`);
    return c.json(cache[normalizedWord].data);
  }
  
  // Not in cache, fetch from API
  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return c.json({ error: 'Word not found' }, 404);
      }
      return c.json({ error: 'Failed to fetch word data' }, 500);
    }
    
    const data = await response.json();
    
    // Process and cache the data
    const audioFiles: string[] = [];
    
    // Download audio files if available
    if (data[0]?.phonetics) {
      for (let i = 0; i < data[0].phonetics.length; i++) {
        const phonetic = data[0].phonetics[i];
        if (phonetic.audio) {
          const audioUrl = phonetic.audio;
          const extension = audioUrl.split('.').pop()?.split('?')[0] || 'mp3';
          const filename = `${normalizedWord}_${i}.${extension}`;
          
          // Download the audio file
          await downloadAudioFile(audioUrl, filename);
          audioFiles.push(filename);
          
          // Keep the original audio URL from dictionary API for client to use directly
          // phonetic.audio remains unchanged (points to external API)
        }
      }
    }
    
    // Save to cache
    cache[normalizedWord] = {
      word: normalizedWord,
      ipa: data[0]?.phonetics?.[0]?.text || '',
      audioFiles,
      data,
      cachedAt: new Date().toISOString()
    };
    
    await saveWordsCache(cache);
    
    console.log(`Cached word: ${normalizedWord} with ${audioFiles.length} audio file(s)`);
    
    return c.json(data);
  } catch (error) {
    console.error('Error fetching word data:', error);
    return c.json({ error: 'Failed to fetch word data' }, 500);
  }
});

export default router;
