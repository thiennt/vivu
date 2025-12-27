import topicsData from '$lib/data/topics.json';

export function load() {
	return {
		topics: topicsData.topics
	};
}
