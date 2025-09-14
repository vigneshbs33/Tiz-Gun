// High Score Manager for Tiz-Gun v6
// Manages global high scores with one score per mode

import { GlobalLeaderboardService } from './GlobalLeaderboardService.js';

export class HighScoreManager {
  constructor() {
    this.modes = ['classic', 'hard', 'insane'];
    this.storageKey = 'tizgun_global_high_scores';
    this.scores = this.loadScores();
    this.globalLeaderboard = new GlobalLeaderboardService();
  }

  loadScores() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure all modes exist with default values
        const scores = {};
        this.modes.forEach(mode => {
          scores[mode] = parsed[mode] || { name: '', score: 0 };
        });
        return scores;
      }
    } catch (error) {
      console.warn('Failed to load high scores:', error);
    }
    
    // Return default scores
    const defaultScores = {};
    this.modes.forEach(mode => {
      defaultScores[mode] = { name: '', score: 0 };
    });
    return defaultScores;
  }

  async getGlobalHighScore() {
    try {
      return await this.globalLeaderboard.getGlobalHighScore();
    } catch (error) {
      console.warn('Failed to load global high score:', error);
      return { name: '', score: 0, mode: '', timestamp: null };
    }
  }

  saveScores() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.scores));
    } catch (error) {
      console.warn('Failed to save high scores:', error);
    }
  }

  getHighScore(mode) {
    return this.scores[mode] || { name: '', score: 0 };
  }

  getAllHighScores() {
    return { ...this.scores };
  }

  async updateHighScore(mode, playerName, score) {
    if (!this.modes.includes(mode)) {
      console.warn(`Invalid mode: ${mode}`);
      return { modeHigh: false, globalHigh: false };
    }

    const currentHigh = this.scores[mode];
    let modeHigh = false;
    let globalHigh = false;

    // Check for new mode high score (local)
    if (score > currentHigh.score) {
      this.scores[mode] = {
        name: playerName || 'Anonymous',
        score: score
      };
      this.saveScores();
      modeHigh = true;
    }

    // Check for new global high score (server)
    try {
      const result = await this.globalLeaderboard.updateGlobalHighScore(
        playerName || 'Anonymous',
        score,
        mode
      );
      globalHigh = result.isNewHigh;
    } catch (error) {
      console.warn('Failed to update global high score:', error);
    }

    return { modeHigh, globalHigh };
  }

  resetAllScores() {
    this.modes.forEach(mode => {
      this.scores[mode] = { name: '', score: 0 };
    });
    this.saveScores();
  }

  getLeaderboard() {
    return this.modes.map(mode => ({
      mode,
      ...this.scores[mode]
    })).sort((a, b) => b.score - a.score);
  }
}
