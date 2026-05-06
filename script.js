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
