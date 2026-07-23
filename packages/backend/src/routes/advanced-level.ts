import { Hono } from 'hono';
import type { Context } from 'hono';
import { readdir, readFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const router = new Hono();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_DIR = join(__dirname, '../data/advanced_level');

type AdvancedLesson = {
  id: number;
  category: string;
  topic: string;
  title: string;
  script: string;
  slack_email: string;
  reflection: string;
};

type AdvancedLevelPart = {
  total_lessons: number;
  part: number;
  range: string;
  lessons: AdvancedLesson[];
};

function setNoCacheHeaders(c: Context) {
  c.header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  c.header('Pragma', 'no-cache');
  c.header('Expires', '0');
}

async function loadAllLessons(): Promise<AdvancedLesson[]> {
  const files = (await readdir(DATA_DIR))
    .filter((file) => /^lessons_part\d+\.json$/.test(file))
    .map((file) => {
      const match = file.match(/\d+/);
      if (!match) return null;
      return { file, part: Number(match[0]) };
    })
    .filter((item): item is { file: string; part: number } => item !== null)
    .sort((a, b) => a.part - b.part)
    .map((item) => item.file);

  const allLessons: AdvancedLesson[] = [];

  for (const file of files) {
    const content = await readFile(join(DATA_DIR, file), 'utf-8');
    const part = JSON.parse(content) as AdvancedLevelPart;
    allLessons.push(...part.lessons);
  }

  return allLessons;
}

router.get('/lessons', async (c) => {
  setNoCacheHeaders(c);

  try {
    const lessons = await loadAllLessons();
    const list = lessons.map((lesson) => ({
      id: lesson.id,
      category: lesson.category,
      topic: lesson.topic,
      title: lesson.title
    }));

    return c.json({ lessons: list });
  } catch (error) {
    console.error('Failed to load advanced-level lessons:', error);
    return c.json({ error: 'Failed to load advanced-level lessons' }, 500);
  }
});

router.get('/lessons/:lessonId', async (c) => {
  setNoCacheHeaders(c);

  try {
    const lessonId = Number(c.req.param('lessonId'));
    const lessons = await loadAllLessons();
    const lesson = lessons.find((item) => item.id === lessonId);

    if (!lesson) {
      return c.json({ error: 'Lesson not found' }, 404);
    }

    return c.json({ lesson });
  } catch (error) {
    console.error('Failed to load advanced-level lesson:', error);
    return c.json({ error: 'Failed to load advanced-level lesson' }, 500);
  }
});

export default router;
