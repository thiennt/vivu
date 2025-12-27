import topicsData from '$lib/data/topics.json';
import { error } from '@sveltejs/kit';

export function load({ params }) {
	const topicId = parseInt(params.id);
	const lessonId = parseInt(params.lessonId);
	
	const topic = topicsData.topics.find(t => t.id === topicId);
	
	if (!topic) {
		throw error(404, 'Topic not found');
	}
	
	const lesson = topic.lessons.find(l => l.id === lessonId);
	
	if (!lesson) {
		throw error(404, 'Lesson not found');
	}
	
	return {
		topic,
		lesson
	};
}
