const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

/**
 * Check if audio file exists on backend
 * @param {number} topicId - ID of the topic
 * @param {number} lessonId - ID of the lesson
 * @param {number} [wordIndex] - Optional index of the vocabulary word
 * @param {string} [provider] - TTS provider: 'gemini' or 'puter'
 * @returns {Promise<{exists: boolean, audioUrl?: string}>}
 */
export async function checkAudioExists(topicId, lessonId, wordIndex = undefined, provider = undefined) {
	try {
		const response = await fetch(`${BACKEND_URL}/api/tts/check`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ topicId, lessonId, wordIndex, provider }),
		});

		if (!response.ok) {
			return { exists: false };
		}

		const data = await response.json();
		return {
			exists: data.exists,
			audioUrl: data.audioUrl ? `${BACKEND_URL}${data.audioUrl}` : undefined
		};
	} catch (error) {
		console.error('Check audio error:', error);
		return { exists: false };
	}
}

/**
 * Upload audio file to backend for saving
 * @param {Blob} audioBlob - Audio blob to upload
 * @param {number} topicId - ID of the topic
 * @param {number} lessonId - ID of the lesson
 * @param {number} [wordIndex] - Optional index of the vocabulary word
 * @param {string} [provider] - TTS provider
 * @returns {Promise<string>} - URL to the saved audio file
 */
export async function uploadAudio(audioBlob, topicId, lessonId, wordIndex = undefined, provider = 'puter') {
	try {
		const formData = new FormData();
		formData.append('audio', audioBlob, 'audio.mp3');
		formData.append('topicId', topicId.toString());
		formData.append('lessonId', lessonId.toString());
		if (wordIndex !== undefined) {
			formData.append('wordIndex', wordIndex.toString());
		}
		formData.append('provider', provider);

		const response = await fetch(`${BACKEND_URL}/api/tts/upload`, {
			method: 'POST',
			body: formData,
		});

		if (!response.ok) {
			throw new Error('Failed to upload audio');
		}

		const data = await response.json();
		return `${BACKEND_URL}${data.audioUrl}`;
	} catch (error) {
		console.error('Upload audio error:', error);
		throw error;
	}
}

/**
 * Generate audio from topicId, lessonId, and optional wordIndex
 * For Gemini: uses backend API
 * For Puter: checks backend, generates client-side if needed, uploads, then returns URL
 * @param {number} topicId - ID of the topic
 * @param {number} lessonId - ID of the lesson
 * @param {number} [wordIndex] - Optional index of the vocabulary word
 * @param {string} [provider] - TTS provider: 'gemini' or 'puter' (optional)
 * @param {string} [text] - Text to speak (required for Puter client-side generation)
 * @returns {Promise<string>} - URL to the audio file
 */
export async function generateSpeech(topicId, lessonId, wordIndex = undefined, provider = undefined, text = '') {
	if (topicId === undefined || lessonId === undefined) {
		console.error('topicId and lessonId are required for speech generation');
		return '';
	}

	// For Puter provider, use client-side generation
	if (provider === 'puter') {
		return await generatePuterSpeech(topicId, lessonId, wordIndex, text);
	}

	// For Gemini or default, use backend generation
	try {
		const response = await fetch(`${BACKEND_URL}/api/tts/generate`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ topicId, lessonId, wordIndex, provider }),
		});

		if (!response.ok) {
			throw new Error('Failed to generate audio');
		}

		const data = await response.json();
		
		// Return the full URL to the audio file
		return `${BACKEND_URL}${data.audioUrl}`;
	} catch (error) {
		console.error('TTS Error:', error);
		return '';
	}
}

/**
 * Generate audio using Puter.js on client-side
 * Flow: Check backend -> Generate if not exists -> Upload -> Return URL
 */
async function generatePuterSpeech(topicId, lessonId, wordIndex, text) {
	try {
		// 1. Check if audio already exists on backend
		const checkResult = await checkAudioExists(topicId, lessonId, wordIndex, 'puter');
		if (checkResult.exists && checkResult.audioUrl) {
			console.log('Audio exists on backend, using cached version');
			return checkResult.audioUrl;
		}

		// 2. Generate audio using Puter.js (browser SDK)
		if (!text) {
			throw new Error('Text is required for Puter TTS generation');
		}

		// Import Puter.js dynamically (browser environment)
		const { default: puter } = await import('@heyputer/puter.js');
		
		console.log('Generating audio with Puter.js for:', text);
		const audioBlob = await puter.ai.txt2speech(text, {
			voice: 'alloy',
			language: 'en-US'
		});

		// 3. Upload to backend for saving
		console.log('Uploading audio to backend...');
		const audioUrl = await uploadAudio(audioBlob, topicId, lessonId, wordIndex, 'puter');

		// 4. Return URL
		return audioUrl;
	} catch (error) {
		console.error('Puter TTS Error:', error);
		return '';
	}
}
