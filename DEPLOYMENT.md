# Tiz-Gun v6.0 - Deployment Guide

## Global Leaderboard Setup

This version includes a **global leaderboard** that works across all users when deployed to Vercel.

### Prerequisites

1. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
2. **Vercel KV Database** - Set up a KV database in your Vercel project

### Setup Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Deploy to Vercel**
   ```bash
   npx vercel
   ```

3. **Configure Vercel KV**
   - Go to your Vercel dashboard
   - Select your project
   - Go to "Storage" tab
   - Create a new KV database
   - Copy the connection details

4. **Set Environment Variables**
   In your Vercel project settings, add:
   ```
   KV_REST_API_URL=your_kv_url
   KV_REST_API_TOKEN=your_kv_token
   KV_REST_API_READ_ONLY_TOKEN=your_readonly_token
   ```
   

### How It Works

- **Global High Score** - Stored in Vercel KV, shared across all users
- **Mode High Scores** - Stored locally in browser localStorage
- **Real-time Updates** - When someone gets a new global high score, it updates for everyone
- **Player Names** - Shows who achieved the global high score and in which mode

### API Endpoints

- `GET /api/global-high-score` - Get current global high score
- `POST /api/global-high-score` - Update global high score (if higher)

### Features

✅ **Cross-User Competition** - Everyone competes for the same global high score
✅ **Player Attribution** - Shows name and mode of the global high scorer
✅ **Real-time Updates** - Global leaderboard updates instantly
✅ **Fallback Support** - Works offline with local high scores
✅ **Caching** - Efficient API calls with 30-second cache

### Testing Locally

The global leaderboard will work locally, but you need to set up Vercel KV first. For development, it will fall back to local storage.

### Production Deployment

Once deployed to Vercel with KV configured, the global leaderboard will work across all users worldwide!
