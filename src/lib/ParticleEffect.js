export class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  explode(x, y, color = '#ffffff') {
    const count = 18;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 80 + Math.random() * 120;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.6 + Math.random() * 0.4,
        age: 0,
        color
      });
    }
  }

  update(dt) {
    const alive = [];
    for (const p of this.particles) {
      p.age += dt;
      if (p.age < p.life) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 200 * dt * 0.25; // gravity
        alive.push(p);
      }
    }
    this.particles = alive;
  }

  draw(ctx) {
    ctx.save();
    for (const p of this.particles) {
      const t = 1 - p.age / p.life;
      ctx.fillStyle = this._withAlpha(p.color, Math.max(0, t));
      ctx.fillRect(p.x, p.y, 3, 3);
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

  clear() { this.particles = []; }
}


