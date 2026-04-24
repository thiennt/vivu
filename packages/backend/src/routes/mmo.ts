import { Hono } from 'hono';

const router = new Hono();

// Mock YouTube Shorts data (used when YOUTUBE_API_KEY is not set)
const mockYouTubeShorts = [
  { id: 'abc123', title: 'This AI tool changed my life 🤯', channelTitle: 'TechVibes', thumbnail: 'https://i.ytimg.com/vi/abc123/mqdefault.jpg', viewCount: '4200000', likeCount: '312000', publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), categoryId: '28' },
  { id: 'def456', title: '3-minute workout you can do anywhere 💪', channelTitle: 'FitQuick', thumbnail: 'https://i.ytimg.com/vi/def456/mqdefault.jpg', viewCount: '1800000', likeCount: '145000', publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), categoryId: '17' },
  { id: 'ghi789', title: 'I tried EVERY viral food trend this week', channelTitle: 'FoodieShorts', thumbnail: 'https://i.ytimg.com/vi/ghi789/mqdefault.jpg', viewCount: '3500000', likeCount: '280000', publishedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(), categoryId: '26' },
  { id: 'jkl012', title: 'This guitar riff will melt your brain 🎸', channelTitle: 'ShredMaster', thumbnail: 'https://i.ytimg.com/vi/jkl012/mqdefault.jpg', viewCount: '2100000', likeCount: '198000', publishedAt: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(), categoryId: '10' },
  { id: 'mno345', title: 'Minecraft trick nobody knows about', channelTitle: 'GamingShortcuts', thumbnail: 'https://i.ytimg.com/vi/mno345/mqdefault.jpg', viewCount: '5600000', likeCount: '421000', publishedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), categoryId: '20' },
  { id: 'pqr678', title: 'Plot twist that broke the internet 😱', channelTitle: 'ComedyClips', thumbnail: 'https://i.ytimg.com/vi/pqr678/mqdefault.jpg', viewCount: '7900000', likeCount: '630000', publishedAt: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(), categoryId: '23' },
  { id: 'stu901', title: 'Incredible free-kick goal you must see', channelTitle: 'SportsHighlights', thumbnail: 'https://i.ytimg.com/vi/stu901/mqdefault.jpg', viewCount: '6300000', likeCount: '510000', publishedAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(), categoryId: '17' },
  { id: 'vwx234', title: 'Breaking: major market shift in 60 seconds', channelTitle: 'NewsNow', thumbnail: 'https://i.ytimg.com/vi/vwx234/mqdefault.jpg', viewCount: '990000', likeCount: '72000', publishedAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(), categoryId: '25' },
  { id: 'yza567', title: 'Learn Python in 60 seconds 🐍', channelTitle: 'CodeSnap', thumbnail: 'https://i.ytimg.com/vi/yza567/mqdefault.jpg', viewCount: '2800000', likeCount: '240000', publishedAt: new Date(Date.now() - 34 * 60 * 60 * 1000).toISOString(), categoryId: '27' },
  { id: 'bcd890', title: 'Street magician leaves crowd speechless', channelTitle: 'MagicMoments', thumbnail: 'https://i.ytimg.com/vi/bcd890/mqdefault.jpg', viewCount: '4700000', likeCount: '388000', publishedAt: new Date(Date.now() - 38 * 60 * 60 * 1000).toISOString(), categoryId: '24' },
  { id: 'efg123', title: 'New pop banger dropping tonight 🎵', channelTitle: 'PopVibes', thumbnail: 'https://i.ytimg.com/vi/efg123/mqdefault.jpg', viewCount: '8100000', likeCount: '650000', publishedAt: new Date(Date.now() - 42 * 60 * 60 * 1000).toISOString(), categoryId: '10' },
  { id: 'hij456', title: 'Satisfying DIY home hack that actually works', channelTitle: 'LifeHacksDaily', thumbnail: 'https://i.ytimg.com/vi/hij456/mqdefault.jpg', viewCount: '3200000', likeCount: '265000', publishedAt: new Date(Date.now() - 46 * 60 * 60 * 1000).toISOString(), categoryId: '26' },
];

