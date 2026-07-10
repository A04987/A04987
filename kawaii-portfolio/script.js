// ===== Bunny OS boot screen — dismiss after load (min display so it's seen) =====
(function () {
  const boot = document.getElementById('boot');
  if (!boot) return;
  const MIN_MS = 2000;
  const start = performance.now();
  const dismiss = () => {
    const wait = Math.max(0, MIN_MS - (performance.now() - start));
    setTimeout(() => boot.classList.add('done'), wait);
  };
  if (document.readyState === 'complete') dismiss();
  else window.addEventListener('load', dismiss);
  setTimeout(() => boot.classList.add('done'), 5000); // safety fallback
  boot.addEventListener('transitionend', () => {
    if (boot.classList.contains('done')) boot.style.display = 'none';
  });
})();

// ===== Scroll reveal (enhances already-visible content) =====
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealEls = document.querySelectorAll('.reveal');
if (prefersReduced || !('IntersectionObserver' in window)) {
  revealEls.forEach((el) => el.classList.add('in'));
} else {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  revealEls.forEach((el) => io.observe(el));
}

// ===== Theme toggle =====
const themeToggle = document.getElementById('themeToggle');
themeToggle?.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  themeToggle.textContent = document.body.classList.contains('dark') ? '☀' : '☾';
});

// ===== Gallery filter chips =====
document.querySelectorAll('.chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.chip').forEach((c) => c.classList.remove('active'));
    chip.classList.add('active');
  });
});

// ===== Nav active state on scroll =====
const navLinks = document.querySelectorAll('.nav-links a');
const sections = ['home', 'gallery', 'animations', 'contact'];
function updateActiveNav() {
  const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;
  let current = 'home';
  if (atBottom) {
    current = 'contact';
  } else {
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el && window.scrollY >= el.offsetTop - 140) current = id;
    });
  }
  navLinks.forEach((a) => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + current);
  });
}
window.addEventListener('scroll', updateActiveNav);
window.addEventListener('resize', updateActiveNav);
updateActiveNav();

// ===== Expression strip: arrows cycle the tiles =====
const exprTiles = document.getElementById('exprTiles');
document.getElementById('exprPrev')?.addEventListener('click', () => {
  exprTiles.prepend(exprTiles.lastElementChild);
});
document.getElementById('exprNext')?.addEventListener('click', () => {
  exprTiles.append(exprTiles.firstElementChild);
});

// ===== Featured player: queue swaps into the big screen =====
const featTitle = document.getElementById('featTitle');
const featDesc = document.getElementById('featDesc');
const featDur = document.getElementById('featDur');
const featLikes = document.getElementById('featLikes');
document.querySelectorAll('.q-item').forEach((item) => {
  item.addEventListener('click', () => {
    // remember what's currently featured
    const prev = {
      title: featTitle.textContent,
      desc: featDesc.textContent,
      dur: featDur.textContent,
      likes: featLikes.textContent,
    };
    // promote the clicked item
    featTitle.textContent = item.dataset.title;
    featDesc.textContent = item.dataset.desc;
    featDur.textContent = item.dataset.dur;
    featLikes.textContent = item.dataset.likes;
    // demote the previous featured into this slot
    item.dataset.title = prev.title;
    item.dataset.desc = prev.desc;
    item.dataset.dur = prev.dur;
    item.dataset.likes = prev.likes;
    item.querySelector('.q-info strong').textContent = prev.title;
    item.querySelector('.q-info em').textContent = `${prev.dur} · ${prev.likes}`;
  });
});

/* ============================================================
   Interactions: toasts, lightbox, video, "view all" sheets
   ============================================================ */
