/* ─── Landing sequence + stream counter + album grid ─────────────────────── */

// ── Landing fade-in sequence ──────────────────────────────────────────────
function initLanding() {
  const landing = document.getElementById('landing');
  if (!landing) return;

  const steps = landing.querySelectorAll('[data-step]');
  steps.forEach((el) => {
    const delay = parseInt(el.dataset.step, 10);
    setTimeout(() => el.classList.add('show'), delay);
  });

  // Enable click-to-enter once the sequence has finished
  setTimeout(() => {
    landing.addEventListener('click', () => {
      landing.classList.add('hidden');
      document.body.style.overflow = '';
      setTimeout(() => landing.remove(), 700);
    });
  }, 2300);

  document.body.style.overflow = 'hidden';
}

// ── Stream counter ────────────────────────────────────────────────────────
// Reads baseline figures from data/stats.json and ticks up from there.
// These are ESTIMATES — see README for how to refresh them.
async function initCounter() {
  const numberEl = document.getElementById('counter-number');
  if (!numberEl) return;

  let stats;
  try {
    const res = await fetch('data/stats.json');
    stats = await res.json();
  } catch (e) {
    console.warn('Could not load stats.json');
    return;
  }

  const perSecond = stats.streamsPerDay / 24 / 3600;
  const daysSinceUpdate = (Date.now() - new Date(stats.lastUpdated).getTime()) / 86400000;

  // Roll the baseline forward to today so the number stays current
  // even if nobody updates stats.json for a while
  let count = stats.totalStreams + Math.floor(daysSinceUpdate * stats.streamsPerDay);

  const TICK_MS = 80;
  const perTick = (perSecond * TICK_MS) / 1000;
  let accumulator = 0;

  const render = () => {
    numberEl.textContent = Math.floor(count).toLocaleString('en-US');
  };

  render();

  setInterval(() => {
    accumulator += perTick;
    if (accumulator >= 1) {
      count += Math.floor(accumulator);
      accumulator -= Math.floor(accumulator);
      render();
    }
  }, TICK_MS);
}

// ── Album grid ────────────────────────────────────────────────────────────
const spotifyIcon = `<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>`;

const ENGINEER_LABELS = { john: 'John', tess: 'Tess' };

function engineerLabel(release) {
  const names = (release.engineers || []).map((e) => ENGINEER_LABELS[e] || e);
  return names.join(' & ');
}

// Cards open the release on Spotify. Releases without a direct link
// fall back to a Spotify search for artist + title.
function spotifyLink(release) {
  if (release.spotifyUrl) return release.spotifyUrl;
  return 'https://open.spotify.com/search/' + encodeURIComponent(`${release.artist} ${release.album}`);
}

function createCard(release) {
  const card = document.createElement('div');
  card.className = 'album-card';

  card.innerHTML = `
    <div class="album-spinner"><div class="spinner"></div></div>
    <div class="album-overlay">
      <div class="album-overlay-inner">
        ${release.award ? `<div class="album-award">${release.award}</div>` : ''}
        <h3 class="album-title">${release.album}</h3>
        <p class="album-meta">
          ${release.artist}
          <span class="album-listen">${spotifyIcon} Listen</span>
        </p>
        <p class="album-engineer">${engineerLabel(release)}</p>
      </div>
    </div>
  `;

  // Touch devices: first tap reveals the overlay, second opens Spotify
  const isTouch = window.matchMedia('(hover: none)').matches;
  card.addEventListener('click', (e) => {
    if (isTouch && !card.classList.contains('active')) {
      document.querySelectorAll('.album-card.active').forEach((c) => c.classList.remove('active'));
      card.classList.add('active');
      e.stopPropagation();
      return;
    }
    window.open(spotifyLink(release), '_blank', 'noopener,noreferrer');
    card.classList.remove('active');
  });

  // Load artwork once; the card keeps it through every filter and shuffle
  const searchTerm = release.itunesSearch || `${release.artist} ${release.album}`;
  fetchArtwork(searchTerm).then((url) => {
    const spinner = card.querySelector('.album-spinner');
    if (url) {
      const img = document.createElement('img');
      img.src = url;
      img.alt = `${release.album} by ${release.artist}`;
      img.loading = 'lazy';
      card.insertBefore(img, card.firstChild);
    } else {
      const fallback = document.createElement('div');
      fallback.className = 'album-fallback';
      fallback.textContent = release.artist.charAt(0);
      card.insertBefore(fallback, card.firstChild);
    }
    if (spinner) spinner.remove();
  });

  return card;
}

// Fisher–Yates: every order equally likely
function shuffle(list) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function initGrid() {
  const grid = document.getElementById('album-grid');
  if (!grid) return;

  let releases;
  try {
    const res = await fetch('data/albums.json');
    releases = await res.json();
  } catch (e) {
    grid.innerHTML = '<p style="color:#71717a;padding:40px;">Could not load discography.</p>';
    return;
  }

  // Build every card once. Filtering only hides, shows and reorders them,
  // so artwork is never fetched twice.
  const entries = releases.map((release) => ({ release, card: createCard(release) }));

  const buttons = document.querySelectorAll('.filter-btn');
  const countEl = document.getElementById('filter-count');
  let current = null;

  const layout = (filter, doShuffle) => {
    const matching = entries.filter((e) =>
      filter === 'all' || (e.release.engineers || []).includes(filter));
    const ordered = doShuffle ? shuffle(matching) : matching;

    entries.forEach((e) => { e.card.style.display = 'none'; });
    ordered.forEach((e, i) => {
      e.card.style.display = '';
      e.card.style.animationDelay = `${Math.min(i, 20) * 35}ms`;
      e.card.classList.remove('album-card--in');
      void e.card.offsetWidth;            // restart the fade-in animation
      e.card.classList.add('album-card--in');
      grid.appendChild(e.card);           // moves the existing node into order
    });

    buttons.forEach((b) => {
      const on = b.dataset.filter === filter;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });

    if (countEl) {
      countEl.textContent = `${ordered.length} release${ordered.length === 1 ? '' : 's'}`;
    }
  };

  const select = (filter, doShuffle) => {
    if (filter === current && !doShuffle) return;
    current = filter;

    // Keep the choice in the URL so a filtered view can be linked to
    const url = new URL(window.location);
    if (filter === 'all') url.searchParams.delete('engineer');
    else url.searchParams.set('engineer', filter);
    history.replaceState(null, '', url);

    if (!grid.children.length) { layout(filter, doShuffle); return; }
    grid.classList.add('is-shuffling');
    setTimeout(() => {
      layout(filter, doShuffle);
      grid.classList.remove('is-shuffling');
    }, 220);
  };

  // Every click reshuffles, including clicking the filter already selected
  buttons.forEach((b) => {
    b.addEventListener('click', () => select(b.dataset.filter, true));
  });

  // First load keeps the curated order, unless the URL asks for an engineer
  const fromUrl = new URLSearchParams(window.location.search).get('engineer');
  const initial = ENGINEER_LABELS[fromUrl] ? fromUrl : 'all';
  current = initial;
  layout(initial, initial !== 'all');
}

document.addEventListener('DOMContentLoaded', () => {
  // Skip the landing splash when arriving on a filtered link
  const engineer = new URLSearchParams(window.location.search).get('engineer');
  if (engineer) {
    const landing = document.getElementById('landing');
    if (landing) landing.remove();
  } else {
    initLanding();
  }
  initCounter();
  initGrid();
});
