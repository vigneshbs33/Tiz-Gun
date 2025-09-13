// Premium Audio Manager with Web Audio API and advanced sound synthesis

function createAudio(src, { loop = false, volume = 0.6 } = {}) {
  const audio = new Audio(src);
  audio.loop = loop;
  audio.volume = volume;
  audio.preload = 'auto';
  return audio;
}

// Advanced Web Audio API sound synthesis
class CyberAudioEngine {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.reverbGain = null;
    this.delayGain = null;
    this.isInitialized = false;
  }

  async init() {
    if (this.isInitialized) return;
    
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Master volume control
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.audioContext.currentTime);
      this.masterGain.connect(this.audioContext.destination);
      
      // Reverb effect
      this.reverbGain = this.audioContext.createGain();
      this.reverbGain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      this.reverbGain.connect(this.audioContext.destination);
      
      // Delay effect
      this.delayGain = this.audioContext.createGain();
      this.delayGain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
      this.delayGain.connect(this.audioContext.destination);
      
      this.isInitialized = true;
    } catch (error) {
      console.warn('Web Audio API not supported, falling back to basic audio');
    }
  }

  createCyberShoot() {
    if (!this.isInitialized) return;
    
    const now = this.audioContext.currentTime;
    
    // Main shoot sound - synthesized laser
    const oscillator1 = this.audioContext.createOscillator();
    const gain1 = this.audioContext.createGain();
    oscillator1.type = 'sawtooth';
    oscillator1.frequency.setValueAtTime(800, now);
    oscillator1.frequency.exponentialRampToValueAtTime(200, now + 0.1);
    
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.3, now + 0.01);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    
    oscillator1.connect(gain1);
    gain1.connect(this.masterGain);
    
    // High frequency sparkle
    const oscillator2 = this.audioContext.createOscillator();
    const gain2 = this.audioContext.createGain();
    oscillator2.type = 'square';
    oscillator2.frequency.setValueAtTime(2000, now);
    oscillator2.frequency.exponentialRampToValueAtTime(4000, now + 0.05);
    
    gain2.gain.setValueAtTime(0, now);
    gain2.gain.linearRampToValueAtTime(0.1, now + 0.01);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    
    oscillator2.connect(gain2);
    gain2.connect(this.masterGain);
    
    // Low frequency impact
    const oscillator3 = this.audioContext.createOscillator();
    const gain3 = this.audioContext.createGain();
    oscillator3.type = 'sine';
    oscillator3.frequency.setValueAtTime(60, now);
    
    gain3.gain.setValueAtTime(0, now);
    gain3.gain.linearRampToValueAtTime(0.2, now + 0.01);
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    
    oscillator3.connect(gain3);
    gain3.connect(this.masterGain);
    
    oscillator1.start(now);
    oscillator1.stop(now + 0.15);
    oscillator2.start(now);
    oscillator2.stop(now + 0.08);
    oscillator3.start(now);
    oscillator3.stop(now + 0.2);
  }

  createCyberMiss() {
    if (!this.isInitialized) return;
    
    const now = this.audioContext.currentTime;
    
    // Error buzz
    const oscillator = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();
    
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(150, now);
    oscillator.frequency.exponentialRampToValueAtTime(50, now + 0.3);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    filter.Q.setValueAtTime(10, now);
    
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    
    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    
    oscillator.start(now);
    oscillator.stop(now + 0.4);
  }

  createCyberGameOver() {
    if (!this.isInitialized) return;
    
    const now = this.audioContext.currentTime;
    
    // Dramatic descending tone
    const oscillator1 = this.audioContext.createOscillator();
    const gain1 = this.audioContext.createGain();
    oscillator1.type = 'sine';
    oscillator1.frequency.setValueAtTime(200, now);
    oscillator1.frequency.exponentialRampToValueAtTime(50, now + 1.0);
    
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.4, now + 0.1);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    
    oscillator1.connect(gain1);
    gain1.connect(this.masterGain);
    
    // Metallic clang
    setTimeout(() => {
      const oscillator2 = this.audioContext.createOscillator();
      const gain2 = this.audioContext.createGain();
      const filter2 = this.audioContext.createBiquadFilter();
      
      oscillator2.type = 'triangle';
      oscillator2.frequency.setValueAtTime(100, now + 0.3);
      
      filter2.type = 'bandpass';
      filter2.frequency.setValueAtTime(300, now + 0.3);
      filter2.Q.setValueAtTime(5, now + 0.3);
      
      gain2.gain.setValueAtTime(0, now + 0.3);
      gain2.gain.linearRampToValueAtTime(0.3, now + 0.35);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      
      oscillator2.connect(filter2);
      filter2.connect(gain2);
      gain2.connect(this.masterGain);
      
      oscillator2.start(now + 0.3);
      oscillator2.stop(now + 0.8);
    }, 300);
    
    oscillator1.start(now);
    oscillator1.stop(now + 1.2);
  }

  createCyberLevelUp() {
    if (!this.isInitialized) return;
    
    const now = this.audioContext.currentTime;
    
    // Ascending arpeggio
    const frequencies = [440, 554, 659, 880]; // A4, C#5, E5, A5
    
    frequencies.forEach((freq, index) => {
      const oscillator = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, now + index * 0.1);
      
      gain.gain.setValueAtTime(0, now + index * 0.1);
      gain.gain.linearRampToValueAtTime(0.2, now + index * 0.1 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.1 + 0.3);
      
      oscillator.connect(gain);
      gain.connect(this.masterGain);
      
      oscillator.start(now + index * 0.1);
      oscillator.stop(now + index * 0.1 + 0.3);
    });
  }

  createCyberHit() {
    if (!this.isInitialized) return;
    
    const now = this.audioContext.currentTime;
    
    // Quick hit sound
    const oscillator = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();
    
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(600, now);
    oscillator.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
    
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(400, now);
    
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    
    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    
    oscillator.start(now);
    oscillator.stop(now + 0.1);
  }
}

