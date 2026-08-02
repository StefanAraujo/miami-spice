/**
 * Generates specimen.html — a static design specimen of "Direction B: Tropical
 * Deco", rendered from the real spice.json so the layout is judged against real
 * content rather than lorem ipsum.
 *
 *   node specimen/build-specimen.mjs
 *
 * This is a comparison artifact, not app code. Nothing here is imported by the
 * app. If Direction B is chosen, its rules move into src/app.css and the
 * components; if it isn't, this folder gets deleted.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const data = JSON.parse(fs.readFileSync(path.join(HERE, '../src/data/spice.json'), 'utf8'))

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
const DAY_LABEL = { MON: 'Mon', TUE: 'Tue', WED: 'Wed', THU: 'Thu', FRI: 'Fri', SAT: 'Sat', SUN: 'Sun' }
const MEAL = { brunch: 'Brunch', lunch: 'Lunch', dinner: 'Dinner' }
const ORDER = ['brunch', 'lunch', 'dinner']

const dayRange = (days) => {
  const ds = days.slice().sort((a, b) => DAYS.indexOf(a) - DAYS.indexOf(b))
  if (ds.length === 7) return 'Daily'
  const out = []
  for (let i = 0; i < ds.length;) {
    let j = i
    while (j + 1 < ds.length && DAYS.indexOf(ds[j + 1]) === DAYS.indexOf(ds[j]) + 1) j++
    const [a, b] = [DAY_LABEL[ds[i]], DAY_LABEL[ds[j]]]
    out.push(j - i >= 2 ? `${a}–${b}` : j - i === 1 ? `${a}, ${b}` : a)
    i = j + 1
  }
  return out.join(', ')
}

// The motivating query, so the specimen shows a real filtered state.
const rows = data.restaurants
  .filter((r) => r.cuisines.includes('Italian') && r.serves.includes('lunch@SAT') && r.serves.includes('dinner@SAT'))
  .slice(0, 9)

/**
 * Inline the woff2s as data URLs so the specimen is a single portable file you
 * can open with a double click — no server, no Google Fonts, works offline.
 * Regenerated from node_modules on first run.
 */
function buildFonts() {
  const cached = path.join(HERE, 'fonts.css')
  if (fs.existsSync(cached)) return fs.readFileSync(cached, 'utf8')
  const faces = []
  const add = (pkg, family, weights) => {
    for (const w of weights) {
      const f = path.join(HERE, `../node_modules/@fontsource/${pkg}/files/${pkg}-latin-${w}-normal.woff2`)
      if (!fs.existsSync(f)) continue
      faces.push(`@font-face{font-family:'${family}';font-style:normal;font-weight:${w};font-display:swap;src:url(data:font/woff2;base64,${fs.readFileSync(f).toString('base64')}) format('woff2')}`)
    }
  }
  add('jost', 'Jost', [400, 500, 600])
  add('ibm-plex-mono', 'IBM Plex Mono', [400, 500])
  if (!faces.length) {
    console.warn('! no @fontsource files found - run `npm install` first; falling back to system fonts')
    return ''
  }
  fs.writeFileSync(cached, faces.join('\n'))
  return faces.join('\n')
}

const FONTS = buildFonts()

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))

/** Tier 2: the whole differentiator set on one dot-separated line (OpenTable/Yelp). */
const metaLine = (r) => [r.cuisines.join(', '), r.tier, r.hood].filter(Boolean).join('  ·  ')

const priceStr = (r) => (r.min_price === r.max_price ? `$${r.min_price}` : `$${r.min_price}–${r.max_price}`)

/** One distinctive dish as a teaser — the thing the official site buries. */
const teaser = (r) => {
  const m = [...r.menus].sort((a, b) => ORDER.indexOf(a.meal) - ORDER.indexOf(b.meal))[0]
  const entree = m?.courses.find((c) => /entree/i.test(c.name)) ?? m?.courses[0]
  return entree?.items?.[0] ?? null
}

const ladder = (r) => {
  const menus = [...r.menus].sort((a, b) => ORDER.indexOf(a.meal) - ORDER.indexOf(b.meal))
  return menus.map((m) => `
        <div class="menu">
          <div class="menu-head">
            <span class="menu-meal">${esc(MEAL[m.meal] ?? m.meal)}</span>
            <span class="stripes" aria-hidden="true"></span>
            <span class="menu-price">$${m.price}</span>
          </div>
          ${m.courses.filter((c) => c.of > 0).map((c) => `
          <div class="course">
            <span class="course-name">${esc(c.name)}</span>
            <span class="course-frac">${c.choose}<span class="of">of</span>${c.of}</span>
            <span class="course-items">${c.items.map(esc).join('<span class="sep">·</span>')}</span>
          </div>`).join('')}
        </div>`).join('')
}

