// Light-weight audio manager using HTMLAudioElement for broad compatibility

function createAudio(src, { loop = false, volume = 0.6 } = {}) {
  const audio = new Audio(src);
  audio.loop = loop;
  audio.volume = volume;
  audio.preload = 'auto';
  return audio;
}

// Placeholder public-domain-ish SFX via data URIs (simple beeps). Consider replacing with higher-quality assets.
// Sources credits can be added in README if replaced with external files.
const beepShoot = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABYZWGZmZmZmZmY=';
const beepMiss = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABYZWGZmZmZmZmY=';
const beepOver = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABYZWGZmZmZmZmY=';

// Background music placeholder (very small silent loop). Replace with a real loop.
const musicSilent = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABYZWGZmZmZmZmY=';

export class AudioManager {
  constructor() {
    this.shoot = createAudio(beepShoot, { loop: false, volume: 0.5 });
    this.miss = createAudio(beepMiss, { loop: false, volume: 0.4 });
    this.gameOver = createAudio(beepOver, { loop: false, volume: 0.6 });
    this.music = createAudio(musicSilent, { loop: true, volume: 0.3 });
  }

  playShoot() { try { this.shoot.currentTime = 0; this.shoot.play(); } catch {} }
  playMiss() { try { this.miss.currentTime = 0; this.miss.play(); } catch {} }
  playGameOver() { try { this.gameOver.currentTime = 0; this.gameOver.play(); } catch {} }

  startMusic() { try { if (this.music.paused) this.music.play(); } catch {} }
  pauseMusic() { try { this.music.pause(); } catch {} }
  resumeMusic() { try { this.music.play(); } catch {} }

  dispose() {
    try { this.pauseMusic(); } catch {}
  }
}


