import { Hono } from 'hono';
import grade6Data from '../data/grade_6.json' with { type: 'json' };
import grade7Data from '../data/grade_7.json' with { type: 'json' };
import grade8Data from '../data/grade_8.json' with { type: 'json' };
import grade9Data from '../data/grade_9.json' with { type: 'json' };

const router = new Hono();

// Combine all grade data
const allGrades = [grade6Data, grade7Data, grade8Data, grade9Data];
const allTopics = allGrades.flatMap((gradeData) => gradeData.topics);

// Get all topics
router.get('/', (c) => {
  return c.json({ topics: allTopics });
});

// Get a specific topic by ID
router.get('/:id', (c) => {
  const topicId = Number(c.req.param('id'));
  const topic = allTopics.find((t) => t.id === topicId);
  
  if (!topic) {
    return c.json({ error: 'Topic not found' }, 404);
  }
  
  return c.json({ topic });
});

// Get a specific lesson within a topic
router.get('/:id/lesson/:lessonId', (c) => {
  const topicId = Number(c.req.param('id'));
  const lessonId = Number(c.req.param('lessonId'));
  
  const topic = allTopics.find((t) => t.id === topicId);
  
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
