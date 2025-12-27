import { Hono } from 'hono';
import topicsData from '../data/topics.json' assert { type: 'json' };

const router = new Hono();

// Get all topics
router.get('/', (c) => {
  return c.json({ topics: topicsData.topics });
});

// Get a specific topic by ID
router.get('/:id', (c) => {
  const topicId = Number(c.req.param('id'));
  const topic = topicsData.topics.find((t) => t.id === topicId);
  
  if (!topic) {
    return c.json({ error: 'Topic not found' }, 404);
  }
  
  return c.json({ topic });
});

// Get a specific lesson within a topic
router.get('/:id/lesson/:lessonId', (c) => {
  const topicId = Number(c.req.param('id'));
  const lessonId = Number(c.req.param('lessonId'));
  
  const topic = topicsData.topics.find((t) => t.id === topicId);
  
  if (!topic) {
    return c.json({ error: 'Topic not found' }, 404);
  }
  
  const lesson = topic.lessons.find((l) => l.id === lessonId);
  
  if (!lesson) {
    return c.json({ error: 'Lesson not found' }, 404);
  }
  
  return c.json({ topic, lesson });
});

export default router;
