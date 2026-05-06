const revealElements = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.2,
  }
);

revealElements.forEach((element) => observer.observe(element));

const heroHeading = document.querySelector('.hero h1');

if (heroHeading) {
  const lineSpans = heroHeading.querySelectorAll(':scope > span');
  let globalCharIndex = 0;

  lineSpans.forEach((line) => {
    const text = line.textContent || '';
    line.setAttribute('aria-label', text);

    const fragment = document.createDocumentFragment();

    for (const char of text) {
      const charSpan = document.createElement('span');
      charSpan.className = 'letter';
      charSpan.style.setProperty('--char-index', String(globalCharIndex));

      if (char === ' ') {
        charSpan.innerHTML = '&nbsp;';
      } else {
        charSpan.textContent = char;
      }

      fragment.appendChild(charSpan);
      globalCharIndex += 1;
    }

    line.textContent = '';
    line.appendChild(fragment);
  });

  heroHeading.classList.add('hero-split');

  requestAnimationFrame(() => {
    heroHeading.classList.add('hero-animate');
  });
}

const typewriterEl = document.getElementById('typewriter-text');

if (typewriterEl) {
  let words = [];

  try {
    words = JSON.parse(typewriterEl.dataset.words || '[]');
  } catch {
    words = [];
  }

  if (Array.isArray(words) && words.length > 0) {
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    const tick = () => {
      const currentWord = words[wordIndex];

      if (isDeleting) {
        charIndex -= 1;
      } else {
        charIndex += 1;
      }

      typewriterEl.textContent = currentWord.slice(0, Math.max(charIndex, 0));

      if (!isDeleting && charIndex >= currentWord.length) {
        isDeleting = true;
        setTimeout(tick, 1400);
        return;
      }

      if (isDeleting && charIndex <= 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
      }

      const speed = isDeleting ? 45 : 90;
      setTimeout(tick, speed);
    };

    setTimeout(tick, 500);
  }
}

// Theme Toggle Logic
const themeToggleBtn = document.getElementById('theme-toggle');
const currentTheme = localStorage.getItem('theme') || 'light';

if (currentTheme === 'dark') {
  document.documentElement.setAttribute('data-theme', 'dark');
  if (themeToggleBtn) themeToggleBtn.textContent = '☀️';
}

if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    let theme = document.documentElement.getAttribute('data-theme');
    if (theme === 'dark') {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
      themeToggleBtn.textContent = '🌑';
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      themeToggleBtn.textContent = '☀️';
    }
  });
}

// ──────────────── AI Trivia System (Real Scratch-off) ────────────────
const aiFacts = [
  "The first AI was developed in 1951—a checkers program that could learn from its mistakes.",
  "LLMs don't 'think'—they predict the next most likely token based on trillions of patterns.",
  "The 'AI Winter' of the 70s occurred when funding vanished due to over-hyped expectations.",
  "Neural networks are loosely inspired by the interconnected structure of biological neurons.",
  "In 2016, DeepMind's AlphaGo defeated world champion Lee Sedol in the complex game of Go.",
  "The term 'Artificial Intelligence' was officially coined at the Dartmouth Workshop in 1956.",
  "Modern AI was 'unlocked' by GPU acceleration, originally designed for video games.",
  "GPT stands for 'Generative Pre-trained Transformer'—a specific type of deep learning model.",
  "RAG (Retrieval-Augmented Generation) prevents AI 'hallucinations' by using external data.",
  "The 'T' in GPT (Transformer) was introduced in Google's 2017 'Attention Is All You Need' paper.",
  "AI can now detect certain cancers from medical images with higher accuracy than radiologists.",
  "NLP (Natural Language Processing) is the bridge that allows computers to understand human talk."
];

const scratchCard = document.getElementById('scratch-card');
const factContent = document.getElementById('fact-content');
const refreshBtn = document.getElementById('refresh-fact');
const canvas = document.getElementById('scratch-canvas');
const scratchText = document.getElementById('scratch-text');

if (canvas && scratchCard && factContent && refreshBtn) {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  let isDrawing = false;
  let revealTimer = null;

  const initCanvas = () => {
    const w = canvas.offsetWidth || 300;
    const h = canvas.offsetHeight || 200;

    canvas.width = w;
    canvas.height = h;

    // Premium Dark Foil Mask
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#121c26'; // Deep midnight blue/dark gray
    ctx.fillRect(0, 0, w, h);

    // Add metallic/grain texture
    for (let i = 0; i < 500; i++) {
      ctx.fillStyle = `rgba(130, 160, 200, ${Math.random() * 0.12})`;
      ctx.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5);
    }

    scratchCard.classList.remove('revealed');
    if (scratchText) {
      scratchText.style.opacity = '1';
      scratchText.textContent = "SCRATCH HERE";
    }
    if (revealTimer) clearTimeout(revealTimer);
    revealTimer = null;
  };

  const setRandomFact = () => {
    const randomIndex = Math.floor(Math.random() * aiFacts.length);
    factContent.textContent = aiFacts[randomIndex];
    setTimeout(initCanvas, 50);
  };

  const getPos = (e) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
    const clientY = (e.touches && e.touches[0]) ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const scratch = (x, y) => {
    // Feathered Scratching (Radial Gradient for "soft" erasure)
    const brushRadius = 40;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, brushRadius);
    gradient.addColorStop(0, 'rgba(0,0,0,1)'); // Full erase at center
    gradient.addColorStop(0.6, 'rgba(0,0,0,0.8)'); // Softening
    gradient.addColorStop(1, 'rgba(0,0,0,0)'); // Transparent at edge

    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, brushRadius, 0, Math.PI * 2);
    ctx.fill();

    if (scratchText) scratchText.style.opacity = '0.15';

    // Start reveal timer on the first scratch move
    if (!revealTimer) {
      revealTimer = setTimeout(() => {
        scratchCard.classList.add('revealed');
      }, 2000); // 2 seconds to reveal
    }
  };

  const startDragging = (e) => {
    isDrawing = true;
    const pos = getPos(e);
    scratch(pos.x, pos.y);
  };

  canvas.addEventListener('mousedown', startDragging);
  canvas.addEventListener('touchstart', (e) => {
    startDragging(e);
    e.preventDefault();
  }, { passive: false });

  window.addEventListener('mouseup', () => isDrawing = false);
  window.addEventListener('touchend', () => isDrawing = false);

  canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    const pos = getPos(e);
    scratch(pos.x, pos.y);
  });

  canvas.addEventListener('touchmove', (e) => {
    if (!isDrawing) return;
    const pos = getPos(e);
    scratch(pos.x, pos.y);
    e.preventDefault();
  }, { passive: false });

  window.addEventListener('resize', () => {
    if (!scratchCard.classList.contains('revealed')) initCanvas();
  });

  setRandomFact();

  refreshBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    setRandomFact();
  });
}
