import puter from '@heyputer/puter.js';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

/**
 * Gemini TTS Provider (Server-Side)
 * Traditional backend generation flow
 */
export const geminiProvider = {
	name: 'gemini',
	displayName: 'Gemini (Server-Side)',
	
	/**
	 * Generate audio using Gemini via backend API
	 */
	async generateSpeech(topicId, lessonId, text, voice = 'male') {
		try {
			const response = await fetch(`${BACKEND_URL}/api/tts/generate`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ topicId, lessonId, voice }),
			});

			if (!response.ok) {
				throw new Error('Failed to generate audio');
			}

			const data = await response.json();
			return `${BACKEND_URL}${data.audioUrl}`;
		} catch (error) {
			console.error('Gemini TTS Error:', error);
			return '';
		}
	}
};

/**
 * Puter.js TTS Provider (Client-Side)
 * Client-side generation with direct playback (no backend caching)
 */
export const puterProvider = {
	name: 'puter',
	displayName: 'Puter.js (Client-Side)',
	
	/**
	 * Generate audio using Puter.js AI with voice selection
	 * @returns {Promise<Blob|Object|string>} Audio response (typically Blob, but may be object with src or string URL)
	 */
	async generateAudioWithPuter(text, voice = 'male') {
		try {
			// Initialize Puter if needed
			if (!puter.auth?.user) {
				const token = import.meta.env.VITE_PUTER_API_TOKEN;
				if (token && token !== 'your_puter_token_here') {
					await puter.auth.signIn({ token });
				}
			}

			// Map our voice selection to Puter.js voices
			// Using neural voices for better quality
			// Matthew: Male neural voice, Joanna: Female neural voice
			// Note: These are standard AWS Polly voice names supported by Puter.js
			const voiceName = voice === 'female' ? 'Joanna' : 'Matthew';

			// Generate audio using Puter's AI text-to-speech
			// Try with voice parameter first, fall back to basic call if unsupported
			let response;
			try {
				// Attempt to use voice as a simple string parameter
				response = await puter.ai.txt2speech(text, voiceName);
			} catch (voiceError) {
				console.warn('Puter.js voice parameter not supported, trying basic call:', voiceError);
				// Fall back to basic call without voice parameter
				response = await puter.ai.txt2speech(text);
			}

			// Return the audio response directly (Blob or Audio object)
			return response;
		} catch (error) {
			console.error('Puter.js generation error:', error);
			throw error;
		}
	},
	
	/**
	 * Generate speech using client-side Puter.js
	 * Flow: Generate → Play directly (no backend caching needed)
	 * Voice selection is fully supported via Puter.js options
	 */
	async generateSpeech(topicId, lessonId, text = '', voice = 'male') {
		try {
			// Generate audio directly with Puter.js using selected voice
			console.log(`Generating audio with Puter.js using ${voice} voice...`);
			const audioResponse = await this.generateAudioWithPuter(text, voice);
			
			// Convert the response to a URL that can be used by the audio element
			if (audioResponse instanceof Blob) {
				// Create object URL from blob
				return URL.createObjectURL(audioResponse);
			} else if (audioResponse && typeof audioResponse === 'object' && audioResponse.src) {
				// If response has a src property, use it directly
				return audioResponse.src;
			} else if (typeof audioResponse === 'string') {
				// If it's already a URL string
				return audioResponse;
			} else {
				throw new Error('Unexpected audio response format from Puter.js');
			}
		} catch (error) {
			console.error('Puter.js TTS Error:', error);
			return '';
		}
	}
};

/**
 * Get all available TTS providers
 */
export function getProviders() {
	return [geminiProvider, puterProvider];
}

/**
 * Get provider by name
 */
export function getProvider(name) {
	const providers = getProviders();
	return providers.find(p => p.name === name) || geminiProvider;
}
