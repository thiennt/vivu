import { error } from '@sveltejs/kit';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

export async function load() {
	try {
		const response = await fetch(`${BACKEND_URL}/api/advanced-level/lessons`);

		if (!response.ok) {
			throw error(500, 'Unable to load level 3 lessons');
		}

		const data = await response.json();
		return { lessons: data.lessons };
	} catch {
		throw error(500, 'Unable to load level 3 lessons');
	}
}
