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
 * Client-side generation with backend caching
 */
export const puterProvider = {
	name: 'puter',
	displayName: 'Puter.js (Client-Side)',
	
	/**
	 * Generate filename based on lesson and voice
	 */
	generateFilename(text, voice = 'male') {
		// For lesson content, generate a hash-based filename for consistent caching
		// Using a simple hash to ensure same content gets same filename
		let hash = 0;
		for (let i = 0; i < text.length; i++) {
			const char = text.charCodeAt(i);
			hash = ((hash << 5) - hash) + char;
			hash = hash & hash; // Convert to 32bit integer
		}
		// Include voice in filename to prevent cache conflicts between different voices
		return `lesson_${Math.abs(hash).toString(36)}_${voice}`;
	},
	
	/**
	 * Check if audio file exists on backend
	 */
	async checkAudioExists(filename) {
		try {
			const response = await fetch(`${BACKEND_URL}/api/tts/check/${filename}`);
			if (!response.ok) {
				return { exists: false };
			}
			const data = await response.json();
			return data;
		} catch (error) {
			console.error('Error checking audio:', error);
			return { exists: false };
		}
	},
	
	/**
	 * Upload audio to backend for caching
	 */
	async uploadAudio(filename, audioData, format = 'mp3') {
		try {
			const response = await fetch(`${BACKEND_URL}/api/tts/upload`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ filename, audioData, format }),
			});

			if (!response.ok) {
				throw new Error('Failed to upload audio');
			}

			const data = await response.json();
			return data;
		} catch (error) {
			console.error('Error uploading audio:', error);
			throw error;
		}
	},
	
	/**
	 * Generate audio using Puter.js AI
	 */
	async generateAudioWithPuter(text) {
		try {
			// Initialize Puter if needed
			if (!puter.auth?.user) {
				const token = import.meta.env.VITE_PUTER_API_TOKEN;
				if (token && token !== 'your_puter_token_here') {
					await puter.auth.signIn({ token });
				}
			}

			// Generate audio using Puter's AI text-to-speech
			const response = await puter.ai.txt2speech(text);

			// Convert response to base64
			let audioBase64;
			if (response instanceof Blob) {
				audioBase64 = await blobToBase64(response);
			} else if (response instanceof ArrayBuffer) {
				audioBase64 = arrayBufferToBase64(response);
			} else if (typeof response === 'string') {
				audioBase64 = response;
			} else if (response && typeof response === 'object') {
				// Handle object response (e.g., { data: Blob/ArrayBuffer/string })
				const audioData = response.data ?? response.audio;

				if (audioData === undefined) {
					// Log prototype for debugging
					const proto = Object.getPrototypeOf(response);
					console.error('Unknown object format from Puter.js:', response, 'Prototype:', proto);
					// Fallback: try toString if available and not default Object
					if (typeof response.toString === 'function' && response.toString !== Object.prototype.toString) {
						audioBase64 = response.toString();
						console.warn('Falling back to response.toString() for audio data.');
					} else {
						throw new Error(`Unsupported audio format from Puter.js: object with properties: ${Object.keys(response).join(', ')}`);
					}
				} else if (audioData instanceof Blob) {
					audioBase64 = await blobToBase64(audioData);
				} else if (audioData instanceof ArrayBuffer) {
					audioBase64 = arrayBufferToBase64(audioData);
				} else if (typeof audioData === 'string') {
					audioBase64 = audioData;
				} else {
					const propertyName = response.data !== undefined ? 'data' : 'audio';
					throw new Error(`Unsupported audio format from Puter.js: ${typeof audioData} in '${propertyName}' property`);
				}
			} else {
				throw new Error(`Unsupported audio format from Puter.js: ${typeof response}`);
			}

			return audioBase64;
		} catch (error) {
			console.error('Puter.js generation error:', error);
			throw error;
		}
	},
	
	/**
	 * Generate speech using client-side Puter.js
	 * Flow: Check → Generate → Upload → Play
	 * Note: Voice selection is not supported by Puter.js - it uses its default voice.
	 * However, we include voice in the filename for cache key generation to maintain
	 * consistency with the backend provider's behavior. This allows the UI to keep
	 * voice selection enabled across provider switches, even though Puter.js will
	 * generate the same audio regardless of the selected voice.
	 */
	async generateSpeech(topicId, lessonId, text = '', voice = 'male') {
		try {
			// Generate filename with voice parameter for proper cache differentiation
			const filename = this.generateFilename(text, voice);
			
			// Step 1: Check if audio already exists on backend
			const checkResult = await this.checkAudioExists(filename);
			if (checkResult.exists) {
				console.log('Audio exists in cache:', checkResult.audioUrl);
				return `${BACKEND_URL}${checkResult.audioUrl}`;
			}
			
			// Step 2: Generate audio in browser using Puter.js
			console.log('Generating audio with Puter.js...');
			const audioBase64 = await this.generateAudioWithPuter(text);
			
			// Step 3: Upload to backend for caching
			console.log('Uploading audio to backend...');
			const uploadResult = await this.uploadAudio(filename, audioBase64, 'mp3');
			
			// Step 4: Return audio URL from backend
			return `${BACKEND_URL}${uploadResult.audioUrl}`;
			
		} catch (error) {
			console.error('Puter.js TTS Error:', error);
			return '';
		}
	}
};

/**
 * Helper function to convert Blob to base64
 */
function blobToBase64(blob) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onloadend = () => {
			const base64 = reader.result.split(',')[1];
			resolve(base64);
		};
		reader.onerror = reject;
		reader.readAsDataURL(blob);
	});
}

/**
 * Helper function to convert ArrayBuffer to base64
 */
function arrayBufferToBase64(buffer) {
	const bytes = new Uint8Array(buffer);
	let binary = '';
	for (let i = 0; i < bytes.byteLength; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return btoa(binary);
}

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
