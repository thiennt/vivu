const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

export async function load() {
	try {
		const response = await fetch(`${BACKEND_URL}/api/topics`);
		const data = await response.json();
		return {
			topics: data.topics
		};
	} catch (error) {
		console.error('Error fetching topics:', error);
		return {
			topics: []
		};
	}
}
