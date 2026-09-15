# Clearlight Mastering

Plain HTML, CSS and JavaScript. No build step, no dependencies, no npm.

## Viewing it locally

Double-click `index.html`. That's it.

If the album grid is empty, your browser is blocking the local `fetch` of
`data/albums.json` (a file:// security restriction). Run a tiny local server instead:

```bash
cd clearlight-static
python3 -m http.server 8000
```

Then open http://localhost:8000

## Publishing to GitHub Pages

1. Create a repo on GitHub (ideally under the client's account)
2. Upload these files, or:
   ```bash
   git init
   git add .
   git commit -m "Initial site"
   git remote add origin https://github.com/USERNAME/REPO.git
   git push -u origin main
   ```
3. Repo → Settings → Pages → Source: `main` branch, `/ (root)` folder
4. Live in about a minute at `https://USERNAME.github.io/REPO/`

No build configuration needed — GitHub Pages serves these files as-is.

## Before showing the client

**Contact form** — currently shows an error on submit until it's configured.
Sign up free at https://formspree.io, create a form, copy the ID, paste it
into `js/contact.js` (the `FORMSPREE_ID` constant at the top).

**Social links** — the four footer links point to placeholder homepages.
Update the `href` values in all three HTML files once the client confirms
their handles.

## Editing content

**Adding an album:** open `data/albums.json` and add an entry:

```json
{
  "artist": "Artist Name",
  "album": "Album Title",
  "year": 2026,
  "award": "Grammy — Album of the Year",
  "spotifyUrl": "https://open.spotify.com/album/...",
  "itunesSearch": "Artist Name track name"
}
```

`award` is optional — leave it out if there isn't one. `itunesSearch` controls
which cover art gets pulled; leave it out and it'll use artist + album title.

**Text and images:** edit the HTML files directly. Copy lives inline.

## The stream counter

`data/stats.json` holds the figures behind the counter on the landing page:

```json
{
  "totalStreams": 28500000000,
  "streamsPerDay": 19000000,
  "lastUpdated": "2026-09-10"
}
```

**These are estimates, not measured data.** Spotify does not expose stream
counts through any public API, so the counter cannot be live. What it does
instead is start from a baseline total and tick up at a plausible rate,
automatically rolling the baseline forward based on `lastUpdated` so the
number stays roughly current even if nobody touches the file for months.

The page labels it "estimated across mastered catalogue" so it isn't
presented as a precise figure.

### Refreshing the numbers

Twice a year, or whenever it matters:

1. John or Tess logs into https://artists.spotify.com
2. Music → each release → note the stream count
3. Add them up → that's `totalStreams`
4. Note the monthly listeners across the catalogue, divide by 30 → that's
   roughly `streamsPerDay`
5. Update `lastUpdated` to today's date
6. Commit the change

## Files

```
index.html          landing overlay + album grid
about.html          studio story, testimonials, Grammy carousel
contact.html        contact form
css/style.css       all styling
js/common.js        nav, footer year, scroll reveal, artwork lookup
js/home.js          landing sequence, counter, album grid
js/about.js         Grammy carousel
js/contact.js       form submission  ← add Formspree ID here
data/albums.json    the discography  ← add albums here
data/stats.json     counter figures  ← update these periodically
assets/             logo and portraits
```

---

## ⚠️ Needs confirmation from John & Tess

These were changed based on client feedback and public sources. Confirm before launch.

**Grammy count — changed from 7 to 4.**
The site previously said "Seven Grammy wins" in one place and "4× Grammy Winner"
in another. Public sources conflict (his LinkedIn says three-time; one industry
profile says four-time with five nominations; a music school bio says "six awards
and recognitions"). Four personal competitive wins are verifiable: Album of the
Year, Record of the Year and Best Engineered Album at the 62nd Grammys, plus
Record of the Year at the 63rd for "everything i wanted."

The three Los Tigres del Norte Best Norteño Album wins are awarded to the artist,
not the mastering engineer — so the site now describes those as records mastered
here rather than as John's own wins. **John should confirm the real number.**

**Founding year and years active — removed.**
The site had three contradictory figures: "Est. 1988" in the hero, "Forty years"
in a heading, and "35+ Years Active" in the stats. Public profiles say "over
twenty years." All three have been removed rather than guessed at.
**Get the real founding year and put it back.**

**Location — standardised to Los Angeles.**
Was mixed between "Los Angeles" and "Hollywood." Public sources place the studio
in Echo Park. **Confirm which is current** and use it consistently.

**Finneas quote — still softened.**
The original quote contains an expletive. It currently reads "Sounds amazing."
The unedited version is more memorable and reads as authentic in this industry.
**Client's call.**

**Missing asset: assets/john-tess.jpg**
The About page now has a joint-portrait section that renders a visible dashed
placeholder until this file exists. One photo of John and Tess together is the
single highest-impact fix for the "feels like a serious solo artist, not a
welcoming family studio" note.

**Testimonials — verify these are real and approved.**
All four quotes came from the original build. Confirm each person is happy to be
quoted by name.
