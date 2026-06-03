import { Hono } from 'hono';
import type { Context } from 'hono';
import { readdir, readFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const router = new Hono();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_DIR = join(__dirname, '../data/mid_level');

type MidLevelLesson = {
  lesson_id: number;
  topic: string;
  title: string;
  vocabulary: Array<{ id: number; word: string; type: string; ipa: string; meaning: string }>;
  dialogue: Array<{ speaker: string; text: string }>;
  story: { text: string };
  questions: Array<{ id: number; question: string; suggested_answer: string }>;
};

type MidLevelCycle = {
  cycle: number;
  total_lessons_in_cycle: number;
  lessons: MidLevelLesson[];
};

function setNoCacheHeaders(c: Context) {
  c.header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  c.header('Pragma', 'no-cache');
  c.header('Expires', '0');
}

async function loadAllCycles() {
  const files = (await readdir(DATA_DIR))
    .filter((file) => /^lessons_\d+\.json$/.test(file))
    .map((file) => ({
      file,
      cycle: Number(file.match(/\d+/)?.[0] ?? 0)
    }))
    .sort((a, b) => a.cycle - b.cycle)
    .map((item) => item.file);

  const cycles: MidLevelCycle[] = [];

  for (const file of files) {
    const content = await readFile(join(DATA_DIR, file), 'utf-8');
    const cycle = JSON.parse(content) as MidLevelCycle;
    cycles.push(cycle);
  }

  return cycles;
}

router.get('/lessons', async (c) => {
  setNoCacheHeaders(c);

  try {
    const cycles = await loadAllCycles();
    const lessons = cycles.flatMap((cycle) =>
      cycle.lessons.map((lesson) => ({
        cycle: cycle.cycle,
        lessonId: lesson.lesson_id,
        title: lesson.title,
        topic: lesson.topic
      }))
    );

    return c.json({ lessons });
  } catch (error) {
    console.error('Failed to load mid-level lessons:', error);
    return c.json({ error: 'Failed to load mid-level lessons' }, 500);
  }
});

router.get('/lessons/:cycle/:lessonId', async (c) => {
  setNoCacheHeaders(c);

  try {
    const cycleNumber = Number(c.req.param('cycle'));
    const lessonId = Number(c.req.param('lessonId'));

    const cycles = await loadAllCycles();
    const cycle = cycles.find((item) => item.cycle === cycleNumber);

    if (!cycle) {
      return c.json({ error: 'Cycle not found' }, 404);
    }

    const lesson = cycle.lessons.find((item) => item.lesson_id === lessonId);

    if (!lesson) {
      return c.json({ error: 'Lesson not found' }, 404);
    }

    return c.json({ cycle: cycle.cycle, lesson });
  } catch (error) {
    console.error('Failed to load mid-level lesson:', error);
    return c.json({ error: 'Failed to load mid-level lesson' }, 500);
  }
});

export default router;
