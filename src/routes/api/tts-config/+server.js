import { json } from '@sveltejs/kit';

// Get API key from environment variable
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * GET endpoint to retrieve TTS configuration (API key)
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
