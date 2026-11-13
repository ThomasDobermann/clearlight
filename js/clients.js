/* ─── Client list (Work page) ────────────────────────────────────────────
   Pulls the artist list live from a Google Sheet so the site updates when
   the sheet changes. Falls back to data/clients.json if the sheet can't be
   reached, so the page never shows an empty list.

   ── To point this at a different sheet ──────────────────────────────────
   Replace SHEET_ID below with the long id from the sheet's URL:
     docs.google.com/spreadsheets/d/THIS_PART/edit

   The sheet needs to be shared as "Anyone with the link can view."

   ── Expected columns ────────────────────────────────────────────────────
   Column A : artist name          (required)
   Column B : engineer             (optional — "john", "tess", or "both")

   If column B is missing or empty, the John/Tess filter hides itself and
   the page shows one combined list.
─────────────────────────────────────────────────────────────────────────── */

const SHEET_ID = '1AmAcLc2uIkStBVHYwYh7brWrlXesQgtskm9g04QxV9w';
const SHEET_TAB = '';   // leave blank for the first tab, or set e.g. 'Sheet4'

function sheetUrl() {
  const base = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`;
  const tab = SHEET_TAB ? `&sheet=${encodeURIComponent(SHEET_TAB)}` : '';
  // cache-bust so edits show up without a hard refresh
  return `${base}${tab}&_=${Date.now()}`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* Minimal CSV parser — handles quoted fields, embedded commas and
   doubled quotes, which plain split(',') would mangle. */
function parseCsv(text) {
  const rows = [];
  let row = [], field = '', inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += ch;
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(field); field = '';
    } else if (ch === '\n') {
      row.push(field); rows.push(row); row = []; field = '';
    } else if (ch !== '\r') {
      field += ch;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

const HEADER_WORDS = /^(artist|artist name|name|client|clients)$/i;

function clientsFromSheet(csv) {
  const rows = parseCsv(csv);
  const seen = new Set();
  const out = [];

  rows.forEach((row) => {
    const name = (row[0] || '').trim();
    if (!name) return;
    if (HEADER_WORDS.test(name)) return;              // skip the header row

    const key = name.toLowerCase();
    if (seen.has(key)) return;                        // drop duplicates
    seen.add(key);

    const raw = (row[1] || '').trim().toLowerCase();
    let engineers = [];
    if (raw === 'both' || raw === 'john & tess' || raw === 'john and tess') {
      engineers = ['john', 'tess'];
    } else if (raw === 'john' || raw === 'tess') {
      engineers = [raw];
    }
    out.push({ name, engineers });
  });

  return out;
}

async function loadClients() {
  try {
    const res = await fetch(sheetUrl());
    if (!res.ok) throw new Error('sheet ' + res.status);
    const list = clientsFromSheet(await res.text());
    if (list.length) return { list, source: 'sheet' };
    throw new Error('sheet empty');
  } catch (e) {
    console.warn('Google Sheet unavailable, using local list:', e.message);
    const res = await fetch('data/clients.json');
    return { list: await res.json(), source: 'local' };
  }
}

async function initClients() {
  const list = document.getElementById('clients-list');
  if (!list) return;

  const countEl = document.getElementById('clients-count');
  const filterBar = document.querySelector('.clients-filter');
  const buttons = document.querySelectorAll('.filter-btn');

  let clients;
  try {
    ({ list: clients } = await loadClients());
  } catch (e) {
    list.innerHTML = '<li class="client-empty">Client list could not be loaded.</li>';
    return;
  }

  // Only offer the engineer filter if the data actually says who did what
  const hasEngineers = clients.some((c) => (c.engineers || []).length);
  if (filterBar && !hasEngineers) filterBar.style.display = 'none';

  const sortKey = (c) => c.name.replace(/^the\s+/i, '').toLowerCase();
  clients.sort((a, b) => sortKey(a).localeCompare(sortKey(b), 'en'));

  const render = (filter) => {
    const matching = clients.filter((c) =>
      filter === 'all' || (c.engineers || []).includes(filter));

    // A plain grid of names, reading left to right then down.
    list.innerHTML = matching.map((c) =>
      `<li class="client"><span class="client-name">${escapeHtml(c.name)}</span></li>`
    ).join('');

    if (countEl) {
      countEl.textContent = `${matching.length} artist${matching.length === 1 ? '' : 's'}`;
    }

    buttons.forEach((b) => {
      const on = b.dataset.filter === filter;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  };

  buttons.forEach((b) => {
    b.addEventListener('click', () => render(b.dataset.filter));
  });

  render('all');
}

document.addEventListener('DOMContentLoaded', initClients);
