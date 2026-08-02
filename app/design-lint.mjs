/**
 * design-lint.mjs — deterministic design audit.
 *
 *   node design-lint.mjs            # audit dist/
 *   node design-lint.mjs --json     # machine-readable
 *
 * Two rule families, both deliberately boring and checkable:
 *
 *   SLOP   Visual tells catalogued by designers as markers of generated UI.
 *          Sourced from Krebs' Show HN scan (1,590 sites), Paul Bakaus'
 *          Impeccable catalog, Nutlope/Hallmark's anti-patterns, and
 *          Anthropic's own frontend-design skill naming its failure modes.
 *          No single hit is a verdict. Krebs' thresholds: 0-1 low, 2-3
 *          medium, 4+ high. We use the same tiering.
 *
 *   SPEC   Numeric accessibility and legibility floors from Apple's HIG
 *          and WCAG 2.2. Where the two disagree we take the stricter:
 *          WCAG for contrast (Apple grants bold-at-any-size 3:1, which is
 *          not AA conformant), Apple for target size (44pt > WCAG AA's 24px).
 *
 * The point is that taste arguments become measurements. You can disagree
 * with a rule — edit it here — but you cannot accidentally ship past it.
 */
import { chromium } from 'playwright'
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const DIST = path.join(HERE, 'dist')
const SRC = path.join(HERE, 'src')
const JSON_OUT = process.argv.includes('--json')

/* ------------------------------------------------------------------ setup */

const findings = []
const add = (family, severity, rule, detail, fix) =>
  findings.push({ family, severity, rule, detail, fix })

const readSrc = (glob) => {
  const out = []
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name)
      if (e.isDirectory()) walk(p)
      else if (glob.test(e.name)) out.push([p, fs.readFileSync(p, 'utf8')])
    }
  }
  walk(SRC)
  const idx = path.join(HERE, 'index.html')
  if (glob.test('index.html') && fs.existsSync(idx)) out.push([idx, fs.readFileSync(idx, 'utf8')])
  return out
}

const rel = (p) => path.relative(HERE, p)

/* ------------------------------------------------------- STATIC SOURCE RULES */

const styleFiles = readSrc(/\.(css|svelte|html)$/)
const allStyle = styleFiles.map(([, c]) => c).join('\n')

// SLOP-01 — gradient-filled text.
// Hallmark: "Signals 'AI generated' faster than almost anything else."
for (const [p, c] of styleFiles) {
  if (/background-clip:\s*text/i.test(c) && /linear-gradient|radial-gradient/i.test(c)) {
    add('SLOP', 'critical', 'gradient-text', `${rel(p)} fills text with a gradient via background-clip`,
      'Solid color. If a word needs emphasis, use weight or a drawn rule under it.')
  }
}

// SLOP-02 — decorative radial glow / aurora blobs.
// Hallmark ranks the mesh-blob hero Critical; Impeccable has two separate rules for it.
const glow = allStyle.match(/radial-gradient\([^)]*\)/gi) || []
if (glow.length) {
  add('SLOP', 'critical', 'aurora-glow', `${glow.length} decorative radial-gradient layer(s) behind content`,
    'Delete. Miami light is hard sun — use a zero-blur offset shadow (a Deco "eyebrow") for depth instead.')
}

// SLOP-03 — coloured GLOW used as elevation.
// The catalogued tell is a coloured *halo*, i.e. a blurred coloured shadow. A
// zero-blur coloured offset is a different thing entirely — it is the Art Deco
// eyebrow, a hard sun-shadow — so blur radius is what the rule keys on.
const shadows = allStyle.match(/box-shadow:\s*([^;]+);/gi) || []
const glowShadows = shadows.filter((decl) => {
  const coloured = /rgba?\((?!0,\s*0,\s*0[,)])/i.test(decl) || /#[0-9a-f]{3,8}/i.test(decl)
  const lengths = decl.replace(/rgba?\([^)]*\)/gi, '').match(/-?[\d.]+px/g) || []
  const blur = lengths.length >= 3 ? parseFloat(lengths[2]) : 0
  return coloured && blur > 0
})
if (glowShadows.length) {
  add('SLOP', 'major', 'colored-glow', `${glowShadows.length} blurred coloured shadow(s)`,
    'Express elevation with surface value or a zero-blur offset, not a coloured halo.')
}

