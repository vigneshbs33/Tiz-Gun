export class ParticleSystem {
  constructor() {
    this.particles = [];
    this.trails = [];
    this.sparks = [];
  }

  explode(x, y, color = '#ffffff', type = 'normal') {
    const count = type === 'cyber' ? 32 : 18;
    const colors = type === 'cyber' 
      ? ['#00ffff', '#ff00ff', '#00ff00', '#ffff00', '#ff8000']
      : [color];
    
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.8;
      const speed = type === 'cyber' ? 120 + Math.random() * 180 : 80 + Math.random() * 120;
      const particleColor = colors[Math.floor(Math.random() * colors.length)];
      
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: type === 'cyber' ? 1.2 + Math.random() * 0.8 : 0.6 + Math.random() * 0.4,
        age: 0,
        color: particleColor,
        size: type === 'cyber' ? 2 + Math.random() * 3 : 2 + Math.random() * 2,
        type: type,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 10,
        glow: type === 'cyber' ? 0.8 + Math.random() * 0.2 : 0.3 + Math.random() * 0.3
      });
    }

    // Add cyber sparks for cyber explosions
    if (type === 'cyber') {
      for (let i = 0; i < 8; i++) {
        this.sparks.push({
          x, y,
          vx: (Math.random() - 0.5) * 200,
          vy: (Math.random() - 0.5) * 200,
          life: 0.8 + Math.random() * 0.4,
          age: 0,
          color: '#ffffff',
          size: 1 + Math.random() * 2,
          intensity: 0.6 + Math.random() * 0.4
        });
      }
    }
  }

  addTrail(x, y, color = '#60ffa6') {
    this.trails.push({
      x, y,
      life: 0.5 + Math.random() * 0.3,
      age: 0,
      color,
      size: 1 + Math.random() * 2,
      alpha: 0.8 + Math.random() * 0.2
    });
  }

  update(dt) {
    // Update particles
    const aliveParticles = [];
    for (const p of this.particles) {
      p.age += dt;
      if (p.age < p.life) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 200 * dt * 0.25; // gravity
        p.rotation += p.rotationSpeed * dt;
        
        // Add trail for cyber particles
        if (p.type === 'cyber' && Math.random() < 0.3) {
          this.addTrail(p.x, p.y, p.color);
        }
        
        aliveParticles.push(p);
      }
    }
    this.particles = aliveParticles;

    // Update sparks
    const aliveSparks = [];
    for (const s of this.sparks) {
      s.age += dt;
      if (s.age < s.life) {
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.vx *= 0.98; // friction
        s.vy *= 0.98;
        s.vy += 300 * dt * 0.3; // gravity
        aliveSparks.push(s);
      }
    }
    this.sparks = aliveSparks;

    // Update trails
    const aliveTrails = [];
    for (const t of this.trails) {
      t.age += dt;
      if (t.age < t.life) {
        t.alpha = (1 - t.age / t.life) * 0.8;
        aliveTrails.push(t);
      }
    }
    this.trails = aliveTrails;
  }

  draw(ctx) {
    ctx.save();
    
    // Draw trails first (behind particles)
    for (const t of this.trails) {
      const alpha = t.alpha * (1 - t.age / t.life);
      ctx.fillStyle = this._withAlpha(t.color, alpha);
      ctx.shadowColor = t.color;
      ctx.shadowBlur = 4;
      ctx.fillRect(t.x - t.size/2, t.y - t.size/2, t.size, t.size);
    }
    ctx.shadowBlur = 0;

    // Draw sparks
    for (const s of this.sparks) {
      const t = 1 - s.age / s.life;
      const alpha = t * s.intensity;
      ctx.fillStyle = this._withAlpha(s.color, alpha);
      ctx.shadowColor = s.color;
      ctx.shadowBlur = 6;
      ctx.fillRect(s.x - s.size/2, s.y - s.size/2, s.size, s.size);
    }
    ctx.shadowBlur = 0;

    // Draw particles
    for (const p of this.particles) {
      const t = 1 - p.age / p.life;
      const alpha = t * p.glow;
      
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      
      if (p.type === 'cyber') {
        // Draw cyber particle with subtle glow
        ctx.fillStyle = this._withAlpha(p.color, alpha);
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        
        // Draw main particle
        ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
        
        // Draw inner highlight
        ctx.fillStyle = this._withAlpha('#ffffff', alpha * 0.3);
        ctx.shadowBlur = 3;
        ctx.fillRect(-p.size/4, -p.size/4, p.size/2, p.size/2);
      } else {
        // Draw normal particle
        ctx.fillStyle = this._withAlpha(p.color, alpha);
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 4;
        ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
      }
      
      ctx.restore();
    }
    
    ctx.restore();
  }

  _withAlpha(hex, a) {
    // supports #rrggbb
    if (!hex || hex[0] !== '#' || (hex.length !== 7 && hex.length !== 4)) {
      return `rgba(255,255,255,${a})`;
    }
    let r, g, b;
    if (hex.length === 7) {
      r = parseInt(hex.slice(1, 3), 16);
      g = parseInt(hex.slice(3, 5), 16);
      b = parseInt(hex.slice(5, 7), 16);
    } else {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    }
    return `rgba(${r},${g},${b},${a})`;
  }

  clear() { 
    this.particles = []; 
    this.trails = [];
    this.sparks = [];
  }
}


