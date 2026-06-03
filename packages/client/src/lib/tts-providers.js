import puter from '@heyputer/puter.js';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export const RECOMMENDED_ENGLISH_VOICE = 'Joanna';

export const VOICE_OPTIONS = [
	{ value: 'Joanna', label: 'Joanna (recommended for learning English)' },
	{ value: 'Matthew', label: 'Matthew (deeper voice)' }
];

export function normalizePuterVoice(voice = RECOMMENDED_ENGLISH_VOICE) {
	if (typeof voice !== 'string') {
		return RECOMMENDED_ENGLISH_VOICE;
	}

	const trimmedVoice = voice.trim();
	if (!trimmedVoice) {
		return RECOMMENDED_ENGLISH_VOICE;
	}

	const normalizedVoice = trimmedVoice.toLowerCase();
	if (normalizedVoice.includes('joanna') || normalizedVoice.includes('female')) {
		return 'Joanna';
	}
	if (normalizedVoice.includes('matthew') || normalizedVoice.includes('male')) {
		return 'Matthew';
	}

	return RECOMMENDED_ENGLISH_VOICE;
}

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
	async generateSpeech(topicId, lessonId, text, voice = RECOMMENDED_ENGLISH_VOICE) {
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
	async generateAudioWithPuter(text, voice = RECOMMENDED_ENGLISH_VOICE) {
		try {
			// Initialize Puter if needed
			if (!puter.auth?.user) {
				const token = import.meta.env.VITE_PUTER_API_TOKEN;
				if (token && token !== 'your_puter_token_here') {
					await puter.auth.signIn({ token });
				}
			}

			// Puter.js txt2speech signature: txt2speech(text, language, voice, engine)
			// Use US English as the language code
			const languageCode = 'en-US';
			// Map our voice selection to Puter.js voice names (AWS Polly voices)
			const voiceName = normalizePuterVoice(voice);
			// Use neural engine for better quality
			const engine = 'neural';

			// Generate audio using Puter's AI text-to-speech with language code and voice
			const response = await puter.ai.txt2speech(text, languageCode, voiceName, engine);
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
	async generateSpeech(topicId, lessonId, text = '', voice = RECOMMENDED_ENGLISH_VOICE) {
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
