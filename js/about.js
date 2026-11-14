/* ─── Grammy carousel ────────────────────────────────────────────────────── */

/* Each entry carries an exact Apple album id. Earlier these used track-name
   searches ("Billie Eilish bad guy"), which matched the wrong single once the
   artwork lookup started searching albums first. Ids never drift.
   The three 62nd-Grammy wins all came from one album, so two of them share
   a slide — and "bad guy" shows its parent album, which is where the
   artwork lives. */
const GRAMMY_WINS = [
  { title: "When We All Fall Asleep, Where Do We Go?", artist: "Billie Eilish",
    award: "Album of the Year · Best Engineered Album, Non-Classical",
    ceremony: "62nd Grammy Awards · 2020", itunesId: 1450695723 },
  { title: "bad guy", artist: "Billie Eilish",
    award: "Record of the Year",
    ceremony: "62nd Grammy Awards · 2020", itunesId: 1450695723 },
  { title: "Everything I Wanted", artist: "Billie Eilish",
    award: "Record of the Year",
    ceremony: "63rd Grammy Awards · 2021", itunesId: 1487502456 },

  /* John's own awards page lists the Los Tigres del Norte recognitions as
     Grammy Certificates rather than personal wins — Best Norteño Album goes
     to the artist. The prefix below keeps the page honest about that. */
  { title: "Historias Que Contar", artist: "Los Tigres del Norte",
    award: "Best Norteño Album", prefix: "Grammy Certificate",
    ceremony: "48th Grammy Awards · 2006", itunesId: 1443569164 },
  { title: "Detalles Y Emociones", artist: "Los Tigres del Norte",
    award: "Best Norteño Album", prefix: "Grammy Certificate",
    ceremony: "49th Grammy Awards · 2007", itunesId: 1443548332 },
  { title: "Tu Noche Con...Los Tigres del Norte", artist: "Los Tigres del Norte",
    award: "Best Norteño Album", prefix: "Grammy Certificate",
    ceremony: "50th Grammy Awards · 2008", itunesId: 1443651451 },
];

let grammyActive = 0;
let grammyArtworks = new Array(GRAMMY_WINS.length).fill(null);
let grammyTimer = null;

function renderGrammy() {
  const win = GRAMMY_WINS[grammyActive];
  const art = grammyArtworks[grammyActive];
  const artEl = document.getElementById('grammy-art');
  const fallbackEl = document.getElementById('grammy-fallback');

  // Swap in artwork if we have it
  const existingImg = artEl.querySelector('img');
  if (art) {
    if (existingImg) {
      existingImg.src = art;
      existingImg.alt = win.title;
    } else {
      const img = document.createElement('img');
      img.src = art;
      img.alt = win.title;
      artEl.insertBefore(img, artEl.firstChild);
    }
    if (fallbackEl) fallbackEl.style.display = 'none';
  } else {
    if (existingImg) existingImg.remove();
    if (fallbackEl) {
      fallbackEl.style.display = 'flex';
      fallbackEl.textContent = win.artist.charAt(0);
    }
  }

  document.getElementById('grammy-award').textContent =
    `${win.prefix || 'Grammy Award'} — ${win.award}`;
  document.getElementById('grammy-title').textContent = win.title;
  document.getElementById('grammy-artist').textContent = win.artist;
  document.getElementById('grammy-ceremony').textContent = win.ceremony;

  document.querySelectorAll('#grammy-dots button').forEach((dot, i) => {
    dot.classList.toggle('active', i === grammyActive);
  });
}

function goToGrammy(index) {
  const artEl = document.getElementById('grammy-art');
  const infoEl = document.getElementById('grammy-info');

  artEl.classList.add('fading');
  infoEl.classList.add('fading');

  setTimeout(() => {
    grammyActive = index;
    renderGrammy();
    artEl.classList.remove('fading');
    infoEl.classList.remove('fading');
  }, 600);
}

function initGrammy() {
  const container = document.getElementById('grammy');
  if (!container) return;

  // Build the dots
  const dotsEl = document.getElementById('grammy-dots');
  GRAMMY_WINS.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.setAttribute('aria-label', `Grammy win ${i + 1}`);
    dot.addEventListener('click', () => {
      clearInterval(grammyTimer);
      goToGrammy(i);
      startGrammyRotation();
    });
    dotsEl.appendChild(dot);
  });

  renderGrammy();

  // Fetch all the artwork
  GRAMMY_WINS.forEach(async (win, i) => {
    const url = await fetchArtwork(win.title, win.artist, win.itunesId);
    grammyArtworks[i] = url;
    if (i === grammyActive) renderGrammy();
  });

  // Only rotate while the carousel is on screen
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) startGrammyRotation();
      else clearInterval(grammyTimer);
    });
  }, { threshold: 0.1 });
  observer.observe(container);
}

function startGrammyRotation() {
  clearInterval(grammyTimer);
  grammyTimer = setInterval(() => {
    goToGrammy((grammyActive + 1) % GRAMMY_WINS.length);
  }, 4000);
}

document.addEventListener('DOMContentLoaded', initGrammy);
