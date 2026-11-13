/* ─── Shared helpers ─────────────────────────────────────────────────────── */

/* ─── Album artwork ──────────────────────────────────────────────────────
   Looks up cover art on Apple's iTunes Search API.

   Two things matter here, both learned the hard way:

   1. Search ALBUMS before tracks. A track search matches any song with
      that title, so "Ice Cube death certificate" returned a Carcass
      album, because Carcass have a track called Death Certificate.

   2. Always check the artist on the result. If Apple returns a cover by
      someone else, we show the fallback letter tile instead. A wrong
      cover on a mastering studio's discography is worse than no cover.
─────────────────────────────────────────────────────────────────────────── */

function artistMatches(expected, got) {
  const clean = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const a = clean(expected), b = clean(got);
  if (!a || !b) return false;
  return a.includes(b) || b.includes(a);
}

async function queryItunes(term, entity) {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}`
            + `&entity=${entity}&limit=10`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('itunes ' + res.status);
  return (await res.json()).results || [];
}

/* An exact Apple id always wins over a search. Use one when search can't
   find the release, or finds the wrong edition. To get an id: open the
   album on music.apple.com and take the number from the URL, or look up
   any track on it via itunes.apple.com/lookup?id=<track id> and read
   collectionId from the response. Set it as "itunesId" in albums.json. */
async function artworkById(id) {
  try {
    const res = await fetch(`https://itunes.apple.com/lookup?id=${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error('lookup ' + res.status);
    const hit = ((await res.json()).results || [])[0];
    if (hit && hit.artworkUrl100) {
      return hit.artworkUrl100.replace('100x100bb', '600x600bb');
    }
  } catch (e) {
    console.warn('Artwork lookup by id failed:', id);
  }
  return null;
}

async function fetchArtwork(searchTerm, expectedArtist, itunesId) {
  if (itunesId) {
    const byId = await artworkById(itunesId);
    if (byId) return byId;
  }

  // Featuring credits confuse the album index — drop them before searching
  const term = String(searchTerm).replace(/\s*(ft\.|feat\.|featuring)\s.*$/i, '');

  for (const entity of ['album', 'musicTrack']) {
    try {
      for (const r of await queryItunes(term, entity)) {
        if (!r.artworkUrl100) continue;
        // No expected artist given (e.g. a free-text lookup) — take the first hit
        if (!expectedArtist || artistMatches(expectedArtist, r.artistName)) {
          return r.artworkUrl100.replace('100x100bb', '600x600bb');
        }
      }
    } catch (e) {
      console.warn(`Artwork lookup failed (${entity}) for:`, term);
    }
  }
  return null;
}

// Reveal elements as they scroll into view
function initScrollReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => entry.target.classList.add('in'), delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  items.forEach((el) => observer.observe(el));
}

// Mark the current page in the nav
function initNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.site-nav a').forEach((link) => {
    const href = link.getAttribute('href');
    if (href === path) link.classList.add('active');
  });
}

// Set the footer year
function initFooterYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
}

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initFooterYear();
  initScrollReveal();
});
