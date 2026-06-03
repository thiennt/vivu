import { error } from '@sveltejs/kit';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

export async function load({ params }) {
try {
const response = await fetch(`${BACKEND_URL}/api/mid-level/lessons/${params.cycle}/${params.lessonId}`);

if (!response.ok) {
throw error(404, 'Lesson not found');
}

const data = await response.json();
return {
cycle: data.cycle,
lesson: data.lesson
};
} catch {
throw error(404, 'Lesson not found');
}
}
