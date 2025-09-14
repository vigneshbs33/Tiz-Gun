// Basic word spawning, movement, and typing matching logic

const DEFAULT_WORDS = [
  'alpha','bravo','charlie','delta','echo','foxtrot','golf','hotel','india','juliet','kilo','lima','mike','november','oscar','papa','quebec','romeo','sierra','tango','uniform','victor','whiskey','xray','yankee','zulu',
  'vue','vite','canvas','particle','rocket','laser','galaxy','nebula','planet','asteroid','meteor','comet','orbit','stellar','quantum','photon','plasma','syntax','typing','keyboard','shield','engine','vector','matrix',
  'vignesh','vigneshbs','vigneshbs33','bangalore','bengaluru','bit','bangaloreinstituteoftechnology','gyanedge','navimeet','mindboard','workwise','sparsh_mukthi','ethiknetra','bhaw_chitran',
  'rfid','rc522','raspberrypi','iot','hacktoberfest','hackathon','googlesolutionchallenge','saphackfest','cs50','mediapipe','opencv','vertexai','react','flask','tailwind','javascript','typescript','python',
  'machinelearning','deeplearning','computervision','ai','agent','agentic','frontend','backend','fullstack','cloud','github','portfolio','resume','latex','physics','stargazing','blackhole','wormhole','spacetime',
  'gravity','relativity','gravitationalwaves','simulation','timedilation','eventhorizon','canister','internetcomputer','chainfusion','canisters','icp','innovation','prototype','mvp','patent','explosion','blast',
  'shot','bullet','ammo','weapon','gun','laserbeam','turret','enemy','boss','level','score','highscore','lives','health','shield','powerup','combo','multiplier','streak','speed','difficulty','arcade','retro',
  'pixel','sprite','vfx','sfx','sound','music','bgm','melody','rhythm','beat','controller','wasd','arrowkeys','spacebar','enter','shift','capslock','backspace','delete','insert','home','end','pageup','pagedown','tab',
  'vectorfield','matrixmath','algorithm','datastructure','model','training','inference','dataset','labels','supervised','unsupervised','reinforcement','optimizer','gradient','loss','accuracy','precision','recall',
  'confusion','overfitting','underfitting','regularization','dropout','batch','epoch','learningrate','momentum','activation','relu','sigmoid','softmax','crossentropy','logistic','bayes','neural','cnn','rnn','transformer',
  'prompt','pipeline','api','rest','graphql','socket','websocket','express','node','vitepress','pwa','deploy','host','netlify','vercel','githubpages','docker','kubernetes','ci','cd'
];


function randomChoice(arr) { return arr[(Math.random() * arr.length) | 0]; }

export class WordsManager {
  constructor(options = {}) {
    this.words = [];
    this.spawnTimer = 0;
    this.spawnInterval = 1.6;
    this.speed = 60; // px/s baseline
    this.level = 1;
    this.activeTargetId = null; // word receiving typed letters
    this.wordList = options.wordList || DEFAULT_WORDS;
    this.missedCount = 0;
    this.difficulty = 'classic'; // 'classic' | 'hard' | 'insane'
  }

  setDifficulty(mode) {
    this.difficulty = mode || 'classic';
    // Recalculate based on current level
    this.setLevel(this.level);
  }

  setLevel(level) {
    this.level = level;
    const diffSpeedMul = this.difficulty === 'classic' ? 0.8 : this.difficulty === 'hard' ? 1.2 : 1.6;
    const diffSpawnMul = this.difficulty === 'classic' ? 1.4 : this.difficulty === 'hard' ? 1.0 : 0.6;
    const baseSpeed = 52 * diffSpeedMul;
    const perLevel = 9 * diffSpeedMul;
    this.speed = baseSpeed + (level - 1) * perLevel;
    const baseInterval = 1.8 * diffSpawnMul;
    const perLevelDec = 0.07; // gentle
    this.spawnInterval = Math.max(0.7, baseInterval - (level - 1) * perLevelDec);
  }

  reset() {
    this.words = [];
    this.activeTargetId = null;
    this.spawnTimer = 0;
    this.missedCount = 0;
    this.setLevel(1);
  }

  consumeMissed() {
    const n = this.missedCount;
    this.missedCount = 0;
    return n;
  }

  spawn(width) {
    const text = randomChoice(this.wordList);
    const x = Math.max(16, Math.random() * (width - 100));
    const y = -20; // spawn just above top
    const id = crypto?.randomUUID?.() || String(Math.random());
    this.words.push({ id, text, typed: '', x, y, speed: this.speed });
  }