const row = (r, i) => `
      <li class="row${i === 1 ? ' is-open' : ''}">
        <button class="row-main" type="button" aria-expanded="${i === 1}">
          <span class="row-text">
            <span class="row-name">${esc(r.name)}</span>
            <span class="row-meta">${esc(metaLine(r))}</span>
            ${teaser(r) ? `<span class="row-teaser">${esc(teaser(r))}</span>` : ''}
          </span>
          <span class="row-side">
            <span class="row-price">${priceStr(r)}</span>
            <span class="row-when">${[...r.offers].sort((a, b) => ORDER.indexOf(a.meal) - ORDER.indexOf(b.meal))
              .map((o) => `${MEAL[o.meal] ?? o.meal} ${dayRange(o.days)}`).join(' · ')}</span>
          </span>
          <span class="chev" aria-hidden="true"></span>
        </button>
        ${i === 1 ? `<div class="panel">
          ${ladder(r)}
          <div class="panel-actions">
            ${r.reserve ? `<a class="cta" href="#">Book on ${esc(r.platform || 'their site')}</a>` : ''}
            <a href="#">Directions</a>
            <a href="#">Details</a>
          </div>
        </div>` : ''}
      </li>`

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Miami Spice — Direction B specimen</title>
<style>${FONTS}</style>
<style>
/* ==========================================================================
   DIRECTION B — TROPICAL DECO
   Every value below traces to a source, not to taste:

   · Field colours are from the City of Miami Beach's own pre-approved paint
     palette for the historic district (body colours are ~250 near-white,
     low-chroma tints; trim is restricted to greys and whites). The pastel
     everyone remembers is the paper, not the ink.
   · Accent chosen by EXCLUSION, per Michael Mann's production rule for
     Miami Vice: "no earth tones, no red," no primaries. What survives is a
     marine blue for structure and one flamingo for price.
   · Depth is a hard-edged offset shadow — a Deco "eyebrow" sunshade. Miami
     light is knife-edge sun, never bloom. No glow anywhere in this file.
   · Rule of three: triple hairline "racing stripes", the Deco device that
     translates most directly to 2D.
   · Jost is the Futura lineage (1927) — period-correct geometry that still
     reads as contemporary UI type. No Deco display face, deliberately: the
     Wolfsonian, the world's leading Deco museum, uses neutral typefaces too.
   ========================================================================== */
:root{
  --paper:#E9E6DE;      /* SW Heron Plume family — district body colour      */
  --card:#F5F3ED;       /* raised surface                                    */
  --ink:#161A19;        /* 15.8:1 on card                                    */
  --soft:#464B47;       /* 8.0:1 — metadata, clears Apple's 7:1 small-text    */
  --rule:#8E887E;       /* 3.2:1 — clears WCAG 1.4.11 for UI boundaries      */
  --hair:#CFCABE;       /* decorative separators only                        */
  --marine:#12414C;     /* structure: heads, active state. 10:1 on card      */
  --flamingo:#9C1E45;   /* PRICE ONLY. 7.05:1 on card                        */

  --f-display:'Jost',-apple-system,'Helvetica Neue',sans-serif;
  --f-mono:'IBM Plex Mono',ui-monospace,Menlo,monospace;

  /* 4px base, four deliberate type steps: 12 / 15 / 19 / 44 (≥1.25x apart) */
  --t-meta:12px; --t-body:15px; --t-name:19px; --t-display:44px;
}
*{box-sizing:border-box}
html,body{margin:0;background:var(--paper);color:var(--ink);
  font-family:var(--f-display);font-size:var(--t-body);line-height:1.5;
  -webkit-font-smoothing:antialiased}
button{font:inherit;color:inherit;background:none;border:0;cursor:pointer}
a{color:var(--marine)}
:where(a,button):focus-visible{outline:2px solid var(--marine);outline-offset:3px}

.wrap{max-width:1080px;margin:0 auto;padding:0 32px}

/* --- masthead: symmetric frame, racing stripes, no gradient anywhere ----- */
.masthead{padding:56px 0 0;text-align:center}
.eyebrow{font-family:var(--f-mono);font-size:var(--t-meta);letter-spacing:.18em;
  text-transform:uppercase;color:var(--soft);margin:0 0 14px}
