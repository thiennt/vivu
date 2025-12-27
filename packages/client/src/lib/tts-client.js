const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

/**
 * Generate audio from text using backend API
 * @param {string} text - Text to convert to speech
 * @returns {Promise<string>} - URL to the audio file
 */
export async function generateSpeech(text) {
	if (!text) {
		console.error('No text provided for speech generation');
		return '';
	}

	try {
		const response = await fetch(`${BACKEND_URL}/api/tts/generate`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ text }),
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
