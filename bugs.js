/* ═══════════════════════════════════════════════════
   SOFTWARE ENGINEER "BUG HUNTER" ENGINE 🐛⚡
   Interactive crawling bugs representing debugging & SE aesthetics.
   Works seamlessly on Desktop and Mobile.
═══════════════════════════════════════════════════ */

(() => {
  // Config
  const isMobile = window.innerWidth <= 768;
  const MAX_BUGS = isMobile ? 3 : 5;
  const WIN_GOAL = 5;
  let bugsFixed = 0;
  let bugs = [];
  let animFrameId = null;

  // ── Create Overlay Container ──────────────────────
  const container = document.createElement('div');
  container.id = 'bug-overlay';
  container.className = 'bug-overlay';
  document.body.appendChild(container);

  // ── Create Debugger HUD ───────────────────────────
  const hud = document.createElement('div');
  hud.id = 'bug-hud';
  hud.className = 'bug-hud';
  hud.innerHTML = `
    <div class="bug-hud-icon">🐛</div>
    <div class="bug-hud-info">
      <span class="bug-hud-title">DEBUGGER</span>
      <span class="bug-hud-count" id="bugHudCount">0 / ${WIN_GOAL} Fixed</span>
    </div>
  `;
  document.body.appendChild(hud);

  const hudCount = document.getElementById('bugHudCount');

  // ── Bug SVG Template ──────────────────────────────
  function createBugSvg() {
    return `
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Antennae -->
        <path d="M8 6L5 2M16 6L19 2" stroke="#d4d4d8" stroke-width="1.5" stroke-linecap="round"/>
        <!-- Legs -->
        <path d="M4 10L1 9M4 14L1 15M4 18L1 20" stroke="#a1a1aa" stroke-width="1.5" stroke-linecap="round" class="bug-legs"/>
        <path d="M20 10L23 9M20 14L23 15M20 18L23 20" stroke="#a1a1aa" stroke-width="1.5" stroke-linecap="round" class="bug-legs"/>
        <!-- Shell / Body -->
        <ellipse cx="12" cy="14" rx="5.2" ry="6.2" fill="#18181b" stroke="#71717a" stroke-width="1"/>
        <line x1="12" y1="8" x2="12" y2="20" stroke="#a1a1aa" stroke-width="1"/>
        <!-- Head -->
        <circle cx="12" cy="7" r="3.2" fill="#d4d4d8"/>
        <!-- Glowing Eyes -->
        <circle cx="10.8" cy="6.3" r="0.9" fill="#ffffff"/>
        <circle cx="13.2" cy="6.3" r="0.9" fill="#ffffff"/>
      </svg>
    `;
  }

  // ── Bug Class ─────────────────────────────────────
  class Bug {
    constructor() {
      this.el = document.createElement('div');
      this.el.className = 'cyber-bug';
      this.el.innerHTML = createBugSvg();
      container.appendChild(this.el);

      // Random edge spawn
      const edge = Math.floor(Math.random() * 4);
      const w = window.innerWidth;
      const h = window.innerHeight;

      if (edge === 0) { // Top
        this.x = Math.random() * w;
        this.y = -20;
        this.angle = Math.PI / 2;
      } else if (edge === 1) { // Bottom
        this.x = Math.random() * w;
        this.y = h + 20;
        this.angle = -Math.PI / 2;
      } else if (edge === 2) { // Left
        this.x = -20;
        this.y = Math.random() * h;
        this.angle = 0;
      } else { // Right
        this.x = w + 20;
        this.y = Math.random() * h;
        this.angle = Math.PI;
      }

      this.targetAngle = this.angle;
      this.speed = 0.7 + Math.random() * 0.7; // calm crawling speed
      this.changeTimer = Math.floor(Math.random() * 80) + 40;
      this.isSquashed = false;

      // Click / Touch to Debug
      const handleSquash = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.squash();
      };

      this.el.addEventListener('click', handleSquash);
      this.el.addEventListener('touchstart', handleSquash, { passive: false });
    }

    update() {
      if (this.isSquashed) return;

      const w = window.innerWidth;
      const h = window.innerHeight;

      // Periodic natural wandering
      this.changeTimer--;
      if (this.changeTimer <= 0) {
        this.targetAngle = this.angle + (Math.random() - 0.5) * 1.6;
        this.changeTimer = Math.floor(Math.random() * 100) + 60;
      }

      // Avoid borders
      const margin = 35;
      if (this.x < margin) this.targetAngle = 0;
      else if (this.x > w - margin) this.targetAngle = Math.PI;
      if (this.y < margin) this.targetAngle = Math.PI / 2;
      else if (this.y > h - margin) this.targetAngle = -Math.PI / 2;

      // Smooth turn
      let diff = this.targetAngle - this.angle;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      this.angle += diff * 0.05;

      // Move
      this.x += Math.cos(this.angle) * this.speed;
      this.y += Math.sin(this.angle) * this.speed;

      // Render
      const deg = (this.angle * 180) / Math.PI + 90;
      this.el.style.transform = `translate3d(${this.x}px, ${this.y}px, 0) rotate(${deg}deg)`;
    }

    squash() {
      if (this.isSquashed) return;
      this.isSquashed = true;
      this.el.classList.add('squashed');

      // Floating "+1 Bug Fixed!" Badge
      showFixedBadge(this.x, this.y);

      // Particle explosion
      createBurst(this.x, this.y);

      // Update score
      bugsFixed++;
      updateHud();

      // Remove from DOM after animation
      setTimeout(() => {
        if (this.el.parentNode) this.el.parentNode.removeChild(this.el);
        bugs = bugs.filter(b => b !== this);

        // Respawn a new bug after 3.5 seconds to keep the world alive
        setTimeout(() => {
          if (bugs.length < MAX_BUGS) {
            bugs.push(new Bug());
          }
        }, 3500);
      }, 350);
    }
  }

  // ── Floating Badge Animation ─────────────────────
  function showFixedBadge(x, y) {
    const badge = document.createElement('div');
    badge.className = 'bug-fixed-badge';
    badge.textContent = 'Fixed! 🎯';
    badge.style.left = `${x}px`;
    badge.style.top = `${y}px`;
    container.appendChild(badge);

    setTimeout(() => {
      if (badge.parentNode) badge.parentNode.removeChild(badge);
    }, 1100);
  }

  // ── Sparkle Burst Particles ───────────────────────
  function createBurst(x, y) {
    const colors = ['#d4d4d8', '#a1a1aa', '#71717a', '#ffffff'];
    for (let i = 0; i < 6; i++) {
      const p = document.createElement('div');
      p.className = 'bug-particle';
      const color = colors[i % colors.length];
      p.style.backgroundColor = color;
      p.style.boxShadow = `0 0 8px ${color}`;
      p.style.left = `${x + 10}px`;
      p.style.top = `${y + 10}px`;

      const angle = (Math.PI * 2 * i) / 6;
      const dist = 20 + Math.random() * 20;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist;

      p.style.setProperty('--dx', `${dx}px`);
      p.style.setProperty('--dy', `${dy}px`);
      container.appendChild(p);

      setTimeout(() => {
        if (p.parentNode) p.parentNode.removeChild(p);
      }, 600);
    }
  }

  // ── Update HUD ────────────────────────────────────
  function updateHud() {
    hud.classList.add('pulse');
    setTimeout(() => hud.classList.remove('pulse'), 400);

    if (bugsFixed >= WIN_GOAL) {
      hudCount.textContent = `All Tests Passing! ✅`;
      hud.classList.add('all-fixed');
      // Toast notification
      showWinToast();
    } else {
      hudCount.textContent = `${bugsFixed} / ${WIN_GOAL} Fixed`;
    }
  }

  function showWinToast() {
    const toast = document.createElement('div');
    toast.className = 'bug-win-toast';
    toast.innerHTML = `🚀 <strong>100% Bug-Free Build!</strong> All unit tests passed!`;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
      }, 3500);
    }, 100);
  }

  // ── Animation Loop ────────────────────────────────
  function loop() {
    bugs.forEach(bug => bug.update());
    animFrameId = requestAnimationFrame(loop);
  }

  // ── Init ──────────────────────────────────────────
  for (let i = 0; i < MAX_BUGS; i++) {
    // Stagger spawn
    setTimeout(() => {
      bugs.push(new Bug());
    }, i * 700);
  }

  loop();

  // Clean on unload
  window.addEventListener('beforeunload', () => {
    if (animFrameId) cancelAnimationFrame(animFrameId);
  });
})();
