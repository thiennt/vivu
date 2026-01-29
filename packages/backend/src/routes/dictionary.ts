import { Hono } from 'hono';

const router = new Hono();

// Get word definition from dictionary API
router.get('/:word', async (c) => {
  const word = c.req.param('word');
  
  if (!word) {
    return c.json({ error: 'Word parameter is required' }, 400);
  }
  
  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return c.json({ error: 'Word not found' }, 404);
      }
      return c.json({ error: 'Failed to fetch word data' }, response.status);
    }
    
    const data = await response.json();
    return c.json(data);
  } catch (error) {
    console.error('Error fetching word data:', error);
    return c.json({ error: 'Failed to fetch word data' }, 500);
  }
});

export default router;
