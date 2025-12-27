import { GoogleGenAI } from '@google/genai';

const CACHE_NAME = 'vivulingo-speech-cache';

/**
 * Simple hash function for cache key generation
 * @param {string} str - String to hash
 * @returns {Promise<string>} - Hash string
 */
async function hashText(str) {
	const encoder = new TextEncoder();
	const data = encoder.encode(str);
	const hashBuffer = await crypto.subtle.digest('SHA-256', data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Get speech audio from cache or generate using Gemini API
 * @param {string} text - Text to convert to speech
 * @param {string} apiKey - Gemini API key (passed from server)
 * @returns {Promise<string>} - Object URL for the audio blob, or empty string on error
 */
export async function getSpeechAndCache(text, apiKey) {
	if (!text) {
		console.error('No text provided for speech generation');
		return '';
	}

	if (!apiKey || apiKey === 'your_api_key_here') {
		console.error('Gemini API key not configured');
		return '';
	}

	try {
		const cache = await caches.open(CACHE_NAME);
		
		// Create a cache key based on hash of the full text to avoid collisions
		const textHash = await hashText(text);
		const cacheKey = new Request(`/tts/${textHash}`);

		// 1. Check cache first
		const cachedResponse = await cache.match(cacheKey);
		if (cachedResponse) {
			console.log('Playing from cache...');
			const blob = await cachedResponse.blob();
			return URL.createObjectURL(blob);
		}

		// 2. If not cached, call Gemini API
		console.log('Calling Gemini 2.0 Speech...');
		const ai = new GoogleGenAI({ apiKey });
		
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

		// 3. Convert Base64 to Blob using efficient method
		const binaryString = atob(base64Data);
		const bytes = Uint8Array.from(binaryString, c => c.charCodeAt(0));
		const audioBlob = new Blob([bytes], { type: mimeType });

		// 4. Save Blob to Cache Storage
		const responseToCache = new Response(audioBlob, {
			headers: { 'Content-Type': mimeType }
		});
		await cache.put(cacheKey, responseToCache);

		return URL.createObjectURL(audioBlob);
	} catch (error) {
		console.error('Gemini TTS Error:', error);
		return '';
	}
}