// SLOP-04 — fonts on the overused list.
const OVERUSED = ['Inter', 'Geist', 'Space Grotesk', 'Instrument Serif', 'Roboto', 'Open Sans', 'Lato', 'Poppins', 'Montserrat']
for (const f of OVERUSED) {
  if (new RegExp(`['"\`]${f}['"\`]`, 'i').test(allStyle)) {
    add('SLOP', 'major', 'default-typeface', `"${f}" is on the AI-default font list`,
      'Choose a face with a reason attached to the subject. For Miami Deco: Jost (Futura lineage, 1927).')
  }
}

// SLOP-05 — pure black / pure white. Hallmark: "Both read as flat and synthetic."
if (/#000000\b|#000\b|\bblack\b/i.test(allStyle)) {
  add('SLOP', 'minor', 'pure-black', 'Pure #000 present', 'Tint near-black toward the anchor hue.')
}
if (/#ffffff\b|#fff\b/i.test(allStyle)) {
  add('SLOP', 'minor', 'pure-white', 'Pure #fff present', 'Tint off-white toward the anchor hue.')
}

// SLOP-06 — transition: all, and hover scale.
if (/transition:\s*all\b/i.test(allStyle)) {
  add('SLOP', 'minor', 'transition-all', '`transition: all` present',
    'Name the properties. `all` animates layout props you did not intend.')
}
if (/:hover[^{]*\{[^}]*transform:\s*scale/i.test(allStyle)) {
  add('SLOP', 'minor', 'hover-scale', 'scale() on hover', 'Prefer a state change that carries information.')
}

// SLOP-07 — border-radius monotony. Impeccable: cards 12-16px, pill for tags only.
const radii = new Set((allStyle.match(/border-radius:\s*([^;]+);/gi) || [])
  .map((m) => m.replace(/border-radius:\s*/i, '').replace(';', '').trim()))
const radiusTokens = new Set((allStyle.match(/--r-[a-z0-9-]+:\s*[^;]+;/gi) || []))
// Zero radius everywhere is a deliberate position (Deco is square-cornered), not
// a default left unchanged. The tell is "everything rounded to the same value",
// so the rule only fires when a radius is actually in use.
const nonZeroRadii = [...radii].filter((v) => !/^0(px|rem|%)?$/.test(v))
if (nonZeroRadii.length && radii.size <= 2 && radiusTokens.size <= 2) {
  add('SLOP', 'major', 'uniform-radius', `only ${radii.size} distinct border-radius value(s)`,
    'Vary radius by element size and function. One value everywhere reads as a default applied globally.')
}

// SLOP-08 — eyebrow saturation. Hallmark: "The page becomes a list of labelled lists."
const upper = (allStyle.match(/text-transform:\s*uppercase/gi) || []).length
if (upper >= 4) {
  add('SLOP', 'major', 'eyebrow-overuse', `${upper} rules apply uppercase + tracking`,
    'All-caps tracked labels borrow editorial authority. Keep at most 1-2 roles; let hierarchy come from size and weight.')
}

// SLOP-09 — emoji as UI.
const markup = readSrc(/\.(svelte|html)$/).map(([, c]) => c).join('\n')
const emoji = markup.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu) || []
if (emoji.length) {
  add('SLOP', 'major', 'emoji-icons', `${emoji.length} emoji in markup`, 'Use a single drawn icon set.')
}

// SLOP-10 — inline hex outside the token file. Hallmark gate 48.
for (const [p, c] of styleFiles) {
  if (path.basename(p) === 'app.css') continue
  const hexes = c.match(/#[0-9a-f]{3,8}\b/gi) || []
  const nonIcon = hexes.filter((h) => !c.includes(`%23${h.slice(1)}`))
  if (nonIcon.length > 2) {
    add('SLOP', 'minor', 'inline-color', `${rel(p)} has ${nonIcon.length} raw hex values outside the token file`,
      'Route every color through a var(). Inline values are how cohesion erodes.')
  }
}

/* ---------------------------------------------------------- RUNTIME RULES */

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.woff': 'font/woff' }
const server = http.createServer((req, res) => {
  const p = path.join(DIST, req.url === '/' ? 'index.html' : decodeURIComponent(req.url.split('?')[0]))
  if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end() }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream' })
  fs.createReadStream(p).pipe(res)
})
await new Promise((r) => server.listen(4399, r))

