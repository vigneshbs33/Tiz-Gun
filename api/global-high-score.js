// Vercel API route for global high score management
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  console.log('API called:', req.method, req.url);
  
  // Enable CORS for all origins
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      // Get global high score
      const globalHighScore = await kv.get('tizgun_global_high_score');
      
      if (!globalHighScore) {
        return res.status(200).json({
          name: '',
          score: 0,
          mode: '',
          timestamp: null
        });
      }

      return res.status(200).json(globalHighScore);
    }

    if (req.method === 'POST') {
      // Update global high score
      const { name, score, mode } = req.body;

      if (!name || typeof score !== 'number' || !mode) {
        return res.status(400).json({ error: 'Missing required fields: name, score, mode' });
      }

      // Get current global high score
      const currentGlobalHigh = await kv.get('tizgun_global_high_score');
      
      // Check if this is a new global high score
      if (!currentGlobalHigh || score > currentGlobalHigh.score) {
        const newGlobalHigh = {
          name: name.trim().substring(0, 20), // Limit name length
          score: score,
          mode: mode,
          timestamp: new Date().toISOString()
        };

        // Store new global high score
        await kv.set('tizgun_global_high_score', newGlobalHigh);
        
        return res.status(200).json({
          success: true,
          isNewHigh: true,
          globalHighScore: newGlobalHigh
        });
      }

      return res.status(200).json({
        success: true,
        isNewHigh: false,
        globalHighScore: currentGlobalHigh
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Global high score API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
