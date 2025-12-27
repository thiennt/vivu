import { GoogleGenAI } from '@google/genai';

// Get API key from environment - we'll pass it from the server
const CACHE_NAME = 'vivulingo-speech-cache';

/**
 * Get speech audio from cache or generate using Gemini API
 * @param {string} text - Text to convert to speech
 * @param {string} apiKey - Gemini API key
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
		
		// Create a cache key based on the text (using first 50 chars for uniqueness)
		const cacheKey = new Request(`/tts/${encodeURIComponent(text.substring(0, 50))}`);

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
			contents: [{ role: 'user', parts: [{ text: `Read this: ${text}` }] }],
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

		// 3. Convert Base64 to Blob
		const byteCharacters = atob(base64Data);
		const byteNumbers = new Array(byteCharacters.length);
		for (let i = 0; i < byteCharacters.length; i++) {
			byteNumbers[i] = byteCharacters.charCodeAt(i);
		}
		const byteArray = new Uint8Array(byteNumbers);
		const audioBlob = new Blob([byteArray], { type: mimeType });

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