const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {})
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto('http://localhost:4399/', { waitUntil: 'networkidle' })

// Cold start shows the Discover front door; audit the actual result list, where
// the density / row-contrast / target floors apply.
const browse = page.getByRole('button', { name: /^Browse all \d+/ })
if (await browse.count()) { await browse.click(); await page.waitForTimeout(150) }

const audit = await page.evaluate(() => {
  const lum = (rgb) => {
    const [r, g, b] = rgb.map((c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4 })
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }
  const parse = (s) => (s.match(/[\d.]+/g) || []).slice(0, 3).map(Number)
  const alphaOf = (s) => { const p = (s.match(/[\d.]+/g) || []); return p.length > 3 ? Number(p[3]) : 1 }
  const over = (fg, bg, a) => fg.map((c, i) => c * a + bg[i] * (1 - a))

  /**
   * Walk up compositing translucent layers properly. Naively taking the first
   * non-transparent backgroundColor treats `rgba(255,77,157,.12)` as solid hot
   * pink, which reports false contrast failures on every tinted chip.
   */
  const bgOf = (el) => {
    const stack = []
    let n = el
    while (n && n !== document.documentElement) {
      const bg = getComputedStyle(n).backgroundColor
      const a = alphaOf(bg)
      if (bg && bg !== 'rgba(0, 0, 0, 0)' && a > 0) {
        stack.push([parse(bg), a])
        if (a >= 1) break
      }
      n = n.parentElement
    }
    let base = parse(getComputedStyle(document.documentElement).backgroundColor)
    if (!base.length || base.every((c) => c === 0)) base = [10, 13, 20]
    for (let i = stack.length - 1; i >= 0; i--) base = over(stack[i][0], base, stack[i][1])
    return base
  }
  const ratio = (a, b) => { const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x); return (hi + 0.05) / (lo + 0.05) }

  const small = []
  const thin = []
  const lowContrast = []
  const sizes = new Set()
  let textNodes = 0
  let capsNodes = 0

  for (const el of document.querySelectorAll('body *')) {
    const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())
    if (!hasText) continue
    const cs = getComputedStyle(el)
    if (cs.visibility === 'hidden' || cs.display === 'none') continue
    // Screen-reader-only text is clipped to 1px and never painted; auditing its
    // contrast is meaningless and produces a guaranteed false failure.
    const box = el.getBoundingClientRect()
    if (box.width <= 2 || box.height <= 2 || cs.clip === 'rect(0px, 0px, 0px, 0px)') continue
    textNodes++
    const fs = parseFloat(cs.fontSize)
    const fw = parseInt(cs.fontWeight, 10)
    sizes.add(Math.round(fs * 10) / 10)
    if (cs.textTransform === 'uppercase') capsNodes++
    const label = `${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/)[0] : ''}`
    if (fs < 11) small.push({ label, size: fs })
    if (fw > 0 && fw < 400) thin.push({ label, weight: fw })
    const r = ratio(parse(cs.color), bgOf(el))
    // WCAG AA floor; Apple's dark-mode guidance asks for 7:1 on small text.
    const need = fs >= 24 || (fs >= 18.66 && fw >= 700) ? 3 : 4.5
    const want = fs < 17 ? 7 : 4.5
    if (r < need) lowContrast.push({ label, size: fs, ratio: +r.toFixed(2), need, level: 'fail' })
    else if (r < want) lowContrast.push({ label, size: fs, ratio: +r.toFixed(2), need: want, level: 'below-apple' })
  }

  const targets = []
  for (const el of document.querySelectorAll('a[href], button, input, select, [role="button"]')) {
    const r = el.getBoundingClientRect()
    if (!r.width || !r.height) continue
    // WCAG 2.5.8 exempts links inside a sentence of running text. Ours are
    // standalone actions in a row, so only skip genuine inline-in-prose cases.
    const inProse = el.tagName === 'A' && el.parentElement
      && getComputedStyle(el.parentElement).display.startsWith('inline')
      && el.parentElement.textContent.trim().length > el.textContent.trim().length * 3
    if (inProse) continue
    const label = `${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/)[0] : ''}`
    if (r.width < 24 || r.height < 24) targets.push({ label, w: +r.width.toFixed(0), h: +r.height.toFixed(0), level: 'wcag-fail' })
    else if (r.width < 44 || r.height < 44) targets.push({ label, w: +r.width.toFixed(0), h: +r.height.toFixed(0), level: 'below-apple' })
  }

  // Density: how many result items fit in a 900px viewport.
  const items = document.querySelectorAll('.row, .card, article')
  const itemH = items.length ? items[0].getBoundingClientRect().height : null

  return {
    small, thin, lowContrast, targets,
    sizes: [...sizes].sort((a, b) => a - b),
    textNodes, capsNodes,
    itemHeight: itemH,
    perViewport: itemH ? +(900 / itemH).toFixed(1) : null,
    hasBackdrop: [...document.querySelectorAll('*')].some((el) => getComputedStyle(el).backdropFilter !== 'none'),
  }
})

