(() => {
  const bridgeMarkup = `
    <div class="transition-bridge" id="transitionBridge" aria-hidden="true">
      <div class="bridge-grid"></div>
      <div class="bridge-stage bridge-stage-portfolio">
        <div class="bridge-window">
          <div class="bridge-window-bar">
            <i></i><i></i><i></i><b>Bunny OS</b><small>v2.6</small>
          </div>
          <div class="bridge-window-body">
            <div class="bridge-pixel-bunny">
              <svg viewBox="0 0 14 15" width="132" height="142" shape-rendering="crispEdges" aria-hidden="true">
                <rect x="3" y="1" width="2" height="6" class="bridge-px-w"/>
                <rect x="9" y="1" width="2" height="6" class="bridge-px-w"/>
                <rect x="4" y="2" width="1" height="3" class="bridge-px-p"/>
                <rect x="9" y="2" width="1" height="3" class="bridge-px-p"/>
                <rect x="2" y="6" width="10" height="8" class="bridge-px-w"/>
                <rect x="1" y="8" width="1" height="4" class="bridge-px-w"/>
                <rect x="12" y="8" width="1" height="4" class="bridge-px-w"/>
                <rect x="4" y="9" width="1" height="2" class="bridge-px-i"/>
                <rect x="9" y="9" width="1" height="2" class="bridge-px-i"/>
                <rect x="3" y="10" width="1" height="1" class="bridge-px-p"/>
                <rect x="10" y="10" width="1" height="1" class="bridge-px-p"/>
                <rect x="6" y="10" width="2" height="1" class="bridge-px-p"/>
                <rect x="2" y="14" width="3" height="1" class="bridge-px-p"/>
                <rect x="9" y="14" width="3" height="1" class="bridge-px-p"/>
              </svg>
            </div>
            <strong>booting cuteness...</strong>
            <div class="bridge-mini-progress"><span></span></div>
            <small class="bridge-hint">♥ loading Moji Studio ♥</small>
          </div>
        </div>
      </div>
      <div class="bridge-stage bridge-stage-game">
        <div class="bridge-game-orbit"><span>M//DEV</span></div>
        <div class="bridge-game-copy">
          <p>ROBLOX STUDIO PORTFOLIO</p>
          <strong>INITIALIZING</strong>
          <div class="bridge-game-progress"><span></span></div>
          <small>00% / BUILD 01</small>
        </div>
      </div>
      <div class="bridge-glitch"></div>
    </div>`;

  document.body.insertAdjacentHTML('beforeend', bridgeMarkup);
  const bridge = document.getElementById('transitionBridge');
  const portfolioLoader = document.getElementById('boot');
  const gameLoader = document.getElementById('loader');
  let transitionRunning = false;
  let activeNativeLoader = null;

  function restartAnimations(root) {
    const animatedItems = root.querySelectorAll(
      '.boot-window, .pixel-bunny svg, .boot-dots i, .boot-bar span, .loader-orbit, .orbit, .loader-progress span'
    );
    animatedItems.forEach((item) => { item.style.animation = 'none'; });
    void root.offsetWidth;
    animatedItems.forEach((item) => { item.style.removeProperty('animation'); });
  }

  function resetLoaderState(loader) {
    if (loader.id === 'boot') {
      const bootBar = loader.querySelector('.boot-bar span');
      if (bootBar) bootBar.style.removeProperty('width');
    }

    if (loader.id === 'loader') {
      const progress = loader.querySelector('.loader-progress span');
      const percent = loader.querySelector('#loadPercent');
      if (progress) {
        progress.style.transition = 'none';
        progress.style.width = '0%';
      }
      if (percent) percent.textContent = '00';
      void loader.offsetWidth;
      if (progress) progress.style.removeProperty('transition');
    }

    restartAnimations(loader);
  }

  function showNativeLoader(direction) {
    activeNativeLoader = direction === 'to-game' ? portfolioLoader : gameLoader;
    if (!activeNativeLoader) return;

    activeNativeLoader.classList.remove('done', 'hidden');
    activeNativeLoader.classList.add('bridge-native-loader');
    activeNativeLoader.style.display = 'grid';
    activeNativeLoader.style.opacity = '1';
    activeNativeLoader.style.visibility = 'visible';
    activeNativeLoader.style.transform = 'translateX(0)';
    resetLoaderState(activeNativeLoader);
  }

  function hideNativeLoader() {
    if (!activeNativeLoader) return;
    activeNativeLoader.classList.remove('bridge-native-loader');
    activeNativeLoader.style.display = 'none';
    activeNativeLoader = null;
  }

  function navigateWithBridge(link, direction) {
    if (transitionRunning) return;
    transitionRunning = true;
    showNativeLoader(direction);
    bridge.classList.add('is-active', 'is-native-source');

    window.setTimeout(() => bridge.classList.add('is-glitching'), 360);
    window.setTimeout(() => {
      hideNativeLoader();
      bridge.classList.remove('is-native-source');
      bridge.classList.toggle('show-game', direction === 'to-game');
    }, 520);
    window.setTimeout(() => {
      window.location.href = link.href;
    }, 760);
  }

  document.querySelectorAll('[data-bridge]').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      navigateWithBridge(link, link.dataset.bridge);
    });
  });

  window.addEventListener('pageshow', (event) => {
    if (!event.persisted || !document.body.contains(bridge)) return;
    hideNativeLoader();
    bridge.className = 'transition-bridge';
    transitionRunning = false;
  });
})();
