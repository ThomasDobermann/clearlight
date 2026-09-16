/* ─── Shared helpers ─────────────────────────────────────────────────────── */

// Fetch album artwork from the iTunes Search API
async function fetchArtwork(searchTerm) {
  try {
    const res = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(searchTerm)}&entity=musicTrack&limit=3`
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      return data.results[0].artworkUrl100.replace('100x100bb', '600x600bb');
    }
  } catch (e) {
    console.warn('Artwork lookup failed for:', searchTerm);
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
