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
    // In development, use localStorage fallback
    if (this.isDevelopment) {
      try {
        const saved = localStorage.getItem('tizgun_dev_global_high_score');
        if (saved) {
          return JSON.parse(saved);
        }
      } catch (error) {
        console.warn('Failed to load dev global high score:', error);
      }
      return { name: '', score: 0, mode: '', timestamp: null };
    }

    // Return cached data if still fresh
    const now = Date.now();
    if (this.cache.globalHighScore && (now - this.cache.lastFetch) < this.cache.cacheTimeout) {
      return this.cache.globalHighScore;
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Update cache
      this.cache.globalHighScore = data;
      this.cache.lastFetch = now;
      
      return data;
    } catch (error) {
      console.warn('Failed to fetch global high score:', error);
      // Return cached data or default if no cache
      return this.cache.globalHighScore || {
        name: '',
        score: 0,
        mode: '',
        timestamp: null
      };
    }
  }

  async updateGlobalHighScore(name, score, mode) {
    // In development, use localStorage fallback
    if (this.isDevelopment) {
      try {
        const currentGlobal = await this.getGlobalHighScore();
        
        if (score > currentGlobal.score) {
          const newGlobalHigh = {
            name: name || 'Anonymous',
            score: score,
            mode: mode,
            timestamp: new Date().toISOString()
          };
          
          localStorage.setItem('tizgun_dev_global_high_score', JSON.stringify(newGlobalHigh));
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
        console.warn('Failed to update dev global high score:', error);
        return {
          success: false,
          isNewHigh: false,
          error: error.message
        };
      }
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name || 'Anonymous',
          score: score,
          mode: mode
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Update cache if successful
      if (data.success) {
        this.cache.globalHighScore = data.globalHighScore;
        this.cache.lastFetch = Date.now();
      }
      
      return data;
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