.wordmark{font-family:var(--f-display);font-weight:600;font-size:var(--t-display);
  letter-spacing:.04em;text-transform:uppercase;margin:0;color:var(--ink);line-height:1}
.racing{display:flex;flex-direction:column;gap:3px;margin:22px auto 0;max-width:340px}
.racing i{height:2px;background:var(--marine);display:block}
.racing i:nth-child(2){background:var(--flamingo)}
.racing i:nth-child(3){background:var(--marine)}
.stat{font-family:var(--f-mono);font-size:var(--t-meta);color:var(--soft);
  letter-spacing:.08em;margin:18px 0 0}

.layout{display:grid;grid-template-columns:200px minmax(0,1fr);gap:56px;
  align-items:start;padding-top:44px}

/* --- filter rail: type is architecture. Uppercase, tracked, tabular. ----- */
.facet{margin-bottom:30px}
.facet h3{font-family:var(--f-mono);font-size:var(--t-meta);letter-spacing:.16em;
  text-transform:uppercase;color:var(--soft);margin:0 0 12px;
  padding-bottom:8px;border-bottom:1px solid var(--rule)}
.opts{display:flex;flex-wrap:wrap;gap:4px}
.opt{display:inline-flex;align-items:center;justify-content:center;
  min-height:44px;padding:0 12px;                      /* Apple 44pt target */
  font-size:13px;color:var(--soft);
  border:1px solid var(--hair);background:var(--card)}
.opt .n{font-family:var(--f-mono);font-size:11px;color:var(--rule);margin-left:8px}
.opt[aria-pressed=true]{background:var(--marine);border-color:var(--marine);color:var(--card)}
.opt[aria-pressed=true] .n{color:var(--card);opacity:.7}
.opt[disabled]{opacity:.4}
.days{display:grid;grid-template-columns:repeat(7,1fr);gap:3px}
.days .opt{padding:0;min-width:0;font-family:var(--f-mono);font-size:12px}

/* --- results: rows with rules, not cards -------------------------------- */
.bar{display:flex;align-items:baseline;justify-content:space-between;
  padding-bottom:14px;border-bottom:2px solid var(--ink)}
.count{margin:0;font-family:var(--f-mono);font-size:var(--t-meta);
  letter-spacing:.14em;text-transform:uppercase;color:var(--soft)}
.count b{font-size:19px;color:var(--ink);letter-spacing:0}

.list{list-style:none;margin:0;padding:0}
.row{border-bottom:1px solid var(--hair)}
.row-main{display:grid;grid-template-columns:minmax(0,1fr) auto 20px;
  gap:28px;align-items:center;width:100%;text-align:left;
  padding:16px 0;min-height:44px}          /* whole row is the 44pt target */
.row-main:hover .row-name{color:var(--marine)}
.row-text{display:block;min-width:0}
.row-name{display:block;font-size:var(--t-name);font-weight:600;
  letter-spacing:-.005em;line-height:1.2}
.row-meta{display:block;font-family:var(--f-mono);font-size:var(--t-meta);
  color:var(--soft);margin-top:4px;letter-spacing:.02em}