/* --------------------------------------------------------- SPEC findings */

// SPEC-01 — Apple iOS minimum legible size is 11pt; macOS 10pt.
if (audit.small.length) {
  const worst = Math.min(...audit.small.map((s) => s.size))
  add('SPEC', 'major', 'font-too-small',
    `${audit.small.length} element(s) below 11px (smallest ${worst}px) — Apple's iOS floor is 11pt`,
    'Raise to 11px minimum. Apple ships nothing smaller anywhere on iOS.')
}

// SPEC-02 — Apple: "avoid Ultralight, Thin, and Light."
if (audit.thin.length) {
  add('SPEC', 'minor', 'thin-weight', `${audit.thin.length} element(s) below weight 400`, 'Use Regular or heavier.')
}

// SPEC-03 — contrast.
const fails = audit.lowContrast.filter((c) => c.level === 'fail')
const belowApple = audit.lowContrast.filter((c) => c.level === 'below-apple')
if (fails.length) {
  add('SPEC', 'critical', 'contrast-fail', `${fails.length} element(s) below WCAG AA`,
    'Raise foreground luminance until the pair clears 4.5:1.')
}
if (belowApple.length) {
  add('SPEC', 'minor', 'contrast-below-apple',
    `${belowApple.length} small-text element(s) between AA and Apple's 7:1 dark-mode target`,
    'Apple: "strive for 7:1, especially in small text" on dark backgrounds.')
}

// SPEC-04 — target size. Apple 44x44pt; WCAG 2.5.8 AA hard floor 24x24 CSS px.
const tFail = audit.targets.filter((t) => t.level === 'wcag-fail')
const tSmall = audit.targets.filter((t) => t.level === 'below-apple')
if (tFail.length) {
  add('SPEC', 'critical', 'target-too-small', `${tFail.length} control(s) below WCAG 2.5.8's 24x24px`,
    'Grow the hit area, or add ≥24px center-to-center clearance.')
}
if (tSmall.length) {
  const list = [...new Set(tSmall.map((t) => t.label))].slice(0, 6).join(', ')
  add('SPEC', 'major', 'target-below-apple',
    `${tSmall.length} control(s) below Apple's 44x44pt (e.g. ${list})`,
    'Apple: "a button needs a hit region of at least 44x44 pt." Pad the hit area even if the ink stays small.')
}

// SPEC-05 — type scale. Impeccable: aim for ≥1.25 between steps.
const steps = audit.sizes.filter((s) => s >= 10)
const tight = []
for (let i = 1; i < steps.length; i++) if (steps[i] / steps[i - 1] < 1.15) tight.push(`${steps[i - 1]}→${steps[i]}`)
if (tight.length >= 3) {
  add('SLOP', 'major', 'flat-type-scale',
    `${steps.length} distinct sizes, ${tight.length} adjacent pairs under 1.15x (${tight.slice(0, 4).join(', ')})`,
    'Collapse to 4-5 deliberate steps with ≥1.25x jumps. Many near-identical sizes read as no hierarchy.')
}

// SPEC-06 — caps saturation, measured rather than guessed.
const capsPct = audit.textNodes ? Math.round((audit.capsNodes / audit.textNodes) * 100) : 0
if (capsPct > 25) {
  add('SLOP', 'major', 'caps-density', `${capsPct}% of text elements are uppercase (${audit.capsNodes}/${audit.textNodes})`,
    'Uppercase is a special register. Above ~25% it stops signalling anything.')
}

