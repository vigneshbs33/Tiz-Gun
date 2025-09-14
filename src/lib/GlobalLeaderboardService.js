// Global Leaderboard Service for Tiz-Gun v6
// Handles communication with Vercel KV for global high scores

export class GlobalLeaderboardService {
  constructor() {
    this.apiUrl = '/api/global-high-score';
    this.cache = {
      globalHighScore: null,
      lastFetch: 0,
      cacheTimeout: 30000 // 30 seconds cache
    };
    this.isDevelopment = import.meta.env.DEV;
  }

  async getGlobalHighScore() {
    // Always use localStorage fallback for now (until API is fixed)
    try {
      const saved = localStorage.getItem('tizgun_global_high_score');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Failed to load global high score:', error);
    }
    return { name: '', score: 0, mode: '', timestamp: null };
  }

  async updateGlobalHighScore(name, score, mode) {
    // Always use localStorage fallback for now (until API is fixed)
    try {
      const currentGlobal = await this.getGlobalHighScore();
      
      if (score > currentGlobal.score) {
        const newGlobalHigh = {
          name: name || 'Anonymous',
          score: score,
          mode: mode,
          timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('tizgun_global_high_score', JSON.stringify(newGlobalHigh));
        this.cache.globalHighScore = newGlobalHigh;
        this.cache.lastFetch = Date.now();
        
        return {
          success: true,
          isNewHigh: true,
          globalHighScore: newGlobalHigh
        };
      }
      
      return {
        success: true,
        isNewHigh: false,
        globalHighScore: currentGlobal
      };
    } catch (error) {
      console.warn('Failed to update global high score:', error);
      return {
        success: false,
        isNewHigh: false,
        error: error.message
      };
    }
  }

  // Clear cache (useful for testing)
  clearCache() {
    this.cache.globalHighScore = null;
    this.cache.lastFetch = 0;
  }

  // Get cached data without making API call
  getCachedGlobalHighScore() {
    return this.cache.globalHighScore;
  }
}