// Mock TikTok trending data by category
const mockTikTokVideos = [
  // Entertainment
  { id: 'tt001', title: 'This prank on my roommate went TOO far 😂😂', author: '@prankkingz', likes: 2400000, comments: 18500, shares: 45000, cover: '', category: 'Entertainment', url: 'https://www.tiktok.com/trending' },
  { id: 'tt002', title: 'POV: you discover your superpower at 3am', author: '@storytime_reels', likes: 1800000, comments: 22000, shares: 38000, cover: '', category: 'Entertainment', url: 'https://www.tiktok.com/trending' },
  { id: 'tt003', title: 'Reaction to the plot twist nobody saw coming', author: '@reactzone', likes: 3100000, comments: 31000, shares: 60000, cover: '', category: 'Entertainment', url: 'https://www.tiktok.com/trending' },
  { id: 'tt004', title: 'Celebrity lookalike compilation that broke TikTok', author: '@viral.clips', likes: 5600000, comments: 47000, shares: 120000, cover: '', category: 'Entertainment', url: 'https://www.tiktok.com/trending' },
  // Dance
  { id: 'tt005', title: 'New viral dance challenge 🔥 everyone is doing this', author: '@dancequeen99', likes: 9200000, comments: 82000, shares: 210000, cover: '', category: 'Dance', url: 'https://www.tiktok.com/trending' },
  { id: 'tt006', title: 'Slowing down the hardest move in the trend', author: '@breakitdown', likes: 3400000, comments: 29000, shares: 74000, cover: '', category: 'Dance', url: 'https://www.tiktok.com/trending' },
  { id: 'tt007', title: 'My grandma learned the viral dance and killed it 👏', author: '@familyfun_yt', likes: 7800000, comments: 94000, shares: 180000, cover: '', category: 'Dance', url: 'https://www.tiktok.com/trending' },
  { id: 'tt008', title: '10 year old hits every beat perfectly 😮', author: '@kidstalent', likes: 4200000, comments: 53000, shares: 95000, cover: '', category: 'Dance', url: 'https://www.tiktok.com/trending' },
  // Comedy
  { id: 'tt009', title: 'When the WiFi goes out during your Zoom call 💀', author: '@workhumor', likes: 6100000, comments: 58000, shares: 140000, cover: '', category: 'Comedy', url: 'https://www.tiktok.com/trending' },
  { id: 'tt010', title: 'My cat\'s reaction to the new baby - hilarious', author: '@catmom_laughs', likes: 8700000, comments: 71000, shares: 190000, cover: '', category: 'Comedy', url: 'https://www.tiktok.com/trending' },
  { id: 'tt011', title: 'Trying to explain memes to my parents 😭', author: '@genzdaily', likes: 4500000, comments: 62000, shares: 105000, cover: '', category: 'Comedy', url: 'https://www.tiktok.com/trending' },
  { id: 'tt012', title: 'Auto-correct fails that are actually poetry', author: '@textfails', likes: 2900000, comments: 27000, shares: 68000, cover: '', category: 'Comedy', url: 'https://www.tiktok.com/trending' },
  // Food
  { id: 'tt013', title: '5-ingredient pasta that tastes like a restaurant', author: '@quickeats', likes: 5300000, comments: 41000, shares: 125000, cover: '', category: 'Food', url: 'https://www.tiktok.com/trending' },
  { id: 'tt014', title: 'I tried the $1 vs $100 sushi challenge', author: '@foodreviews', likes: 3800000, comments: 35000, shares: 82000, cover: '', category: 'Food', url: 'https://www.tiktok.com/trending' },
  { id: 'tt015', title: 'The baked feta pasta TikTok made famous revisited', author: '@pastaqueen', likes: 2200000, comments: 19000, shares: 50000, cover: '', category: 'Food', url: 'https://www.tiktok.com/trending' },
  { id: 'tt016', title: 'Street food in Tokyo you MUST try 🍜', author: '@foodietravels', likes: 7100000, comments: 66000, shares: 165000, cover: '', category: 'Food', url: 'https://www.tiktok.com/trending' },
  // Travel
  { id: 'tt017', title: 'Hidden beach in Bali nobody talks about 🏝️', author: '@travelwithme', likes: 4900000, comments: 44000, shares: 112000, cover: '', category: 'Travel', url: 'https://www.tiktok.com/trending' },
  { id: 'tt018', title: '$50/day in Southeast Asia is actually possible', author: '@budgettraveler', likes: 3600000, comments: 38000, shares: 88000, cover: '', category: 'Travel', url: 'https://www.tiktok.com/trending' },
  { id: 'tt019', title: 'Most underrated cities in Europe ranked', author: '@europediaries', likes: 2700000, comments: 31000, shares: 70000, cover: '', category: 'Travel', url: 'https://www.tiktok.com/trending' },
  { id: 'tt020', title: 'I quit my job and traveled 30 countries in a year', author: '@nomadlife', likes: 8900000, comments: 110000, shares: 220000, cover: '', category: 'Travel', url: 'https://www.tiktok.com/trending' },
  // Fashion
  { id: 'tt021', title: 'Thrift haul: $20 budget, 10 outfits 👗', author: '@thriftqueen', likes: 5100000, comments: 48000, shares: 118000, cover: '', category: 'Fashion', url: 'https://www.tiktok.com/trending' },
  { id: 'tt022', title: 'Styling the same jeans 7 different ways', author: '@ootdinspo', likes: 3300000, comments: 29000, shares: 78000, cover: '', category: 'Fashion', url: 'https://www.tiktok.com/trending' },
  { id: 'tt023', title: 'Y2K vs 2024 fashion: what actually came back', author: '@fashionhistory', likes: 2100000, comments: 24000, shares: 55000, cover: '', category: 'Fashion', url: 'https://www.tiktok.com/trending' },
  { id: 'tt024', title: 'Get ready with me for a summer festival ☀️', author: '@grwm.daily', likes: 4400000, comments: 40000, shares: 100000, cover: '', category: 'Fashion', url: 'https://www.tiktok.com/trending' },
  // Sports
  { id: 'tt025', title: 'Impossible basketball trick shot compilation', author: '@hoopstricks', likes: 7400000, comments: 63000, shares: 175000, cover: '', category: 'Sports', url: 'https://www.tiktok.com/trending' },
  { id: 'tt026', title: '16 year old goes viral with insane football skills', author: '@futuresports', likes: 9800000, comments: 88000, shares: 230000, cover: '', category: 'Sports', url: 'https://www.tiktok.com/trending' },
  { id: 'tt027', title: 'Morning routine of a professional athlete', author: '@athletelife', likes: 3200000, comments: 27000, shares: 75000, cover: '', category: 'Sports', url: 'https://www.tiktok.com/trending' },
  { id: 'tt028', title: 'My 30-day fitness transformation (honest review)', author: '@fitnessjourney', likes: 5700000, comments: 52000, shares: 135000, cover: '', category: 'Sports', url: 'https://www.tiktok.com/trending' },
  // DIY
  { id: 'tt029', title: 'Transforming a $5 thrift lamp into something amazing', author: '@diywithme', likes: 4100000, comments: 36000, shares: 95000, cover: '', category: 'DIY', url: 'https://www.tiktok.com/trending' },
  { id: 'tt030', title: 'Bedroom makeover under $100 🏠', author: '@budgetreno', likes: 6200000, comments: 57000, shares: 148000, cover: '', category: 'DIY', url: 'https://www.tiktok.com/trending' },
  { id: 'tt031', title: 'This cable management trick changed my desk setup', author: '@techsetup', likes: 2500000, comments: 22000, shares: 60000, cover: '', category: 'DIY', url: 'https://www.tiktok.com/trending' },
  { id: 'tt032', title: 'Making a bookshelf from reclaimed wood - full tutorial', author: '@woodworkingdiy', likes: 3700000, comments: 33000, shares: 87000, cover: '', category: 'DIY', url: 'https://www.tiktok.com/trending' },
  // Pets
  { id: 'tt033', title: 'Dog meets baby for the first time and cries happy tears', author: '@dogsofttiktok', likes: 12000000, comments: 145000, shares: 310000, cover: '', category: 'Pets', url: 'https://www.tiktok.com/trending' },
  { id: 'tt034', title: 'Training my cat to do 10 tricks in 10 days', author: '@cattricks', likes: 5900000, comments: 54000, shares: 138000, cover: '', category: 'Pets', url: 'https://www.tiktok.com/trending' },
  { id: 'tt035', title: 'Rescue rabbit\'s transformation after 6 months', author: '@bunnyrescue', likes: 7300000, comments: 68000, shares: 170000, cover: '', category: 'Pets', url: 'https://www.tiktok.com/trending' },
  { id: 'tt036', title: 'My parrot learned to roast me and now I regret it 😂', author: '@parrotlife', likes: 9100000, comments: 103000, shares: 245000, cover: '', category: 'Pets', url: 'https://www.tiktok.com/trending' },
  // Music
  { id: 'tt037', title: 'This cover hit different at 2am 🎵', author: '@midnightmelodies', likes: 6800000, comments: 61000, shares: 158000, cover: '', category: 'Music', url: 'https://www.tiktok.com/trending' },
  { id: 'tt038', title: 'Turning a pop song into jazz in 60 seconds', author: '@jazzrearranged', likes: 4300000, comments: 39000, shares: 100000, cover: '', category: 'Music', url: 'https://www.tiktok.com/trending' },
  { id: 'tt039', title: 'POV: you play the guitar riff everyone recognizes', author: '@guitarhero.daily', likes: 3500000, comments: 31000, shares: 83000, cover: '', category: 'Music', url: 'https://www.tiktok.com/trending' },
  { id: 'tt040', title: 'Singing the same note 10 octaves apart challenge', author: '@vocalrange', likes: 5200000, comments: 48000, shares: 122000, cover: '', category: 'Music', url: 'https://www.tiktok.com/trending' },
  // Education
  { id: 'tt041', title: 'The psychology trick that makes people like you instantly', author: '@psychfacts', likes: 7600000, comments: 72000, shares: 180000, cover: '', category: 'Education', url: 'https://www.tiktok.com/trending' },
  { id: 'tt042', title: 'How the stock market actually works in 60 seconds', author: '@financein60', likes: 4800000, comments: 43000, shares: 112000, cover: '', category: 'Education', url: 'https://www.tiktok.com/trending' },
  { id: 'tt043', title: 'Ancient history fact that will blow your mind', author: '@historybyte', likes: 3900000, comments: 36000, shares: 92000, cover: '', category: 'Education', url: 'https://www.tiktok.com/trending' },
  { id: 'tt044', title: 'Why you forget 90% of what you learn (and how to fix it)', author: '@studyhacks', likes: 8400000, comments: 79000, shares: 200000, cover: '', category: 'Education', url: 'https://www.tiktok.com/trending' },
];

