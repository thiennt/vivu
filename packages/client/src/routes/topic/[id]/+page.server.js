import { error } from '@sveltejs/kit';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

export async function load({ params }) {
	const topicId = parseInt(params.id);
	
	try {
		const response = await fetch(`${BACKEND_URL}/api/topics/${topicId}`);
		
		if (!response.ok) {
			throw error(404, 'Topic not found');
		}
		
		const data = await response.json();
		return {
			topic: data.topic
		};
	} catch (err) {
		throw error(404, 'Topic not found');
	}
}
