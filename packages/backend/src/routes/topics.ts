import { Hono } from 'hono';
import type { Context } from 'hono';
import { readFile, readdir } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const router = new Hono();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_DIR = join(__dirname, '../data');

type GradeData = {
  grade: number;
  topics: Array<Record<string, unknown>>;
};

function setNoCacheHeaders(c: Context) {
  c.header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  c.header('Pragma', 'no-cache');
  c.header('Expires', '0');
}

async function loadAllTopics() {
  const files = (await readdir(DATA_DIR))
    .filter((file) => /^grade_\d+\.json$/i.test(file))
    .sort((a, b) => {
      const gradeA = Number(a.match(/\d+/)?.[0] ?? 0);
      const gradeB = Number(b.match(/\d+/)?.[0] ?? 0);
      return gradeA - gradeB;
    });

  let topicIdCounter = 1;
  const allTopics: Array<Record<string, unknown>> = [];

  for (const file of files) {
    const filePath = join(DATA_DIR, file);
    const fileContent = await readFile(filePath, 'utf-8');
    const gradeData = JSON.parse(fileContent) as GradeData;

    for (const topic of gradeData.topics) {
      allTopics.push({
        ...topic,
        id: topicIdCounter++,
        grade: gradeData.grade
      });
    }
  }

  return allTopics;
}

// Get all topics
router.get('/', async (c) => {
  setNoCacheHeaders(c);
  try {
    const allTopics = await loadAllTopics();
    return c.json({ topics: allTopics });
  } catch (error) {
    console.error('Failed to load topics:', error);
    return c.json({ error: 'Failed to load topics' }, 500);
  }
});

// Get a specific topic by ID
router.get('/:id', async (c) => {
  setNoCacheHeaders(c);
  const topicId = Number(c.req.param('id'));
  const allTopics = await loadAllTopics();
  const topic = allTopics.find((t) => t.id === topicId);
  
  if (!topic) {
    return c.json({ error: 'Topic not found' }, 404);
  }
  
  return c.json({ topic });
});

// Get a specific lesson within a topic
router.get('/:id/lesson/:lessonId', async (c) => {
  setNoCacheHeaders(c);
  const topicId = Number(c.req.param('id'));
  const lessonId = Number(c.req.param('lessonId'));
  
  const allTopics = await loadAllTopics();
  const topic = allTopics.find((t) => t.id === topicId);
  
  if (!topic) {
    return c.json({ error: 'Topic not found' }, 404);
  }
  
  const lessons = Array.isArray((topic as { lessons?: unknown[] }).lessons)
    ? ((topic as { lessons: Array<Record<string, unknown>> }).lessons)
    : [];
  const lesson = lessons.find((l) => l.id === lessonId);
  
  if (!lesson) {
    return c.json({ error: 'Lesson not found' }, 404);
  }
  
  return c.json({ topic, lesson });
});

export default router;
