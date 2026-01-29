import { getProvider } from './tts-providers.js';

// Current TTS provider (module-level variable)
const DEFAULT_PROVIDER = import.meta.env.VITE_DEFAULT_TTS_PROVIDER || 'puter';
let currentProviderName = DEFAULT_PROVIDER;

/**
 * Get current provider name
 */
export function getCurrentProvider() {
	return currentProviderName;
}

/**
 * Generate audio using the currently selected provider
 * @param {number} topicId - ID of the topic
 * @param {number} lessonId - ID of the lesson
 * @param {string} [text] - Text to convert (needed for Puter.js provider)
 * @param {string} [voice] - Voice option: 'male' or 'female'
 * @returns {Promise<string>} - URL to the audio file
 */
export async function generateSpeech(topicId, lessonId, text = '', voice = 'male') {
	if (topicId === undefined || lessonId === undefined) {
		console.error('topicId and lessonId are required for speech generation');
		return '';
	}

	const provider = getProvider(currentProviderName);
	
	console.log(`Generating speech with ${provider.displayName}...`);
	
	return provider.generateSpeech(topicId, lessonId, text, voice);
}

/**
 * Set the current TTS provider
 * @param {string} providerName - Name of provider ('gemini' or 'puter')
 */
export function setProvider(providerName) {
	currentProviderName = providerName;
	console.log(`TTS provider changed to: ${providerName}`);
}

