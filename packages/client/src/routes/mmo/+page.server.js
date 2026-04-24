const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

export async function load() {
	try {
		const [ytRes, ttRes] = await Promise.allSettled([
			fetch(`${BACKEND_URL}/api/mmo/youtube-shorts`),
			fetch(`${BACKEND_URL}/api/mmo/tiktok-trending`)
		]);

		const youtubeShorts =
			ytRes.status === 'fulfilled' && ytRes.value.ok
				? await ytRes.value.json()
				: { videos: [], error: 'Failed to fetch YouTube data' };

		const tiktokTrending =
			ttRes.status === 'fulfilled' && ttRes.value.ok
				? await ttRes.value.json()
				: { videos: [], error: 'Failed to fetch TikTok data' };

		return { youtubeShorts, tiktokTrending };
	} catch (error) {
		return {
			youtubeShorts: { videos: [], error: String(error) },
			tiktokTrending: { videos: [], error: String(error) }
		};
	}
}
