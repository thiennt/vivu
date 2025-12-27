import { json } from '@sveltejs/kit';

// Get API key from environment variable
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * GET endpoint to retrieve TTS configuration (API key)
 * 
 * SECURITY NOTE: This endpoint exposes the Gemini API key to the client.
 * This design follows the requirement to use client-side TTS generation with
 * Cache Storage API as specified in the problem statement.
 * 
 * For production use, consider:
 * - Implementing rate limiting
 * - Using a separate API key with restricted permissions
 * - Implementing a server-side proxy for TTS generation instead
 */
export async function GET() {
	try {
		// Check if API key is configured
		if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_api_key_here') {
			console.error('Gemini API key not configured');
			return json({ 
				error: 'Gemini API key not configured. Please set GEMINI_API_KEY environment variable.' 
			}, { status: 500 });
		}
		
		// Return the API key to the client for TTS generation
		return json({ apiKey: GEMINI_API_KEY });
		
	} catch (error) {
		console.error('Error in tts-config API:', error);
		return json({ error: 'Failed to retrieve TTS configuration' }, { status: 500 });
	}
}
