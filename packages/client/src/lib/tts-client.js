const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

/**
 * Generate audio from topicId, lessonId, and optional wordIndex using backend API
 * @param {number} topicId - ID of the topic
 * @param {number} lessonId - ID of the lesson
 * @param {number} [wordIndex] - Optional index of the vocabulary word
 * @returns {Promise<string>} - URL to the audio file
 */
export async function generateSpeech(topicId, lessonId, wordIndex = undefined) {
	if (topicId === undefined || lessonId === undefined) {
		console.error('topicId and lessonId are required for speech generation');
		return '';
	}

	try {
		const response = await fetch(`${BACKEND_URL}/api/tts/generate`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ topicId, lessonId, wordIndex }),
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
