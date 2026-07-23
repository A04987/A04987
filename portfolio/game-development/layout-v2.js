const projectFilters = document.querySelectorAll('[data-project-filter]');
const projectCards = document.querySelectorAll('[data-project-category]');
const devGlitchOverlay = document.getElementById('devGlitchOverlay');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let glitchTimer;

function triggerDevGlitch(duration = 380) {
  if (reduceMotion.matches || document.hidden || document.body.classList.contains('is-loading')) return;
  window.clearTimeout(glitchTimer);
  devGlitchOverlay?.classList.remove('active');
  void devGlitchOverlay?.offsetWidth;
  devGlitchOverlay?.classList.add('active');
  glitchTimer = window.setTimeout(() => {
    devGlitchOverlay?.classList.remove('active');
  }, duration);
}

projectFilters.forEach((button) => {
  button.addEventListener('click', () => {
    projectFilters.forEach((item) => item.classList.remove('active'));
    button.classList.add('active');

    const filter = button.dataset.projectFilter;
    projectCards.forEach((card) => {
      const visible = filter === 'all' || card.dataset.projectCategory === filter;
      card.classList.toggle('is-hidden', !visible);
    });
  });
});

const queueItems = document.querySelectorAll('.queue-item');
const featuredScreen = document.getElementById('featuredScreen');
const featuredSymbol = document.getElementById('featuredSymbol');
const featuredType = document.getElementById('featuredType');
const featuredTitle = document.getElementById('featuredTitle');
const featuredDescription = document.getElementById('featuredDescription');
const featuredStatus = document.getElementById('featuredStatus');
const featuredFocus = document.getElementById('featuredFocus');

queueItems.forEach((item) => {
  item.addEventListener('click', () => {
    triggerDevGlitch();
    queueItems.forEach((button) => button.classList.remove('active'));
    item.classList.add('active');

    featuredScreen.className = `featured-screen theme-${item.dataset.feature}`;
    featuredSymbol.textContent = item.dataset.symbol;
    featuredType.textContent = item.dataset.type;
    featuredTitle.textContent = item.dataset.title;
    featuredDescription.textContent = item.dataset.description;
    featuredStatus.textContent = item.dataset.status;
    featuredFocus.textContent = item.dataset.focus;
  });
});

const glitchSections = document.querySelectorAll('.dev-section, .ugc-marquee, .dev-finale');
const glitchObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    window.setTimeout(() => triggerDevGlitch(320), 120);
    glitchObserver.unobserve(entry.target);
  });
}, { threshold: .2 });

glitchSections.forEach((section) => glitchObserver.observe(section));

window.setTimeout(() => triggerDevGlitch(), 2600);
window.setInterval(() => triggerDevGlitch(300), 6800);

if (window.matchMedia('(pointer: fine)').matches && !reduceMotion.matches) {
  window.addEventListener('pointermove', (event) => {
    const x = (event.clientX / window.innerWidth - .5) * 2;
    const y = (event.clientY / window.innerHeight - .5) * 2;
    document.documentElement.style.setProperty('--pointer-x', `${(x * 12).toFixed(2)}px`);
    document.documentElement.style.setProperty('--pointer-y', `${(y * 9).toFixed(2)}px`);
    document.documentElement.style.setProperty('--pointer-x-reverse', `${(x * -7).toFixed(2)}px`);
    document.documentElement.style.setProperty('--pointer-y-reverse', `${(y * -5).toFixed(2)}px`);
  }, { passive: true });
}
