/**
 * Phase 1 smoke test. Serves dist/, drives the real UI in Chromium, and checks
 * the counts against an independent pass over spice.json.
 *   node verify.mjs
 */
import { chromium } from 'playwright'
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), 'dist')
const data = JSON.parse(fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), 'src/data/spice.json'), 'utf8'))

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' }
const server = http.createServer((req, res) => {
  // Strip the query first — the app now puts filter state in ?params, so "/?cuisines=X"
  // must still serve index.html (not try to read the dist directory).
  const pathname = decodeURIComponent(req.url.split('?')[0])
  const p = path.join(root, pathname === '/' ? 'index.html' : pathname)
  if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end() }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream' })
  fs.createReadStream(p).pipe(res)
})
await new Promise((r) => server.listen(4321, r))

const errors = []
const browser = await chromium.launch(
  process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {},
)
const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } })
// Google Fonts is unreachable from the sandbox; that is a network fact, not an
// app bug, so filter it out and let everything else fail the run.
// External resource loads (fonts, the detail-panel hero image on its CDN) can fail
// in the sandbox; that's a network fact, not an app bug, and the app degrades
// gracefully (img onerror hides it). Real JS errors arrive via `pageerror`, not
// this generic console text, so ignoring resource-load failures here is safe.
const IGNORE = /fonts\.(googleapis|gstatic)\.com|assets\.simpleviewinc\.com|ERR_CONNECTION_RESET|favicon|Failed to load resource/i
page.on('console', (m) => {
  if (m.type() !== 'error') return
  // Match the message text AND its source URL — a failed CDN image logs a generic
  // "Failed to load resource" whose host only appears in the location, not the text.
  const loc = m.location?.().url || ''
  if (IGNORE.test(m.text()) || IGNORE.test(loc)) return
  errors.push(m.text())
})
page.on('pageerror', (e) => errors.push(String(e)))
await page.goto('http://localhost:4321/', { waitUntil: 'networkidle' })