// GET /api/mmo/youtube-shorts
router.get('/youtube-shorts', async (c) => {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const categoryId = c.req.query('categoryId') || '';

  if (!apiKey) {
    // Return mock data when API key is not configured
    const filtered = categoryId
      ? mockYouTubeShorts.filter((v) => v.categoryId === categoryId)
      : mockYouTubeShorts;
    return c.json({ videos: filtered, mock: true });
  }

  try {
    const publishedAfter = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    const params = new URLSearchParams({
      part: 'snippet,statistics,contentDetails',
      chart: 'mostPopular',
      videoDuration: 'short',
      maxResults: '20',
      publishedAfter,
      key: apiKey,
    });
    if (categoryId) params.set('videoCategoryId', categoryId);

    const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?${params}`);
    if (!res.ok) {
      const err = await res.text();
      return c.json({ videos: [], error: `YouTube API error: ${err}` }, 502);
    }

    const data = (await res.json()) as {
      items: Array<{
        id: string;
        snippet: { title: string; channelTitle: string; publishedAt: string; categoryId: string; thumbnails: { medium: { url: string } } };
        statistics: { viewCount: string; likeCount: string };
      }>;
    };

    const videos = (data.items || []).map((item) => ({
      id: item.id,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails?.medium?.url ?? '',
      viewCount: item.statistics?.viewCount ?? '0',
      likeCount: item.statistics?.likeCount ?? '0',
      publishedAt: item.snippet.publishedAt,
      categoryId: item.snippet.categoryId,
    }));

    return c.json({ videos });
  } catch (error) {
    return c.json({ videos: [], error: String(error) }, 500);
  }
});

// GET /api/mmo/tiktok-trending
router.get('/tiktok-trending', (c) => {
  // TikTok has no public API — always return curated mock data
  return c.json({ videos: mockTikTokVideos });
});

export default router;
