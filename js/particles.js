/* ==========================================================================
   Synapse AI Academy - Ambient Neural Network Particle Background
   ========================================================================== */

class ParticleBackground {
  constructor(canvasId = 'particles-canvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.numParticles = 45;
    this.maxDistance = 140;
    this.mouse = { x: null, y: null, radius: 150 };

    this.resize = this.resize.bind(this);
    this.animate = this.animate.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', this.resize);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseleave', () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });

    this.createParticles();
    requestAnimationFrame(this.animate);
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
    this.numParticles = Math.min(60, Math.max(25, Math.floor((this.width * this.height) / 25000)));
    this.createParticles();
  }

  createParticles() {
    this.particles = [];
    for (let i = 0; i < this.numParticles; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1.2,
        color: Math.random() > 0.6 ? '#38bdf8' : (Math.random() > 0.5 ? '#a855f7' : '#06b6d4'),
        pulse: Math.random() * Math.PI * 2
      });
    }
  }

  onMouseMove(e) {
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Update & Draw Particles
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      p.x += p.vx;
      p.y += p.vy;
      p.pulse += 0.03;

      if (p.x < 0 || p.x > this.width) p.vx *= -1;
      if (p.y < 0 || p.y > this.height) p.vy *= -1;

      // Mouse repulsion/interaction
      if (this.mouse.x !== null) {
        const dx = this.mouse.x - p.x;
        const dy = this.mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < this.mouse.radius) {
          const force = (this.mouse.radius - dist) / this.mouse.radius;
          p.x -= (dx / dist) * force * 1.5;
          p.y -= (dy / dist) * force * 1.5;
        }
      }

      // Draw Node
      const currentRadius = p.radius + Math.sin(p.pulse) * 0.5;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, Math.max(0.5, currentRadius), 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.shadowBlur = 8;
      this.ctx.shadowColor = p.color;
      this.ctx.fill();
      this.ctx.shadowBlur = 0;

      // Draw Connecting Synaptic Lines
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.maxDistance) {
          const alpha = (1 - dist / this.maxDistance) * 0.25;
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
          this.ctx.lineWidth = 0.8;
          this.ctx.stroke();
        }
      }
    }

    requestAnimationFrame(this.animate);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.particleBg = new ParticleBackground();
});