// SPEC-07 — density. NN/g: cards reduce items per screen and raise memory load.
if (audit.perViewport !== null && audit.perViewport < 5) {
  add('SPEC', 'major', 'low-density',
    `${audit.perViewport} result items fit a 900px viewport (item height ${Math.round(audit.itemHeight)}px)`,
    'Comparison needs ~5-8 candidates visible at once. Google Maps rows are ~110-130px; ours are far taller.')
}

/* ------------------------------------------- responsive + preference rules */

// SPEC-08 — WCAG 1.4.10 reflow at 320px.
await page.setViewportSize({ width: 320, height: 800 })
await page.waitForTimeout(200)
const overflow320 = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
if (overflow320 > 0) {
  add('SPEC', 'critical', 'reflow-320', `${overflow320}px horizontal overflow at 320px (WCAG 1.4.10)`,
    'No two-dimensional scrolling at 320 CSS px.')
}

// SPEC-09 — backdrop-filter without a reduced-transparency fallback.
if (audit.hasBackdrop && !/prefers-reduced-transparency/i.test(allStyle)) {
  add('SPEC', 'minor', 'no-transparency-fallback', 'backdrop-filter used with no prefers-reduced-transparency fallback',
    'Swap to an opaque fill under @media (prefers-reduced-transparency: reduce).')
}

// SPEC-10 — prefers-contrast.
if (!/prefers-contrast/i.test(allStyle)) {
  add('SPEC', 'minor', 'no-increased-contrast', 'No @media (prefers-contrast: more) block',
    'Apple: if you cannot meet contrast by default, at least honour Increase Contrast.')
}

// SPEC-11 — reduced motion.
if (/transition:/i.test(allStyle) && !/prefers-reduced-motion/i.test(allStyle)) {
  add('SPEC', 'major', 'no-reduced-motion', 'Transitions with no prefers-reduced-motion block', 'Null them out.')
}

// SPEC-12 — WCAG 2.4.11: sticky headers hiding the focused element.
await page.setViewportSize({ width: 1440, height: 900 })
await page.waitForTimeout(150)
const obscured = await page.evaluate(() => {
  const sticky = [...document.querySelectorAll('*')].filter((el) => {
    const cs = getComputedStyle(el)
    return cs.position === 'sticky' && parseFloat(cs.top || '0') === 0
  })
  if (!sticky.length) return null
  return sticky.some((el) => !/scroll-margin/.test(el.getAttribute('style') || '') ) ? sticky.length : 0
})
if (obscured) {
  add('SPEC', 'minor', 'focus-obscured-risk',
    `${obscured} sticky element(s) pinned to top:0 with no scroll-margin on focusable content (WCAG 2.4.11)`,
    'Add scroll-margin-top equal to the sticky height on focusable items.')
}

await browser.close()
server.close()

/* ------------------------------------------------------------------ report */

const order = { critical: 0, major: 1, minor: 2 }
findings.sort((a, b) => order[a.severity] - order[b.severity] || a.family.localeCompare(b.family))

if (JSON_OUT) {
  console.log(JSON.stringify({ findings, audit }, null, 2))
} else {
  const n = (s) => findings.filter((f) => f.severity === s).length
  const slop = findings.filter((f) => f.family === 'SLOP').length

  console.log('\n  DESIGN LINT\n  ' + '─'.repeat(66) + '\n')
  for (const f of findings) {
    const tag = { critical: 'CRIT ', major: 'MAJOR', minor: 'minor' }[f.severity]
    console.log(`  [${tag}] ${f.family}/${f.rule}`)
    console.log(`          ${f.detail}`)
    console.log(`       →  ${f.fix}\n`)
  }
  console.log('  ' + '─'.repeat(66))
  console.log(`  ${n('critical')} critical · ${n('major')} major · ${n('minor')} minor`)
  console.log(`  ${slop} slop tells   (Krebs tiering: 0-1 low · 2-3 medium · 4+ high)`)

  const verdict = slop >= 4 || n('critical') > 0
    ? 'reads as AI-generated — fix the criticals and the slop tells'
    : slop >= 2 ? 'close; clear the remaining tells' : 'clean'
  console.log(`  verdict: ${verdict}`)
  console.log(`  density: ${audit.perViewport ?? '—'} items per 900px viewport\n`)
}

process.exitCode = findings.some((f) => f.severity === 'critical') ? 1 : 0