const count = async () => Number((await page.locator('.count strong').textContent()).trim())
const check = (name, got, want) => {
  const ok = got === want
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}: ${got}${ok ? '' : ` (expected ${want})`}`)
  if (!ok) process.exitCode = 1
}

// --- independent expectations, computed straight off the JSON --------------
const rs = data.restaurants
const expectAll = rs.length
const expectItalianSat = rs.filter((r) => r.cuisines.includes('Italian') && r.serves.includes('lunch@SAT') && r.serves.includes('dinner@SAT')).length
const expectBrickell40 = rs.filter((r) => r.hoods.includes('Brickell') && r.prices.includes(40)).length
// Dietary & amenity flags AND together, so two flags return their INTERSECTION.
// 111 here vs a ~276 union is what makes this a real test of the rule, not a tautology.
const expectVegOutdoor = rs.filter((r) => ['vegetarian', 'outdoor'].every((g) => r.flags.includes(g))).length

// Cold start now shows the Discover front door, not the list (ROADMAP Phase 4).
check('discover front door on load', await page.locator('.discover').count() > 0, true)
check('pick-for-us affordance present', await page.getByRole('button', { name: /Pick one for us/ }).count() > 0, true)

// A mood tile is a soft lens: it should narrow the list, not empty it or no-op.
await page.locator('.discover').getByRole('button', { name: /^Steak & fire\s*\d+$/ }).click()
await page.waitForTimeout(120)
const steak = await count()
check('mood tile narrows results', steak > 0 && steak < expectAll, true)
await page.getByRole('button', { name: 'Clear all' }).click()
await page.waitForTimeout(80)

// A cuisine tile resolves to the same count as the cuisine facet — the tile's
// number is a real query, asserted against an independent pass.
const expectItalian = rs.filter((r) => r.cuisines.includes('Italian')).length
await page.locator('.discover').getByRole('button', { name: /^Italian\s*\d+$/ }).click()
await page.waitForTimeout(120)
check('cuisine tile → Italian count', await count(), expectItalian)

// Clear returns to the front door; Browse all reaches the full list.
await page.getByRole('button', { name: 'Clear all' }).click()
await page.waitForTimeout(80)
await page.getByRole('button', { name: /^Browse all \d+/ }).click()
await page.waitForTimeout(80)
check('all restaurants on load', await count(), expectAll)

// The motivating query: Italian, lunch AND dinner, Saturday.
await page.getByRole('button', { name: 'Saturday', exact: true }).click()
await page.getByRole('button', { name: /^Lunch\s*\d*$/ }).click()
await page.getByRole('button', { name: /^Dinner\s*\d*$/ }).click()
await page.getByRole('button', { name: 'Show all 28' }).click()
await page.getByRole('button', { name: /^Italian\s*\d*$/ }).click()
await page.waitForTimeout(150)
check('Italian · lunch+dinner · Saturday', await count(), expectItalianSat)
await page.screenshot({ path: 'verify-italian-saturday.png', fullPage: false })

// Course ladder opens and renders choose-counts.
await page.locator('.row').first().locator('.main').click()
await page.waitForTimeout(150)
const fracs = await page.locator('.row').first().locator('.frac').allTextContents()
check('course ladder rows visible', fracs.length > 0, true)
console.log('      ladder:', fracs.map(x=>x.replace(/\s+/g,'')).join(' '))
await page.screenshot({ path: 'verify-course-ladder.png' })

// Shortlist: pinning a row saves it; the shortlist view shows the saved rows.
await page.locator('.row').first().locator('.pin').click()
await page.waitForTimeout(80)
check('pin adds to shortlist', await page.locator('.shortlist-btn .badge').textContent(), '1')
await page.getByRole('button', { name: /^Shortlist/ }).click()
await page.waitForTimeout(80)
check('shortlist view shows saved row', await page.locator('.shortlist-view .row').count(), 1)
await page.getByRole('button', { name: 'Done' }).click()
await page.waitForTimeout(80)

// Empty state names the conflict and offers a real fix.
// Note: options that would yield zero are now disabled, so the old
// "click two contradictory facets" route is deliberately unreachable — that is
// Baymard's step 1, prevent the dead end. The remaining route to zero is a text
// query applied AFTER a facet, since free text is not part of the count logic.
await page.getByRole('button', { name: 'Clear all' }).click()
// Scope to the rail: the Discover front door also shows an "Italian" cuisine tile.
await page.locator('.rail').getByRole('button', { name: /^Italian\s*\d*$/ }).click()
await page.getByRole('searchbox').fill('sashimi')
await page.waitForTimeout(200)
check('facet + contradictory text query yields 0', await count(), 0)
check('empty state offers a relaxation', await page.locator('.empty button').count() > 0, true)
await page.screenshot({ path: 'verify-empty-state.png' })

// Zero-count options are disabled rather than removed (Baymard).
await page.getByRole('button', { name: 'Clear all' }).click()
await page.locator('.rail').getByRole('button', { name: /^Italian\s*\d*$/ }).click()
await page.waitForTimeout(200)
const disabled = await page.locator('[data-facet="Dietary & amenities"] button:disabled').count()
check('zero-result options greyed, not removed', disabled > 0, true)

// A second, unrelated combination — guards against a filter that ignores input.
await page.getByRole('button', { name: 'Clear all' }).click()
await page.locator('.rail').getByRole('button', { name: 'Show all 38' }).click()
await page.locator('.rail').getByRole('button', { name: /^Brickell\s*\d*$/ }).click()
await page.getByRole('button', { name: /^\$40\s*\d*$/ }).click()
await page.waitForTimeout(150)
check('Brickell · $40', await count(), expectBrickell40)

// Dietary & amenities is the one facet that ANDs (the flags read as requirements,
// not alternatives). Requiring two must return their intersection, not their union.
await page.getByRole('button', { name: 'Clear all' }).click()
await page.getByRole('button', { name: /^Vegetarian\s*\d*$/ }).click()
await page.getByRole('button', { name: /^Outdoor seating\s*\d*$/ }).click()
await page.waitForTimeout(150)
check('Vegetarian AND Outdoor (intersection, not union)', await count(), expectVegOutdoor)

// Mobile.
await page.setViewportSize({ width: 390, height: 844 })
await page.waitForTimeout(250)
await page.screenshot({ path: 'verify-mobile.png', fullPage: false })

// Nothing may spill past the viewport on a phone — horizontal scroll is the
// classic way a "responsive" layout is actually broken.
const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
check('no horizontal overflow at 390px', overflow <= 0, true)

// --- palette contrast, asserted rather than eyeballed ----------------------
// Neon on a dark ground is exactly where themes quietly fail WCAG, so every
// text pair the design actually uses is checked against the AA 4.5:1 floor.
const css = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), 'src/app.css'), 'utf8')
const token = (name) => css.match(new RegExp(`--${name}:\\s*(#[0-9a-f]{6})`, 'i'))?.[1]
const srgb = (h) => h.slice(1).match(/../g).map((x) => parseInt(x, 16) / 255)
const lum = (h) => {
  const [r, g, b] = srgb(h).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const contrast = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}
const PAIRS = [
  ['ink', 'paper'], ['ink', 'card'],
  ['soft', 'card'], ['soft', 'paper'],
  ['marine', 'card'], ['marine', 'paper'],
  ['flamingo', 'card'], ['flamingo', 'paper'],
  ['card', 'marine'], // active chip: light label on marine fill
]
let worst = { ratio: Infinity }
for (const [fg, bg] of PAIRS) {
  const ratio = contrast(token(fg), token(bg))
  if (ratio < worst.ratio) worst = { ratio, fg, bg }
}
check(`palette AA (worst: ${worst.fg} on ${worst.bg} = ${worst.ratio.toFixed(2)}:1)`, worst.ratio >= 4.5, true)

// Shareable search: a filtered URL restores straight to results, skipping the door.
await page.goto('http://localhost:4321/?cuisines=Italian', { waitUntil: 'networkidle' })
await page.waitForTimeout(150)
check('URL filter restores results', await count(), rs.filter((r) => r.cuisines.includes('Italian')).length)
check('URL filter skips the front door', await page.locator('.discover').count(), 0)

// A link shared from the shortlist (saved=1) opens to the shortlist even with filters.
await page.goto('http://localhost:4321/?picks=14621&cuisines=Italian&saved=1', { waitUntil: 'networkidle' })
await page.waitForTimeout(150)
check('shortlist-share link opens the shortlist', await page.locator('.shortlist-view .row').count(), 1)

check('no console errors', errors.length, 0)
if (errors.length) console.log(errors.slice(0, 5))

await browser.close()
server.close()
