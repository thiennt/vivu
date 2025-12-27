import topicsData from '$lib/data/topics.json';
import { error } from '@sveltejs/kit';

export function load({ params }) {
	const topicId = parseInt(params.id);
	const topic = topicsData.topics.find(t => t.id === topicId);
	
	if (!topic) {
		throw error(404, 'Topic not found');
	}
	
	return {
		topic
	};
}