(function () {
  // ---- Toast ----
  const toastWrap = document.getElementById('toastWrap');
  function toast(msg) {
    if (!toastWrap) return;
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    toastWrap.appendChild(t);
    setTimeout(() => {
      t.classList.add('out');
      t.addEventListener('animationend', () => t.remove(), { once: true });
    }, 2200);
  }

  // ---- Doodle art (reused for generated cards + reference) ----
  const D = {
    heart: '<svg class="doodle" viewBox="0 0 48 48"><path d="M24 40 C10 30 4 20 10 12 C14 6 22 8 24 14 C26 8 34 6 38 12 C44 20 38 30 24 40 Z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/></svg>',
    moon: '<svg class="doodle" viewBox="0 0 48 48"><path d="M30 6 C20 8 14 17 16 27 C18 37 28 43 38 40 C30 40 22 33 21 24 C20 15 24 9 30 6 Z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/></svg>',
    star: '<svg class="doodle" viewBox="0 0 48 48"><path d="M24 4 L28.5 17 L42 18 L31.5 26.5 L35.5 40 L24 31.5 L12.5 40 L16.5 26.5 L6 18 L19.5 17 Z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/></svg>',
    bunny: '<svg class="doodle" viewBox="0 0 60 54"><ellipse cx="22" cy="14" rx="6" ry="15" transform="rotate(-12 22 14)" fill="none" stroke="currentColor" stroke-width="2.4"/><ellipse cx="38" cy="14" rx="6" ry="15" transform="rotate(12 38 14)" fill="none" stroke="currentColor" stroke-width="2.4"/><circle cx="30" cy="36" r="16" fill="none" stroke="currentColor" stroke-width="2.4"/></svg>',
    flower: '<svg class="doodle" viewBox="0 0 48 48"><circle cx="24" cy="24" r="5" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M24 19 C24 10 30 8 30 8 C34 12 30 19 24 19 Z M29 24 C38 24 40 30 40 30 C36 34 29 30 29 24 Z M24 29 C24 38 18 40 18 40 C14 36 18 29 24 29 Z M19 24 C10 24 8 18 8 18 C12 14 19 18 19 24 Z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/></svg>',
    cloud: '<svg class="doodle" viewBox="0 0 48 48"><path d="M14 34 C8 34 5 29 8 25 C6 19 12 15 17 17 C19 11 28 10 31 16 C38 15 42 22 38 27 C41 31 37 34 33 34 Z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/></svg>',
  };
  const DOODLES = [D.heart, D.moon, D.star, D.bunny, D.flower, D.cloud];
  const TINTS = ['ph-lilac', 'ph-night', 'ph-peach', 'ph-mint', 'ph-pink', 'ph-sky'];
  const CATS = ['Original', 'Fanart', 'Character Design', 'Illustration'];
  const CAPS = ['lorem ipsum', 'dolor sit', 'amet elit', 'consectetur', 'adipiscing', 'sed do', 'eiusmod', 'tempor magna', 'ipsum aliqua'];
  const DRIVE_GALLERY_PROXY_URL = 'https://script.google.com/macros/s/AKfycbznk_-isa6cPTyoLn99ve2gwxtM_2WDkOH73s1SnD_e7aOyjVQTbse6lEuBzF3Kt6g4/exec';
  const DRIVE_FOLDERS = [
    { key: 'roblox-character', label: 'Roblox character', folderId: '1PAfD2gnO5X8lCviyft9A9QD99lVkfqc7' },
    { key: 'anime', label: 'Anime', folderId: '1j2QSLyntYBMx7zcL1vl0JaeIR1RUbJhP' },
    { key: 'vtuber', label: 'Vtuber', folderId: '1AzSd-m4AxVRGE44pMt826TH6e0Mnvtez' },
    { key: 'vocaloid', label: 'Vocaloid', folderId: '1MlJIFuHK32ljoGuOXudzilTImpPIx2d2' },
  ];
  const FAN_ART_FOLDER = { key: 'fan-art', label: 'Fan art', folderId: '1j_Wg-RnfLyC7gE7Je10HyxnHLDEzZYEr' };
  const FEATURED_ARTWORKS = [
    { id: '1GYdjdrhAH5KTFbLbvIB5RHNbkcoQMoqy', title: 'First Profile', cat: 'Original' },
    { id: '10OvxSjORykNjGo9LzWl-aptqGqdQT-RC', title: 'Orange', cat: 'Character Design' },
    { id: '1DdoCQ2ivwshryjCFCUNK_ze7dlNytEd7', title: 'Untitled Artwork', cat: 'Illustration' },
    { id: '12YIRfFd1lZ_RZY4BQydcTT0G5zyjlfw4', title: 'Owen', cat: 'Character Design' },
    { id: '18ZrsiNtUQbIgBdF2Kfc9TPXIHriLxoyG', title: 'Miga', cat: 'Character Design' },
    { id: '1LLkmRlEcyPH0Ov1u12RSvtK_C1FrlI9O', title: 'Reuse Halloween', cat: 'Original' },
  ];
  const driveImage = (id, size = 1200) => `https://drive.google.com/thumbnail?id=${id}&sz=w${size}`;
  const normalizeDriveFile = (file, folder) => ({
    id: file.id,
    title: file.title || file.name || 'Artwork',
    cat: folder.label,
  });
  const randomize = (items) => [...items].sort(() => Math.random() - 0.5);
  const comingSoonFigure = (label, i = 0, extraClass = '') => `
      <figure class="polaroid coming-soon ${extraClass}" tabindex="0" data-cat="${label}" data-title="${label}">
        <div class="photo ${TINTS[i % TINTS.length]} tall">
          ${DOODLES[i % DOODLES.length]}
          <span class="ph-label">Coming soon</span>
        </div>
        <figcaption>${label}</figcaption>
      </figure>`;
  const artFigure = (art, i, extraClass = '') => `
      <figure class="polaroid ${extraClass}" tabindex="0" data-cat="${art.cat}" data-image="${driveImage(art.id, 1600)}" data-title="${art.title}">
        <div class="photo ${TINTS[i % TINTS.length]}${i % 3 === 0 ? ' tall' : ''}">
          <img src="${driveImage(art.id)}" alt="${art.title}" loading="lazy" />
          <span class="ph-label">${art.title}</span>
        </div>
        <figcaption>${art.cat}</figcaption>
      </figure>`;
  const fanArtFigure = (art, i) => `
      <figure class="polaroid fan-art-card" tabindex="0" data-cat="${art.cat}" data-image="${driveImage(art.id, 1600)}" data-title="${art.title}">
        <div class="photo ${TINTS[i % TINTS.length]}">
          <img src="${driveImage(art.id)}" alt="${art.title}" loading="lazy" />
          <span class="ph-label">${art.title}</span>
        </div>
        <figcaption>Community love</figcaption>
      </figure>`;

  // ---- Modal helpers ----
  function openModal(dlg) { if (dlg && !dlg.open) dlg.showModal(); }
  function closeModal(dlg) { if (dlg && dlg.open) dlg.close(); }
  // click on backdrop closes
  document.querySelectorAll('dialog.modal').forEach((dlg) => {
    dlg.addEventListener('click', (e) => { if (e.target === dlg) closeModal(dlg); });
  });

  // ---- Lightbox ----
  const lightbox = document.getElementById('lightbox');
  const lbStage = document.getElementById('lbStage');
  const lbTitle = document.getElementById('lbTitle');
  const lbCap = document.getElementById('lbCap');
  const lbCat = document.getElementById('lbCat');
  let lbList = [], lbIndex = 0;

  function renderLightbox() {
    const fig = lbList[lbIndex];
    if (!fig) return;
    const photo = fig.querySelector('.photo');
    const tint = [...photo.classList].find((c) => c.startsWith('ph-')) || 'ph-lilac';
    const doodle = photo.querySelector('.doodle');
    const image = fig.dataset.image || photo.querySelector('img')?.src;
    lbStage.className = 'lb-stage ' + tint;
    lbStage.innerHTML = image
      ? `<img src="${image}" alt="${fig.dataset.title || 'Artwork'}" />`
      : (doodle ? doodle.outerHTML : '');
    lbTitle.textContent = fig.dataset.title || photo.querySelector('.ph-label')?.textContent || 'Artwork';
    lbCap.textContent = fig.querySelector('figcaption')?.textContent || '';
    lbCat.textContent = fig.dataset.cat || CATS[lbIndex % CATS.length];
  }
  function openLightbox(fig) {
    lbList = Array.from(fig.closest('.scrapbook, .sheet-grid, .fan-art-track').querySelectorAll('.polaroid'));
    lbIndex = lbList.indexOf(fig);
    renderLightbox();
    openModal(lightbox);
  }
  document.getElementById('lbPrev')?.addEventListener('click', () => { lbIndex = (lbIndex - 1 + lbList.length) % lbList.length; renderLightbox(); });
  document.getElementById('lbNext')?.addEventListener('click', () => { lbIndex = (lbIndex + 1) % lbList.length; renderLightbox(); });
  lightbox?.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') document.getElementById('lbPrev').click();
    if (e.key === 'ArrowRight') document.getElementById('lbNext').click();
  });

  // ---- Video modal ----
  const videoModal = document.getElementById('videoModal');
  const vidBar = document.getElementById('vidBar');
  const vidPlay = document.getElementById('vidPlay');
  const PLAY_ICON = '<svg viewBox="0 0 24 24" width="30" height="30"><path d="M8 5 L19 12 L8 19 Z" fill="currentColor"/></svg>';
  const PAUSE_ICON = '<svg viewBox="0 0 24 24" width="30" height="30"><rect x="6" y="5" width="4" height="14" rx="1.5" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1.5" fill="currentColor"/></svg>';
  let vidPlaying = false;

  function parseDur(s) { const [m, ss] = (s || '00:15').replace(/[^\d:]/g, '').split(':').map(Number); return (m * 60 + (ss || 0)) || 15; }
  function resetVid() {
    vidPlaying = false;
    vidPlay.classList.remove('playing');
    vidPlay.innerHTML = PLAY_ICON;
    vidBar.style.transition = 'none';
    vidBar.style.width = '0%';
  }
  function openVideo(data) {
    document.getElementById('vidTitle').textContent = data.title;
    document.getElementById('vidDesc').textContent = data.desc;
    document.getElementById('vidDur').textContent = data.dur;
    document.getElementById('vidLikes').textContent = data.likes;
    resetVid();
    openModal(videoModal);
  }
  vidPlay?.addEventListener('click', () => {
    vidPlaying = !vidPlaying;
    vidPlay.classList.toggle('playing', vidPlaying);
    vidPlay.innerHTML = vidPlaying ? PAUSE_ICON : PLAY_ICON;
    if (vidPlaying) {
      const secs = parseDur(document.getElementById('vidDur').textContent);
      vidBar.style.transition = `width ${secs}s linear`;
      requestAnimationFrame(() => { vidBar.style.width = '100%'; });
    } else {
      const w = getComputedStyle(vidBar).width;
      vidBar.style.transition = 'none';
      vidBar.style.width = w;
    }
  });
  videoModal?.addEventListener('close', resetVid);
  // featured player → open video with current featured meta
  document.querySelector('#featured .screen')?.addEventListener('click', () => {
    openVideo({
      title: document.getElementById('featTitle').textContent,
      desc: document.getElementById('featDesc').textContent,
      dur: document.getElementById('featDur').textContent,
      likes: document.getElementById('featLikes').textContent,
    });
  });

  // ---- Build the "view all" sheets ----
  const scrapbook = document.querySelector('.scrapbook');
  const featuredFilter = document.querySelector('#gallery .filter-row');
  const allFolder = { key: 'all', label: 'All' };
  const featuredFolder = allFolder;

  function renderFeaturedGallery(artworks, folder = allFolder) {
    if (!scrapbook) return;
    const visibleArtworks = randomize(artworks).slice(0, 6);

    scrapbook.innerHTML = visibleArtworks.length
      ? visibleArtworks.map((art, i) => artFigure(art, i, `p${i + 1}`)).join('')
      : comingSoonFigure(folder.label, 0, 'p1');
  }

  async function fetchDriveFolder(folder) {
    if (!DRIVE_GALLERY_PROXY_URL) return null;

    const url = new URL(DRIVE_GALLERY_PROXY_URL);
    url.searchParams.set('folderId', folder.folderId);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Drive gallery request failed: ${res.status}`);
    const data = await res.json();

    return (Array.isArray(data) ? data : data.files || [])
      .filter((file) => file.id && (!file.mimeType || file.mimeType.startsWith('image/')))
      .map((file) => normalizeDriveFile(file, folder));
  }

  async function fetchAllDriveFolders() {
    const groups = await Promise.all(
      DRIVE_FOLDERS.map((folder) => fetchDriveFolder(folder).catch(() => []))
    );

    return groups.flat();
  }

  async function loadFeaturedFolder(folder) {
    if (folder.key === 'all') {
      renderFeaturedGallery(FEATURED_ARTWORKS, folder);
      try {
        const files = await fetchAllDriveFolders();
        if (files.length) renderFeaturedGallery(files, folder);
      } catch (err) {
        console.warn('Featured Drive gallery fallback:', err);
      }
      return;
    }

    renderFeaturedGallery([], folder);
    try {
      const files = await fetchDriveFolder(folder);
      renderFeaturedGallery(files || [], folder);
    } catch (err) {
      console.warn('Featured Drive gallery fallback:', err);
      renderFeaturedGallery([], folder);
    }
  }

  loadFeaturedFolder(featuredFolder);

  featuredFilter?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-featured-folder]');
    if (!btn) return;

    featuredFilter.querySelectorAll('.chip').forEach((chip) => chip.classList.remove('active'));
    btn.classList.add('active');

    const folder = btn.dataset.featuredFolder === 'all'
      ? allFolder
      : DRIVE_FOLDERS.find((item) => item.key === btn.dataset.featuredFolder);

    if (folder) loadFeaturedFolder(folder);
  });

  const galleryGrid = document.getElementById('galleryGrid');
  const sheetFilter = document.querySelector('#sheetGallery .sheet-filter');
  let activeDriveFolder = featuredFolder;

  function renderGalleryMessage(message) {
    if (!galleryGrid) return;
    galleryGrid.innerHTML = `<p class="gallery-message">${message}</p>`;
  }

  async function loadDriveFolder(folder) {
    if (!galleryGrid) return;
    activeDriveFolder = folder;
    renderGalleryMessage(`Loading ${folder.label}...`);

    if (folder.key === 'all') {
      try {
        const files = DRIVE_GALLERY_PROXY_URL ? await fetchAllDriveFolders() : FEATURED_ARTWORKS;
        galleryGrid.innerHTML = files.length
          ? files.map((art, i) => artFigure(art, i)).join('')
          : `<p class="gallery-message">No images found yet.</p>`;
      } catch (err) {
        console.error(err);
        renderGalleryMessage('Could not load Google Drive folders. Check sharing and the Apps Script URL.');
      }
      return;
    }

    if (!DRIVE_GALLERY_PROXY_URL) {
      if (folder.key === 'roblox-character') {
        galleryGrid.innerHTML = FEATURED_ARTWORKS
          .map((art, i) => artFigure({ ...art, cat: folder.label }, i))
          .join('');
      } else {
        galleryGrid.innerHTML = comingSoonFigure(folder.label);
      }
      return;
    }

    try {
      const files = await fetchDriveFolder(folder);

      galleryGrid.innerHTML = files.length
        ? files.map((art, i) => artFigure(art, i)).join('')
        : comingSoonFigure(folder.label);
    } catch (err) {
      console.error(err);
      renderGalleryMessage('Could not load this Google Drive folder. Check sharing and the Apps Script URL.');
    }
  }

  if (sheetFilter) {
    sheetFilter.innerHTML = [allFolder, ...DRIVE_FOLDERS]
      .map((folder, i) => `<button class="chip ${i === 0 ? 'active' : ''}" data-folder-key="${folder.key}">${folder.label}</button>`)
      .join('');
    sheetFilter.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-folder-key]');
      if (!btn) return;
      sheetFilter.querySelectorAll('.chip').forEach((chip) => chip.classList.remove('active'));
      btn.classList.add('active');
      const folder = btn.dataset.folderKey === 'all'
        ? allFolder
        : DRIVE_FOLDERS.find((item) => item.key === btn.dataset.folderKey);
      if (folder) loadDriveFolder(folder);
    });
  }

  const fanArtTrack = document.getElementById('fanArtTrack');
  async function loadFanArtSection() {
    if (!fanArtTrack) return;

    try {
      const files = await fetchDriveFolder(FAN_ART_FOLDER);

      if (!files?.length) {
        fanArtTrack.innerHTML = comingSoonFigure('Community fan art');
        return;
      }

      const cards = files.map((art, i) => fanArtFigure(art, i)).join('');
      fanArtTrack.innerHTML = cards + cards;
    } catch (err) {
      console.warn('Fan art section fallback:', err);
      fanArtTrack.innerHTML = comingSoonFigure('Community fan art');
    }
  }

  loadFanArtSection();

  const animGrid = document.getElementById('animGrid');
  const ANIMS = [
    { t: 'Lorem Ipsum', d: 'Dolor sit amet, consectetur.', dur: '00:15', l: '♥ 4.2K' },
    { t: 'Dolor Sit Amet', d: 'Consectetur adipiscing elit.', dur: '00:20', l: '♥ 8.1K' },
    { t: 'Consectetur Elit', d: 'Eiusmod tempor incididunt.', dur: '00:16', l: '♥ 6.7K' },
    { t: 'Tempor Incididunt', d: 'Ut enim ad minim veniam.', dur: '00:16', l: '♥ 5.3K' },
    { t: 'Magna Aliqua', d: 'Quis nostrud exercitation.', dur: '00:12', l: '♥ 3.9K' },
    { t: 'Ut Labore', d: 'Ullamco laboris nisi ut.', dur: '00:22', l: '♥ 9.4K' },
  ];
  if (animGrid) {
    animGrid.innerHTML = ANIMS.map((a) => `
      <button class="vcard" data-title="${a.t}" data-desc="${a.d}" data-dur="${a.dur}" data-likes="${a.l}">
        <div class="vcard-screen"><span class="play">${PLAY_ICON.replace('width="30" height="30"', 'width="20" height="20"')}</span><i class="dur">${a.dur}</i></div>
        <h4>${a.t}</h4><p>${a.d}</p><span class="likes">${a.l}</span>
      </button>`).join('');
  }
  document.getElementById('viewAllArt')?.addEventListener('click', () => {
    openModal(document.getElementById('sheetGallery'));
    loadDriveFolder(activeDriveFolder);
  });
  document.getElementById('viewAllAnim')?.addEventListener('click', () => openModal(document.getElementById('sheetAnim')));

  // ---- Delegated clicks (works for dynamic sheet cards too) ----
  document.addEventListener('click', (e) => {
    const closeBtn = e.target.closest('[data-close]');
    if (closeBtn) { closeModal(closeBtn.closest('dialog')); return; }

    const toastBtn = e.target.closest('[data-toast]');
    if (toastBtn) {
      if (toastBtn.hasAttribute('data-toggle')) {
        const on = toastBtn.getAttribute('aria-pressed') !== 'true';
        toastBtn.setAttribute('aria-pressed', String(on));
        if (!on) return; // un-liking: no toast
      }
      toast(toastBtn.dataset.toast);
      return;
    }

    const poly = e.target.closest('.polaroid');
    if (poly) { openLightbox(poly); return; }

    const vcard = e.target.closest('.vcard');
    if (vcard) {
      openVideo({ title: vcard.dataset.title, desc: vcard.dataset.desc, dur: vcard.dataset.dur, likes: vcard.dataset.likes });
      return;
    }
  });

  // keyboard: Enter/Space on focusable polaroids
  document.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList?.contains('polaroid')) {
      e.preventDefault(); openLightbox(e.target);
    }
  });

  // ---- Wire the decorative "fake" buttons with toasts / toggles ----
  function wire(nodeList, messages, opts = {}) {
    nodeList.forEach((el, i) => {
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      const msg = messages[i % messages.length];
      const fire = () => {
        if (opts.toggle && opts.toggle.includes(i)) {
          const on = el.getAttribute('aria-pressed') !== 'true';
          el.setAttribute('aria-pressed', String(on));
          if (!on) return;
        }
        toast(msg);
      };
      el.addEventListener('click', fire);
      el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fire(); } });
    });
  }

  wire(document.querySelectorAll('#tileRow .tile'),
    ['♥ Liked Moji!', '💬 Say hi in the guestbook — soon ♥', '🔖 Bookmarked!'], { toggle: [0, 2] });
  wire(document.querySelectorAll('#actionBar .ab-btn'),
    ['♥ Liked!', '🔗 Link copied!', '🔖 Saved to your board!', '💬 Comments — coming soon ♥'], { toggle: [0, 2] });
  wire(document.querySelectorAll('#iconRail .rail-btn'),
    ['👤 Profile — coming soon', '📸 Gallery — coming soon', '🔔 Alerts — coming soon', '🔖 Saved — coming soon']);
  wire(document.querySelectorAll('.poster-socials span'),
    ['🐰 @moji.studio — soon ♥', '♥ Thanks for the love!', '🐰 @moji on X — soon ♥'], { toggle: [1] });
  wire(document.querySelectorAll('.finale .social-pill span'),
    ['🐰 @moji on X — soon ♥', '🐰 @moji.studio — soon ♥', '🎵 Playlist — coming soon']);

  // nav social buttons already carry data-toast → handled by delegation above.

  // ---- Search pill: playful response on Enter ----
  const searchInput = document.getElementById('searchInput');
  searchInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const q = searchInput.value.trim();
      toast(q ? `🔍 "${q}" — Moji is a cutie ♥` : '🐰 Moji is a cutie ♥');
      searchInput.value = '';
    }
  });
})();
