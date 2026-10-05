background.js
/**
 * Junior Astronaut Mission Trainer - Dynamic Space Background
 * Handles dynamic canvas rendering: Stars, Moon, Planets, Spaceships, and Shooting Stars!
 * Shooting stars continuously appear one after another from different directions approx every 10 seconds.
 */

class SpaceBackground {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.stars = [];
    this.shootingStars = [];
    this.spacecrafts = [];
    this.planets = [];
    this.lastShootingStarTime = Date.now();
    this.shootingStarInterval = 9500; // ~10 seconds
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.initCanvas();
    this.generateStars();
    this.initPlanets();
    this.initSpacecraft();
    this.bindEvents();
    this.animate();

    // Trigger first shooting star quickly for immediate charm
    setTimeout(() => this.spawnShootingStar(), 2500);
  }

  initCanvas() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.initCanvas();
      this.generateStars();
    });

    // Extra delightful touch: clicking on empty space spawns a lucky shooting star!
    window.addEventListener('pointerdown', (e) => {
      if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT' || e.target.closest('.interactive-card') || e.target.closest('.modal-content')) {
        return;
      }
      this.spawnShootingStar(e.clientX, e.clientY);
    });
  }

  generateStars() {
    this.stars = [];
    const starCount = Math.floor((this.width * this.height) / 4500);
    const starColors = ['#FFFFFF', '#E0E7FF', '#C4B5FD', '#FDE047', '#93C5FD', '#FBCFE8'];

    for (let i = 0; i < starCount; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 1.8 + 0.6,
        alpha: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.03 + 0.01,
        color: starColors[Math.floor(Math.random() * starColors.length)],
        isSpecial: Math.random() < 0.15 // 4-point sparkle star
      });
    }
  }

  initPlanets() {
    this.planets = [
      {
        name: 'Saturn-like Ringed Planet',
        x: 0.82,
        y: 0.18,
        radius: 42,
        color1: '#7C3AED',
        color2: '#A78BFA',
        hasRing: true,
        ringAngle: -0.35,
        floatOffset: 0
      },
      {
        name: 'Cyan Gas Giant',
        x: 0.12,
        y: 0.72,
        radius: 58,
        color1: '#0284C7',
        color2: '#38BDF8',
        hasRing: false,
        floatOffset: 1.5
      },
      {
        name: 'Pastel Rose Planetoid',
        x: 0.92,
        y: 0.85,
        radius: 22,
        color1: '#DB2777',
        color2: '#F472B6',
        hasRing: false,
        floatOffset: 3
      }
    ];
  }

  initSpacecraft() {
    this.spacecrafts = [
      {
        x: -80,
        y: this.height * 0.28,
        speedX: 0.45,
        speedY: 0.08,
        size: 26,
        beaconTimer: 0,
        type: 'probe'
      },
      {
        x: this.width + 100,
        y: this.height * 0.65,
        speedX: -0.35,
        speedY: -0.05,
        size: 30,
        beaconTimer: 0,
        type: 'shuttle'
      }
    ];
  }

  spawnShootingStar(targetX = null, targetY = null) {
    // Shooting stars appear from different directions:
    // 0 = from top-left going down-right, 1 = from top-right going down-left,
    // 2 = from right going left-down, 3 = from left going right-up
    const dir = Math.floor(Math.random() * 4);
    let startX, startY, vx, vy;
    const speed = Math.random() * 7 + 8;

    if (targetX !== null && targetY !== null) {
      // Spawned by click
      startX = targetX - 160;
      startY = targetY - 120;
      vx = speed * 0.8;
      vy = speed * 0.6;
    } else {
      switch (dir) {
        case 0: // Top-left to bottom-right
          startX = Math.random() * (this.width * 0.7);
          startY = -20;
          vx = speed * 0.8;
          vy = speed * 0.6;
          break;
        case 1: // Top-right to bottom-left
          startX = this.width * 0.3 + Math.random() * (this.width * 0.7);
          startY = -20;
          vx = -speed * 0.8;
          vy = speed * 0.6;
          break;
        case 2: // Right edge to left
          startX = this.width + 20;
          startY = Math.random() * (this.height * 0.5);
          vx = -speed * 0.9;
          vy = speed * 0.4;
          break;
        case 3: // Left edge to right
        default:
          startX = -20;
          startY = Math.random() * (this.height * 0.6);
          vx = speed * 0.85;
          vy = speed * 0.5;
          break;
      }
    }

    const trailLength = Math.random() * 100 + 120;
    const colors = ['#C4B5FD', '#FFFFFF', '#67E8F9', '#FDE047', '#F472B6'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    this.shootingStars.push({
      x: startX,
      y: startY,
      vx: vx,
      vy: vy,
      length: trailLength,
      life: 1.0,
      decay: Math.random() * 0.015 + 0.012,
      color: color,
      width: Math.random() * 2 + 1.8
    });
  }

  drawMoon(ctx) {
    // Cute stylized glowing moon in upper mid-sky
    const mx = this.width * 0.48;
    const my = 90;
    const mRadius = 38;
    const now = Date.now() * 0.001;
    const hoverY = my + Math.sin(now * 0.8) * 3;

    ctx.save();
    // Moon glow
    const glow = ctx.createRadialGradient(mx, hoverY, mRadius * 0.5, mx, hoverY, mRadius * 2.2);
    glow.addColorStop(0, 'rgba(254, 240, 138, 0.35)');
    glow.addColorStop(0.5, 'rgba(196, 181, 253, 0.15)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(mx, hoverY, mRadius * 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Moon body
    const moonGrad = ctx.createRadialGradient(mx - 8, hoverY - 10, 5, mx, hoverY, mRadius);
    moonGrad.addColorStop(0, '#FEF08A');
    moonGrad.addColorStop(0.7, '#FDE047');
    moonGrad.addColorStop(1, '#F59E0B');

    ctx.fillStyle = moonGrad;
    ctx.beginPath();
    ctx.arc(mx, hoverY, mRadius, 0, Math.PI * 2);
    ctx.fill();

    // Cute soft craters
    ctx.fillStyle = 'rgba(217, 119, 6, 0.28)';
    const craters = [
      { dx: -12, dy: -8, r: 7 },
      { dx: 14, dy: -12, r: 5 },
      { dx: 6, dy: 14, r: 8 },
      { dx: -15, dy: 12, r: 6 },
      { dx: 2, dy: -2, r: 4 }
    ];
    craters.forEach(c => {
      ctx.beginPath();
      ctx.arc(mx + c.dx, hoverY + c.dy, c.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // Friendly shiny twinkle on moon
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.arc(mx - 14, hoverY - 16, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawPlanets(ctx) {
    const time = Date.now() * 0.001;
    this.planets.forEach(p => {
      const px = p.x * this.width;
      const py = p.y * this.height + Math.sin(time + p.floatOffset) * 6;

      ctx.save();
      // Planet soft glow
      const glow = ctx.createRadialGradient(px, py, p.radius * 0.6, px, py, p.radius * 1.8);
      glow.addColorStop(0, p.color2 + '44');
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(px, py, p.radius * 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Back of rings if it has rings
      if (p.hasRing) {
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(p.ringAngle);
        ctx.beginPath();
        ctx.ellipse(0, 0, p.radius * 2.1, p.radius * 0.55, 0, Math.PI, Math.PI * 2);
        ctx.strokeStyle = 'rgba(221, 214, 254, 0.45)';
        ctx.lineWidth = 9;
        ctx.stroke();
        ctx.restore();
      }

      // Planet body
      const pGrad = ctx.createRadialGradient(px - p.radius * 0.35, py - p.radius * 0.35, p.radius * 0.15, px, py, p.radius);
      pGrad.addColorStop(0, '#FFFFFF');
      pGrad.addColorStop(0.3, p.color2);
      pGrad.addColorStop(0.85, p.color1);
      pGrad.addColorStop(1, '#0F0826');

      ctx.fillStyle = pGrad;
      ctx.beginPath();
      ctx.arc(px, py, p.radius, 0, Math.PI * 2);
      ctx.fill();

      // Subtle atmospheric stripes
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(px, py, p.radius * 0.85, 0.2, Math.PI * 0.8);
      ctx.stroke();

      // Front of rings
      if (p.hasRing) {
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(p.ringAngle);
        ctx.beginPath();
        ctx.ellipse(0, 0, p.radius * 2.1, p.radius * 0.55, 0, 0, Math.PI);
        ctx.strokeStyle = 'rgba(221, 214, 254, 0.75)';
        ctx.lineWidth = 9;
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(0, 0, p.radius * 2.3, p.radius * 0.6, 0, 0, Math.PI);
        ctx.strokeStyle = 'rgba(253, 224, 71, 0.6)';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.restore();
      }

      ctx.restore();
    });
  }

  drawSpacecraft(ctx) {
    const time = Date.now() * 0.001;

    this.spacecrafts.forEach(sc => {
      sc.x += sc.speedX;
      sc.y += sc.speedY;

      // Wrap around screen
      if (sc.speedX > 0 && sc.x > this.width + 100) {
        sc.x = -100;
        sc.y = Math.random() * (this.height * 0.7) + 50;
      } else if (sc.speedX < 0 && sc.x < -100) {
        sc.x = this.width + 100;
        sc.y = Math.random() * (this.height * 0.7) + 50;
      }

      ctx.save();
      ctx.translate(sc.x, sc.y);

      if (sc.type === 'probe') {
        // Satellite probe with solar panels
        // Body
        ctx.fillStyle = '#E2E8F0';
        ctx.fillRect(-8, -8, 16, 16);

        // Antenna dish
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -8);
        ctx.lineTo(0, -18);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, -18, 5, Math.PI, 0);
        ctx.stroke();

        // Blue solar wings
        ctx.fillStyle = '#0284C7';
        ctx.strokeStyle = '#67E8F9';
        ctx.lineWidth = 1;
        ctx.fillRect(-26, -5, 14, 10);
        ctx.strokeRect(-26, -5, 14, 10);
        ctx.fillRect(12, -5, 14, 10);
        ctx.strokeRect(12, -5, 14, 10);

        // Blinking red beacon
        const blink = Math.sin(time * 6) > 0;
        ctx.fillStyle = blink ? '#EF4444' : '#7F1D1D';
        ctx.beginPath();
        ctx.arc(0, -8, 3, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Mini space shuttle
        ctx.rotate(Math.PI); // Facing left
        // Hull
        ctx.fillStyle = '#F8FAFC';
        ctx.beginPath();
        ctx.moveTo(18, 0);
        ctx.lineTo(-12, -10);
        ctx.lineTo(-8, 0);
        ctx.lineTo(-12, 10);
        ctx.closePath();
        ctx.fill();

        // Cockpit window
        ctx.fillStyle = '#38BDF8';
        ctx.beginPath();
        ctx.ellipse(6, 0, 5, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Tiny engine glow
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.arc(-11, 0, 3 + Math.random() * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const now = Date.now();

    // Check shooting star interval (~every 10 seconds)
    if (now - this.lastShootingStarTime > this.shootingStarInterval) {
      this.spawnShootingStar();
      this.lastShootingStarTime = now;
      // Slight randomness to interval (8.5s - 11.5s)
      this.shootingStarInterval = 8500 + Math.random() * 3000;
    }

    // Clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Draw Stars
    this.stars.forEach(star => {
      star.alpha += star.twinkleSpeed;
      if (star.alpha > 1 || star.alpha < 0.2) {
        star.twinkleSpeed = -star.twinkleSpeed;
      }
      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0.1, Math.min(1, star.alpha));
      this.ctx.fillStyle = star.color;

      if (star.isSpecial && star.alpha > 0.6) {
        // Draw 4-pointed sparkle
        const r = star.radius * 1.8;
        this.ctx.beginPath();
        this.ctx.moveTo(star.x, star.y - r * 2);
        this.ctx.lineTo(star.x + r * 0.4, star.y - r * 0.4);
        this.ctx.lineTo(star.x + r * 2, star.y);
        this.ctx.lineTo(star.x + r * 0.4, star.y + r * 0.4);
        this.ctx.lineTo(star.x, star.y + r * 2);
        this.ctx.lineTo(star.x - r * 0.4, star.y + r * 0.4);
        this.ctx.lineTo(star.x - r * 2, star.y);
        this.ctx.lineTo(star.x - r * 0.4, star.y - r * 0.4);
        this.ctx.closePath();
        this.ctx.fill();
      } else {
        this.ctx.beginPath();
        this.ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.restore();
    });

    // Draw Moon & Planets
    this.drawMoon(this.ctx);
    this.drawPlanets(this.ctx);

    // Draw Spacecrafts
    this.drawSpacecraft(this.ctx);

    // Update and draw Shooting Stars
    for (let i = this.shootingStars.length - 1; i >= 0; i--) {
      const s = this.shootingStars[i];
      s.x += s.vx;
      s.y += s.vy;
      s.life -= s.decay;

      if (s.life <= 0 || s.x < -150 || s.x > this.width + 150 || s.y > this.height + 150) {
        this.shootingStars.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, s.life);

      // Tail gradient
      const tailX = s.x - s.vx * (s.length / 10);
      const tailY = s.y - s.vy * (s.length / 10);
      const grad = this.ctx.createLinearGradient(s.x, s.y, tailX, tailY);
      grad.addColorStop(0, '#FFFFFF');
      grad.addColorStop(0.2, s.color);
      grad.addColorStop(1, 'transparent');

      this.ctx.strokeStyle = grad;
      this.ctx.lineWidth = s.width;
      this.ctx.lineCap = 'round';
      this.ctx.beginPath();
      this.ctx.moveTo(s.x, s.y);
      this.ctx.lineTo(tailX, tailY);
      this.ctx.stroke();

      // Bright head particle
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.beginPath();
      this.ctx.arc(s.x, s.y, s.width * 1.3, 0, Math.PI * 2);
      this.ctx.fill();

      // Soft head halo
      this.ctx.fillStyle = s.color;
      this.ctx.beginPath();
      this.ctx.arc(s.x, s.y, s.width * 3.5, 0, Math.PI * 2);
      this.ctx.globalAlpha = Math.max(0, s.life * 0.4);
      this.ctx.fill();

      this.ctx.restore();
    }
  }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
  window.spaceBg = new SpaceBackground('space-canvas');
});
