import { error } from '@sveltejs/kit';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

export async function load({ params }) {
	const topicId = parseInt(params.id);
	const lessonId = parseInt(params.lessonId);
	
	try {
		const response = await fetch(`${BACKEND_URL}/api/topics/${topicId}/lesson/${lessonId}`);
		
		if (!response.ok) {
			throw error(404, 'Lesson not found');
		}
		
		const data = await response.json();
		return {
			topic: data.topic,
			lesson: data.lesson
		};
	} catch (err) {
		throw error(404, 'Lesson not found');
	}
}
