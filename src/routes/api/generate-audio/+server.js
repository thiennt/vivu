import { json } from '@sveltejs/kit';
import { GoogleGenAI } from '@google/genai';

// Get API key from environment variable (if available)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST({ request }) {
	try {
		const { text, lessonId, isWord } = await request.json();
		
		if (!text) {
			return json({ error: 'Text is required' }, { status: 400 });
		}
		
		// Check if API key is configured
		if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_api_key_here') {
			console.warn('Gemini API key not configured, falling back to browser TTS');
			return json({ 
				audioData: 'USE_BROWSER_TTS',
				text 
			});
		}
		
		try {
			// Initialize the Gemini API
			const ai = new GoogleGenAI({});
			
			// Generate audio using the Gemini API
			const response = await ai.models.generateContent({
				model: 'gemini-2.5-flash-preview-tts',
				contents: [{
					parts: [{
						text: text
					}]
				}],
				config: {
					responseModalities: ['AUDIO'],
					speechConfig: {
						voiceConfig: {
							prebuiltVoiceConfig: {
								voiceName: 'Puck'
							}
						}
					}
				}
			});
			
			// Check if audio data is available
			if (response.candidates && response.candidates[0]?.content?.parts) {
				const audioPart = response.candidates[0].content.parts.find(
					part => part.inlineData && part.inlineData.mimeType?.startsWith('audio/')
				);
				
				if (audioPart && audioPart.inlineData) {
					// Convert the base64 audio data to a data URL
					const audioData = `data:${audioPart.inlineData.mimeType};base64,${audioPart.inlineData.data}`;
					return json({ audioData });
				}
			}
			
			// If no audio data in response, fall back to browser TTS
			console.warn('No audio data in Gemini response, falling back to browser TTS');
			return json({ 
				audioData: 'USE_BROWSER_TTS',
				text 
			});
			
		} catch (apiError) {
			console.error('Gemini API error:', apiError);
			// Fall back to browser TTS if Gemini API fails
			return json({ 
				audioData: 'USE_BROWSER_TTS',
				text 
			});
		}
		
	} catch (error) {
		console.error('Error in generate-audio API:', error);
		return json({ error: 'Failed to generate audio' }, { status: 500 });
	}
}