// Fallback data URIs for browsers without Web Audio API support
const beepShoot = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABYZWGZmZmZmZmY=';
const beepMiss = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABYZWGZmZmZmZmY=';
const beepOver = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABYZWGZmZmZmZmY=';
const musicSilent = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABYZWGZmZmZmZmY=';

export class AudioManager {
  constructor() {
    this.shoot = createAudio(beepShoot, { loop: false, volume: 0.5 });
    this.miss = createAudio(beepMiss, { loop: false, volume: 0.4 });
    this.gameOver = createAudio(beepOver, { loop: false, volume: 0.6 });
    this.music = createAudio(musicSilent, { loop: true, volume: 0.3 });
    this.useWebAudio = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
    this.cyberEngine = new CyberAudioEngine();
    this.isInitialized = false;
  }

  async init() {
    if (this.isInitialized) return;
    
    if (this.useWebAudio) {
      await this.cyberEngine.init();
    }
    this.isInitialized = true;
  }

  playShoot() { 
    try { 
      if (this.useWebAudio && this.cyberEngine.isInitialized) {
        this.cyberEngine.createCyberShoot();
      } else {
        this.shoot.currentTime = 0; 
        this.shoot.play(); 
      }
    } catch {} 
  }
  
  playMiss() { 
    try { 
      if (this.useWebAudio && this.cyberEngine.isInitialized) {
        this.cyberEngine.createCyberMiss();
      } else {
        this.miss.currentTime = 0; 
        this.miss.play(); 
      }
    } catch {} 
  }
  
  playGameOver() { 
    try { 
      if (this.useWebAudio && this.cyberEngine.isInitialized) {
        this.cyberEngine.createCyberGameOver();
      } else {
        this.gameOver.currentTime = 0; 
        this.gameOver.play(); 
      }
    } catch {} 
  }

  playLevelUp() {
    try {
      if (this.useWebAudio && this.cyberEngine.isInitialized) {
        this.cyberEngine.createCyberLevelUp();
      }
    } catch {}
  }

  playHit() {
    try {
      if (this.useWebAudio && this.cyberEngine.isInitialized) {
        this.cyberEngine.createCyberHit();
      }
    } catch {}
  }

  startMusic() { 
    try { 
      if (this.music.paused) this.music.play(); 
    } catch {} 
  }
  
  pauseMusic() { 
    try { 
      this.music.pause(); 
    } catch {} 
  }
  
  resumeMusic() { 
    try { 
      this.music.play(); 
    } catch {} 
  }

  dispose() {
    try { 
      this.pauseMusic(); 
      if (this.cyberEngine.audioContext) {
        this.cyberEngine.audioContext.close();
      }
    } catch {}
  }
}


