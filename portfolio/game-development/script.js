document.body.classList.add('is-loading');

const loader = document.getElementById('loader');
const loadPercent = document.getElementById('loadPercent');
const progressBar = document.querySelector('.loader-progress span');
let progress = 0;

const loadingTimer = window.setInterval(() => {
  progress = Math.min(100, progress + Math.ceil(Math.random() * 13));
  if (loadPercent) loadPercent.textContent = String(progress).padStart(2, '0');
  if (progressBar) progressBar.style.width = `${progress}%`;

  if (progress >= 100) {
    window.clearInterval(loadingTimer);
    window.setTimeout(() => {
      loader?.classList.add('done');
      document.body.classList.remove('is-loading');
      revealVisibleItems();
    }, 180);
  }
}, 80);

loader?.addEventListener('animationend', (event) => {
  if (event.animationName === 'loader-exit') loader.classList.add('hidden');
});

const revealItems = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('in-view');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.14, rootMargin: '0px 0px -5% 0px' });

revealItems.forEach((item) => revealObserver.observe(item));

function revealVisibleItems() {
  revealItems.forEach((item) => {
    if (item.getBoundingClientRect().top < window.innerHeight * 0.92) {
      item.classList.add('in-view');
    }
  });
}

const cursorGlow = document.getElementById('cursorGlow');
if (window.matchMedia('(pointer: fine)').matches) {
  window.addEventListener('pointermove', (event) => {
    if (!cursorGlow) return;
    cursorGlow.animate(
      { left: `${event.clientX}px`, top: `${event.clientY}px` },
      { duration: 600, fill: 'forwards', easing: 'cubic-bezier(.2,.8,.2,1)' }
    );
  });
}
