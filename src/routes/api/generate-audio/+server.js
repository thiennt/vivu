import { json } from '@sveltejs/kit';

// Get API key from environment variable
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * API endpoint to provide Gemini API key to client
 * The actual TTS generation is now handled client-side using Cache Storage API
 */
export async function POST({ request }) {
	try {
		const { text } = await request.json();
		
		if (!text) {
			return json({ error: 'Text is required' }, { status: 400 });
		}
		
		// Check if API key is configured
		if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_api_key_here') {
			console.error('Gemini API key not configured');
			return json({ 
				error: 'Gemini API key not configured. Please set GEMINI_API_KEY environment variable.' 
			}, { status: 500 });
		}
		
		// Return the API key to the client for TTS generation
		// The client will handle caching and generation using the TTS utility
		return json({ apiKey: GEMINI_API_KEY });
		
	} catch (error) {
		console.error('Error in generate-audio API:', error);
		return json({ error: 'Failed to process audio request' }, { status: 500 });
	}
}