.row-teaser{display:block;font-size:14px;color:var(--soft);margin-top:5px;
  font-style:italic;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.row-side{text-align:right;white-space:nowrap}
.row-price{display:block;font-family:var(--f-mono);font-size:var(--t-name);
  font-weight:500;color:var(--flamingo);font-variant-numeric:tabular-nums}
.row-when{display:block;font-family:var(--f-mono);font-size:11px;
  color:var(--soft);margin-top:4px}
.chev{width:9px;height:9px;border-right:1.5px solid var(--rule);
  border-bottom:1.5px solid var(--rule);transform:rotate(45deg);justify-self:end}
.row.is-open .chev{transform:rotate(225deg)}
.panel-actions{display:flex;flex-wrap:wrap;gap:24px;align-items:center;
  margin-top:22px;padding-top:16px;border-top:1px solid var(--hair)}
.panel-actions a{display:inline-flex;align-items:center;min-height:44px;
  font-family:var(--f-mono);font-size:var(--t-meta);letter-spacing:.08em;
  text-transform:uppercase;text-decoration:none;color:var(--soft)}
.panel-actions a:hover{color:var(--marine)}
.panel-actions .cta{color:var(--card);background:var(--marine);
  padding:0 20px;box-shadow:4px 4px 0 rgba(18,65,76,.18)}

/* --- the course ladder: an eyebrow slab, hard shadow, zero blur ---------- */
.panel{margin-top:8px;background:var(--card);
  border:1px solid var(--hair);
  box-shadow:6px 6px 0 rgba(18,65,76,.10);   /* Deco eyebrow, no blur */
  padding:22px 26px}
.menu+.menu{margin-top:24px}
.menu-head{display:flex;align-items:center;gap:14px;margin-bottom:12px}
.menu-meal{font-family:var(--f-mono);font-size:var(--t-meta);letter-spacing:.18em;
  text-transform:uppercase;color:var(--marine)}
.stripes{flex:1;height:5px;
  background:repeating-linear-gradient(to bottom,var(--rule) 0 1px,transparent 1px 2px)}
.menu-price{font-family:var(--f-mono);font-size:14px;color:var(--flamingo);
  font-variant-numeric:tabular-nums}
.course{display:grid;grid-template-columns:88px 62px 1fr;gap:16px;
  align-items:baseline;padding:5px 0}
.course-name{font-family:var(--f-mono);font-size:11px;letter-spacing:.13em;
  text-transform:uppercase;color:var(--soft)}
.course-frac{font-family:var(--f-mono);font-size:13px;color:var(--ink);
  font-variant-numeric:tabular-nums;white-space:nowrap}
.course-frac .of{color:var(--rule);font-size:10px;margin:0 4px;text-transform:uppercase}
.course-items{font-size:14px;color:var(--soft);line-height:1.6}
.course-items .sep{color:var(--hair);margin:0 8px}

footer{padding:56px 32px 48px;text-align:center}
footer p{font-family:var(--f-mono);font-size:11px;color:var(--soft);margin:0;
  letter-spacing:.06em}

@media (max-width:860px){
  .layout{grid-template-columns:1fr;gap:24px}
  .wrap{padding:0 20px}
  .row-main{grid-template-columns:minmax(0,1fr) 20px;gap:12px;align-items:start}
  .row-side{grid-column:1;text-align:left;margin-top:8px}
  .row-when{white-space:normal}
  .panel{padding:18px 16px}
  .course{grid-template-columns:1fr;gap:2px}
}
@media (prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important}}
</style>
</head>
<body>

<header class="masthead">
  <div class="wrap">
    <p class="eyebrow">Miami Beach · August – September</p>
    <h1 class="wordmark">Miami Spice</h1>
    <div class="racing" aria-hidden="true"><i></i><i></i><i></i></div>
    <p class="stat">${data.count} restaurants · ${data.facets.cuisines.length} cuisines · ${data.facets.hoods.length} neighborhoods</p>
  </div>
</header>

<div class="wrap layout">
  <aside>
    <div class="facet">
      <h3>Day</h3>
      <div class="days">
        ${DAYS.map((d) => `<button class="opt" aria-pressed="${d === 'SAT'}">${DAY_LABEL[d][0]}</button>`).join('')}
      </div>
    </div>
    <div class="facet">
      <h3>Meal</h3>
      <div class="opts">
        ${ORDER.map((m) => `<button class="opt" aria-pressed="${m !== 'brunch'}">${MEAL[m]}<span class="n">${m === 'brunch' ? 6 : m === 'lunch' ? 71 : 43}</span></button>`).join('')}
      </div>
    </div>
    <div class="facet">
      <h3>Price</h3>
      <div class="opts">
        ${[40, 50, 65].map((p) => `<button class="opt" aria-pressed="false">$${p}<span class="n">${p === 40 ? 31 : p === 50 ? 18 : 27}</span></button>`).join('')}
      </div>
    </div>
    <div class="facet">
      <h3>Cuisine</h3>
      <div class="opts">
        ${['Italian', 'Seafood', 'Steakhouse', 'Japanese', 'Peruvian'].map((c) =>
          `<button class="opt" aria-pressed="${c === 'Italian'}">${c}<span class="n">${c === 'Italian' ? 43 : c === 'Seafood' ? 0 : 6}</span></button>`).join('')}
      </div>
    </div>
  </aside>

  <main>
    <div class="bar">
      <p class="count"><b>43</b> &nbsp;restaurants</p>
      <p class="count">Lunch + Dinner on Sat</p>
    </div>
    <ul class="list">
${rows.map(row).join('\n')}
    </ul>
  </main>
</div>

<footer>
  <p>Unofficial · menus shift mid-season · confirm before you go</p>
</footer>

</body>
</html>`

fs.writeFileSync(path.join(HERE, 'specimen.html'), html)
console.log(`wrote specimen.html — ${rows.length} real rows, ${(html.length / 1024).toFixed(0)} KB`)