  update(dt, width, height) {
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawn(width);
      this.spawnTimer = this.spawnInterval;
    }
    const toRemove = [];
    for (const w of this.words) {
      // Apply latest difficulty/level speed to existing words
      w.speed = this.speed;
      w.y += w.speed * dt;
      if (w.y >= height - 20) {
        toRemove.push(w.id);
        if (this.activeTargetId === w.id) this.activeTargetId = null;
        this.missedCount += 1;
      }
    }
    if (toRemove.length) {
      this.words = this.words.filter(w => !toRemove.includes(w.id));
    }
  }

  typeLetter(letter) {
    // Choose target: prioritize focused word, else nearest word starting with letter or matching progress
    let target = this.words.find(w => w.id === this.activeTargetId);
    const candidates = this.words.filter(w => w.text[w.typed.length] === letter);
    if (!target) {
      // Choose the one closest to bottom to increase urgency
      target = candidates.sort((a,b) => b.y - a.y)[0];
      if (target) this.activeTargetId = target.id;
    }

    if (!target) {
      return { hit: false };
    }

    // Apply typing
    target.typed += letter;
    const killed = target.typed === target.text;
    if (killed) {
      const position = { x: target.x, y: target.y };
      const scoreDelta = 10 + Math.max(0, target.text.length - 3) * 5;
      this.words = this.words.filter(w => w.id !== target.id);
      if (this.activeTargetId === target.id) this.activeTargetId = null;
      return { hit: true, killedWord: true, scoreDelta, position };
    }
    return { hit: true, killedWord: false };
  }

  backspace() {
    // Remove last typed character from the active target, if any
    const target = this.words.find(w => w.id === this.activeTargetId);
    if (!target) return { ok: false };
    if (!target.typed || target.typed.length === 0) return { ok: false };
    target.typed = target.typed.slice(0, -1);
    return { ok: true };
  }

  draw(ctx) {
    ctx.save();
    
    // Dynamic font sizing based on speed/level for better readability
    const baseFontSize = 20;
    const speedMultiplier = Math.min(1.2, 1 + (this.speed - 60) / 200);
    const fontSize = Math.max(16, baseFontSize * speedMultiplier);
    
    // Use monospace font for better readability
    ctx.font = `700 ${fontSize}px 'JetBrains Mono', 'Roboto Mono', 'Consolas', 'Monaco', 'Courier New', monospace`;
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    
    for (const w of this.words) {
      const typedWidth = ctx.measureText(w.typed).width;
      const fullWidth = ctx.measureText(w.text).width;
      w.width = fullWidth;
      
      // Enhanced background with better contrast
      const padding = 12;
      const height = fontSize + 8;
      
      ctx.save();
      ctx.shadowColor = 'rgba(96, 255, 166, 0.15)';
      ctx.shadowBlur = 8;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(w.x - padding, w.y - 4, fullWidth + (padding * 2), height);
      ctx.restore();
      
      // Enhanced border with better visibility
      ctx.strokeStyle = 'rgba(96, 255, 166, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(w.x - padding, w.y - 4, fullWidth + (padding * 2), height);
      
      // Un-typed part with better contrast and letter spacing
      ctx.save();
      ctx.fillStyle = '#e7f0ff';
      ctx.shadowColor = 'rgba(231, 240, 255, 0.3)';
      ctx.shadowBlur = 2;
      ctx.letterSpacing = '0.5px';
      ctx.fillText(w.text, w.x, w.y);
      ctx.restore();
      
      // Typed overlay with enhanced visibility
      ctx.save();
      ctx.fillStyle = '#60ffa6';
      ctx.shadowColor = 'rgba(96, 255, 166, 0.4)';
      ctx.shadowBlur = 3;
      ctx.letterSpacing = '0.5px';
      ctx.fillText(w.typed, w.x, w.y);
      ctx.restore();
      
      // Enhanced caret with better visibility
      const caretAlpha = 0.9 + 0.1 * Math.sin(Date.now() * 0.005);
      ctx.save();
      ctx.globalAlpha = caretAlpha;
      ctx.fillStyle = '#60ffa6';
      ctx.shadowColor = 'rgba(96, 255, 166, 0.6)';
      ctx.shadowBlur = 4;
      ctx.fillRect(w.x + typedWidth + 2, w.y + 2, 3, fontSize - 4);
      ctx.restore();
      
      // Enhanced progress bar
      const progress = w.typed.length / w.text.length;
      ctx.save();
      ctx.fillStyle = 'rgba(96, 255, 166, 0.3)';
      ctx.shadowColor = 'rgba(96, 255, 166, 0.2)';
      ctx.shadowBlur = 2;
      ctx.fillRect(w.x - padding + 2, w.y + height - 2, (fullWidth + (padding * 2) - 4) * progress, 3);
      ctx.restore();
      
      // Enhanced active target highlight
      if (this.activeTargetId === w.id) {
        ctx.save();
        ctx.globalAlpha = 0.4;
        ctx.strokeStyle = '#60ffa6';
        ctx.lineWidth = 2;
        ctx.shadowColor = 'rgba(96, 255, 166, 0.3)';
        ctx.shadowBlur = 6;
        ctx.strokeRect(w.x - padding - 2, w.y - 6, fullWidth + (padding * 2) + 4, height + 4);
        ctx.restore();
      }
    }
    ctx.restore();
  }

  getActiveTarget() {
    if (!this.activeTargetId) return null;
    return this.words.find(w => w.id === this.activeTargetId) || null;
  }
}


