### Tiz-Gun

Tiz-Gun is a cool, fast-paced typing shooter built with Vue 3 and Vite. Words descend from the top; type letters to destroy them. Earn points, survive with limited lives, progress through levels, and enjoy sound effects and particle explosions. Made for fun and to learn Vue better.

### Features

- **Falling words**: speed increases with level
- **Typing focus**: partial matching and focused target
- **Scoring**: more for longer words
- **Lives**: missed words cost a life; game over screen
- **Controls**: pause, resume, restart
- **Audio**: background music and SFX with mute toggle
- **High score**: persisted in localStorage
- **Responsive**: crisp canvas with devicePixelRatio scaling
- **Full-screen**: toggle supported; mobile-friendly input focus

### Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

#### Build and Preview

```bash
npm run build
npm run preview
```

### Deploying to Vercel

- **Build command**: `npm run build`
- **Output directory**: `dist`
- Optionally use the included `vercel.json` or set these in the Vercel UI.

### Project Structure

```

.
├─ index.html
├─ package.json
├─ vite.config.js
├─ vercel.json
├─ src/
│  ├─ main.js
│  ├─ App.vue
│  ├─ styles/
│  │  └─ index.css
│  ├─ components/
│  │  ├─ GameCanvas.vue
│  │  ├─ HUD.vue
│  │  └─ GameControls.vue
│  └─ lib/
│     ├─ WordsManager.js
│     ├─ AudioManager.js
│     └─ ParticleEffect.js
└─ assets/
   └─ README.txt
```

### Developer / Contact

- GitHub: https://github.com/vigneshbs33
- LinkedIn: https://www.linkedin.com/in/vigneshbs-dev/

### Credits

- Fonts via Google Fonts: Orbitron, Inter
- Replace SFX/music data-URIs in `src/lib/AudioManager.js` with your own assets if desired.

### Privacy

All typing happens locally in your browser. No data is sent to any server.


