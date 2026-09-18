/* ═══════════════════════════════════════════════════
   CINEMA & DAVINCI INTERACTIVE ENGINE 🎬🎨
   For Muhammad Sufyan's Video Editing Portfolio.
   Features 2 Clapperboards & 2 DaVinci Resolve Logos
   with fluid floating physics, gold spark VFX, and HUD.
═══════════════════════════════════════════════════ */

(() => {
  const WIN_GOAL = 4;
  let itemsMastered = 0;
  let activeItems = [];
  let animFrameId = null;

  // ── Overlay Container ─────────────────────────────
  const container = document.createElement('div');
  container.id = 'cinema-overlay';
  container.className = 'cinema-overlay';
  document.body.appendChild(container);

  // ── HUD in Bottom Corner ──────────────────────────
  const hud = document.createElement('div');
  hud.id = 'cinema-hud';
  hud.className = 'cinema-hud';
  hud.innerHTML = `
    <div class="cinema-hud-icon">🎬</div>
    <div class="cinema-hud-info">
      <span class="cinema-hud-title">DIRECTOR'S CUT</span>
      <span class="cinema-hud-count" id="cinemaHudCount">0 / ${WIN_GOAL} Mastered</span>
    </div>
  `;
  document.body.appendChild(hud);

  const hudCount = document.getElementById('cinemaHudCount');

  // ── Audio Synthesizer (Zero external dependencies) ──
  let audioCtx = null;
  function playSound(type) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();

      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'clapper') {
        // Crisp wooden clap snap
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(480, now);
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.08);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else {
        // Golden color-grade chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      }
    } catch (e) {}
  }

  // ── SVGs ──────────────────────────────────────────
  function getClapperSvg() {
    return `
      <svg viewBox="0 0 32 32" width="28" height="28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="#d4af37" flood-opacity="0.4"/>
        </filter>
        <!-- Board base -->
        <rect x="3" y="11" width="26" height="17" rx="3" fill="#111111" stroke="#d4af37" stroke-width="1.5" filter="url(#goldGlow)"/>
        <!-- Chevron stripes on base -->
        <line x1="8" y1="12" x2="13" y2="17" stroke="#aa8c2c" stroke-width="1.5"/>
        <line x1="16" y1="12" x2="21" y2="17" stroke="#aa8c2c" stroke-width="1.5"/>
        <line x1="24" y1="12" x2="28" y2="16" stroke="#aa8c2c" stroke-width="1.5"/>
        <!-- Text lines -->
        <line x1="7" y1="21" x2="19" y2="21" stroke="#fdfbf7" stroke-width="1.2" stroke-linecap="round"/>
        <line x1="7" y1="24" x2="15" y2="24" stroke="#a39161" stroke-width="1.2" stroke-linecap="round"/>
        <!-- Hinged top clapstick (angled up slightly) -->
        <g transform="rotate(-12 3 11)">
          <rect x="3" y="5" width="26" height="6" rx="2" fill="#1a1a1a" stroke="#d4af37" stroke-width="1.5"/>
          <path d="M7 5L10 11M14 5L17 11M21 5L24 11" stroke="#d4af37" stroke-width="1.8"/>
        </g>
      </svg>
    `;
  }

  function getDavinciSvg() {
    return `
      <svg viewBox="0 0 100 100" width="28" height="28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <filter id="dvGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="#d4af37" flood-opacity="0.5"/>
        </filter>
        <circle cx="50" cy="50" r="46" fill="#0d0d0f" stroke="#d4af37" stroke-width="3" filter="url(#dvGlow)"/>
        <!-- 3 DaVinci Resolve color wheels / petals -->
        <path d="M50 50 L50 14 A36 36 0 0 1 81 68 Z" fill="#d4af37" opacity="0.95"/>
        <path d="M50 50 L81 68 A36 36 0 0 1 19 68 Z" fill="#aa8c2c" opacity="0.95"/>
        <path d="M50 50 L19 68 A36 36 0 0 1 50 14 Z" fill="#f59e0b" opacity="0.95"/>
        <circle cx="50" cy="50" r="11" fill="#050505" stroke="#d4af37" stroke-width="2.5"/>
      </svg>
    `;
  }

  // ── Floating Cinema Item Class ────────────────────
  class CinemaItem {
    constructor(type) {
      this.type = type; // 'clapper' or 'davinci'
      this.el = document.createElement('div');
      this.el.className = `cinema-item cinema-item-${type}`;
      this.el.innerHTML = type === 'clapper' ? getClapperSvg() : getDavinciSvg();
      this.el.title = type === 'clapper' ? 'Click to Approve Take 🎬' : 'Click to Grade Node 🎨';
      container.appendChild(this.el);

      // Random edge spawn
      const edge = Math.floor(Math.random() * 4);
      const w = window.innerWidth;
      const h = window.innerHeight;

      if (edge === 0) {
        this.x = Math.random() * (w - 60) + 30;
        this.y = -30;
        this.angle = Math.PI / 2;
      } else if (edge === 1) {
        this.x = Math.random() * (w - 60) + 30;
        this.y = h + 30;
        this.angle = -Math.PI / 2;
      } else if (edge === 2) {
        this.x = -30;
        this.y = Math.random() * (h - 60) + 30;
        this.angle = 0;
      } else {
        this.x = w + 30;
        this.y = Math.random() * (h - 60) + 30;
        this.angle = Math.PI;
      }

      this.targetAngle = this.angle;
      this.rotation = Math.random() * 360;
      this.rotSpeed = (Math.random() - 0.5) * 1.5;
      this.speed = 0.6 + Math.random() * 0.6; // gentle cinematic drift
      this.changeTimer = Math.floor(Math.random() * 80) + 40;
      this.isCollected = false;

      // Click / Touch Handler
      const handleTrigger = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.collect();
      };

      this.el.addEventListener('click', handleTrigger);
      this.el.addEventListener('touchstart', handleTrigger, { passive: false });
    }

    update() {
      if (this.isCollected) return;

      const w = window.innerWidth;
      const h = window.innerHeight;

      // Gentle direction wandering
      this.changeTimer--;
      if (this.changeTimer <= 0) {
        this.targetAngle = this.angle + (Math.random() - 0.5) * 1.4;
        this.changeTimer = Math.floor(Math.random() * 100) + 60;
      }

      // Smooth bounce off viewport borders
      const margin = 35;
      if (this.x < margin) this.targetAngle = 0;
      else if (this.x > w - margin) this.targetAngle = Math.PI;
      if (this.y < margin) this.targetAngle = Math.PI / 2;
      else if (this.y > h - margin) this.targetAngle = -Math.PI / 2;

      // Smooth turning
      let diff = this.targetAngle - this.angle;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      this.angle += diff * 0.04;

      // Move
      this.x += Math.cos(this.angle) * this.speed;
      this.y += Math.sin(this.angle) * this.speed;
      this.rotation += this.rotSpeed;

      // Render
      this.el.style.transform = `translate3d(${this.x}px, ${this.y}px, 0) rotate(${this.rotation}deg)`;
    }

    collect() {
      if (this.isCollected) return;
      this.isCollected = true;
      this.el.classList.add('collected');

      // Audio feedback
      playSound(this.type);

      // Floating Badge & Particles
      showItemBadge(this.x, this.y, this.type);
      createGoldBurst(this.x, this.y);

      // Score increment
      itemsMastered++;
      updateHud();

      // Fade & Remove
      setTimeout(() => {
        if (this.el.parentNode) this.el.parentNode.removeChild(this.el);
        activeItems = activeItems.filter(item => item !== this);

        // Respawn after 3.5 seconds to keep max 2 clappers + 2 davinci
        setTimeout(() => {
          respawnIfNeeded(this.type);
        }, 3500);
      }, 350);
    }
  }

  // ── Respawn Logic: strictly max 2 clappers & max 2 davinci ──
  function respawnIfNeeded(type) {
    const countOfType = activeItems.filter(it => it.type === type && !it.isCollected).length;
    if (countOfType < 2) {
      activeItems.push(new CinemaItem(type));
    }
  }

  // ── Floating Badge ────────────────────────────────
  function showItemBadge(x, y, type) {
    const badge = document.createElement('div');
    badge.className = 'cinema-badge-float';
    badge.innerHTML = type === 'clapper' ? '+1 Take Approved! 🎬' : '+1 Color Graded! 🎨';
    badge.style.left = `${x}px`;
    badge.style.top = `${y}px`;
    container.appendChild(badge);

    setTimeout(() => {
      if (badge.parentNode) badge.parentNode.removeChild(badge);
    }, 1100);
  }

  // ── Golden Embers Burst ───────────────────────────
  function createGoldBurst(x, y) {
    const colors = ['#d4af37', '#f59e0b', '#aa8c2c', '#ffffff'];
    for (let i = 0; i < 8; i++) {
      const p = document.createElement('div');
      p.className = 'cinema-particle';
      const color = colors[i % colors.length];
      p.style.backgroundColor = color;
      p.style.boxShadow = `0 0 10px ${color}`;
      p.style.left = `${x + 14}px`;
      p.style.top = `${y + 14}px`;

      const angle = (Math.PI * 2 * i) / 8 + (Math.random() - 0.5) * 0.4;
      const dist = 24 + Math.random() * 26;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist;

      p.style.setProperty('--dx', `${dx}px`);
      p.style.setProperty('--dy', `${dy}px`);
      container.appendChild(p);

      setTimeout(() => {
        if (p.parentNode) p.parentNode.removeChild(p);
      }, 650);
    }
  }

  // ── HUD Update & Victory Toast ────────────────────
  function updateHud() {
    hud.classList.add('pulse');
    setTimeout(() => hud.classList.remove('pulse'), 400);

    if (itemsMastered >= WIN_GOAL) {
      hudCount.textContent = `Master 4K Export Ready! 🏆`;
      hud.classList.add('all-mastered');
      showWinToast();
    } else {
      hudCount.textContent = `${itemsMastered} / ${WIN_GOAL} Mastered`;
    }
  }

  function showWinToast() {
    let toast = document.querySelector('.cinema-win-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'cinema-win-toast';
      toast.innerHTML = `🎬 <strong>Master Cut Complete!</strong> All takes approved &amp; graded in 4K UHD.`;
      document.body.appendChild(toast);
    }
    setTimeout(() => {
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
      }, 4000);
    }, 100);
  }

  // ── Animation Loop ────────────────────────────────
  function loop() {
    activeItems.forEach(item => item.update());
    animFrameId = requestAnimationFrame(loop);
  }

  // ── Initialization: Exactly 2 Clapperboards & 2 DaVinci Logos ──
  const initialSetup = ['clapper', 'davinci', 'clapper', 'davinci'];
  initialSetup.forEach((type, idx) => {
    setTimeout(() => {
      activeItems.push(new CinemaItem(type));
    }, idx * 600);
  });

  loop();

  window.addEventListener('beforeunload', () => {
    if (animFrameId) cancelAnimationFrame(animFrameId);
  });
})();
