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
  const p = path.join(root, req.url === '/' ? 'index.html' : decodeURIComponent(req.url.split('?')[0]))
  if (!fs.existsSync(p)) { res.writeHead(404); return res.end() }
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
const IGNORE = /fonts\.(googleapis|gstatic)\.com|ERR_CONNECTION_RESET|favicon/i
page.on('console', (m) => m.type() === 'error' && !IGNORE.test(m.text()) && errors.push(m.text()))
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

check('all restaurants on load', await count(), expectAll)

// The motivating query: Italian, lunch AND dinner, Saturday.
await page.getByRole('button', { name: 'Saturday', exact: true }).click()
await page.getByRole('button', { name: 'Lunch', exact: true }).click()
await page.getByRole('button', { name: 'Dinner', exact: true }).click()
await page.getByRole('button', { name: 'Show all 28' }).click()
await page.getByRole('button', { name: 'Italian', exact: true }).click()
await page.waitForTimeout(150)
check('Italian · lunch+dinner · Saturday', await count(), expectItalianSat)
await page.screenshot({ path: 'verify-italian-saturday.png', fullPage: false })

// Course ladder opens and renders choose-counts.
await page.locator('.card').first().getByRole('button', { name: 'See the menu' }).click()
await page.waitForTimeout(150)
const fracs = await page.locator('.card').first().locator('.frac').allTextContents()
check('course ladder rows visible', fracs.length > 0, true)
console.log('      ladder:', fracs.join(' '))
await page.screenshot({ path: 'verify-course-ladder.png' })

// Empty state names the conflict and offers a real fix.
await page.getByRole('button', { name: 'Clear all' }).click()
await page.getByRole('button', { name: 'Italian', exact: true }).click()
await page.locator('[data-facet="Dietary & amenities"]').getByRole('button', { name: 'Kosher', exact: true }).click()
await page.waitForTimeout(150)
check(
  'Italian + kosher is genuinely empty',
  rs.filter((r) => r.cuisines.includes('Italian') && r.flags.includes('kosher')).length,
  0,
)
check('impossible combo yields 0', await count(), 0)
check('empty state offers a relaxation', await page.locator('.empty button').count() > 0, true)
await page.screenshot({ path: 'verify-empty-state.png' })

// A second, unrelated combination — guards against a filter that ignores input.
await page.getByRole('button', { name: 'Clear all' }).click()
await page.getByRole('button', { name: 'Show all 38' }).click()
await page.getByRole('button', { name: 'Brickell', exact: true }).click()
await page.getByRole('button', { name: '$40', exact: true }).click()
await page.waitForTimeout(150)
check('Brickell · $40', await count(), expectBrickell40)

// Mobile.
await page.setViewportSize({ width: 390, height: 844 })
await page.waitForTimeout(200)
await page.screenshot({ path: 'verify-mobile.png', fullPage: false })

check('no console errors', errors.length, 0)
if (errors.length) console.log(errors.slice(0, 5))

await browser.close()
server.close()
