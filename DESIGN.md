---
name: Miami Spice
description: An honest, keyless Miami Restaurant Week directory — "Apple form, Vice night."
colors:
  paper: "#0e1a1f"
  card: "#16262c"
  sunk: "#0b151a"
  ink: "#f2f4ee"
  soft: "#a6bcb7"
  rule: "#33454c"
  hair: "#21343b"
  marine: "#7fe3ef"
  marineWash: "#14323a"
  signal: "#7fe3ef"
  flamingo: "#ff6fae"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif"
    fontSize: "clamp(2rem, 5vw, 2.75rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.025em"
  section:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  name:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.015em"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.47
    letterSpacing: "-0.01em"
  caption:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 590
    lineHeight: 1.4
    letterSpacing: "-0.005em"
rounded:
  sm: "8px"
  md: "12px"
  lg: "20px"
  full: "980px"
spacing:
  s1: "4px"
  s2: "8px"
  s3: "12px"
  s4: "16px"
  s5: "24px"
  s6: "32px"
  s7: "48px"
  s8: "72px"
  tap: "44px"
components:
  cta-primary:
    backgroundColor: "{colors.marine}"
    textColor: "{colors.card}"
    rounded: "{rounded.full}"
    padding: "0 24px"
    height: "44px"
  price-pill:
    backgroundColor: "{colors.flamingo}"
    textColor: "{colors.card}"
    rounded: "{rounded.sm}"
    padding: "3px 12px"
  facet:
    backgroundColor: "{colors.sunk}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    padding: "0 16px"
    height: "44px"
  facet-selected:
    backgroundColor: "{colors.marine}"
    textColor: "{colors.card}"
    rounded: "{rounded.full}"
    padding: "0 16px"
    height: "44px"
  segmented-thumb:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    trackBackground: "{colors.sunk}"
    height: "44px"
---

# Design System: Miami Spice

## Overview

**Creative North Star: "Apple form · Vice night"**

The colour soul is Miami Vice after dark; the *form* is a native Apple app. The field is a deep
marine after-hours, structure is drawn in the Vice cyan, and a single hot-pink flamingo carries
price — the two Vice hues surface as **the system tint and one saturated object, never as the
wall itself.** The room is otherwise a calm, near-monochrome night. That restraint is the point.

The 2026-08-02 redesign kept every fact, function, and constraint but replaced the look. What was
*Tropical Deco* — hard-edged offset "eyebrow" slabs, square corners, racing stripes, a Poiret-One
uppercase wordmark over Jost — is retired, held only as historical anti-reference in
`DESIGN_REVIEW.md` / `VICE_DIRECTION.md`. In its place: Apple's own language — SF system faces,
continuous rounded corners, soft neutral depth, generous rhythm, sentence case, iOS-grade controls.

This is still "Miami Vice" reached by *exclusion*, per Michael Mann's production rule — no earth
tones, no primaries, no glow. It is deliberately the opposite of the neon-on-black synthwave that
reads as machine-made; that pattern is the named anti-reference, enforced by `design-lint.mjs`.
(A lighter light-mode base remains defined in `app.css` as a dormant fallback; the product ships
night-only, forced in `main.js`.)

**Key Characteristics:**
- Deep-marine night field; colour lives only in the system tint and the one flamingo price.
- Depth is soft and neutral — a low-blur `rgba(0,0,0,…)` offset, never a hard slab, never a glow.
- Continuous rounded corners (three radius steps + a pill), Apple's soft geometry.
- SF system type, sentence case, a fuller Apple text ramp; no web fonts, no uppercase eyebrows.
- iOS controls: filled tracks with a soft neutral thumb; tint-filled selection; ≥44pt targets.
- Rows, not cards — a 380-item comparison directory, ~8.7 per 900px viewport.

## Colors

A near-neutral night field with structure in the Vice cyan and a single hot accent — the palette
is chosen by what it *excludes*. Values below are the shipped **night** theme
(`:root[data-theme='pm']`); `:root` holds a dormant light fallback under the same token names.

### Primary
- **Marine / Vice Cyan** (`#7fe3ef`): the **system tint** — links, active/selected state, filled
  controls, the CTA fill, the primary action. Everything load-bearing and interactive that is not
  price. This is Apple's accent role, in the Vice hue.
- **Flamingo** (`#ff6fae`): price, and price alone. The one saturated object on any screen.

### Neutral surfaces (Apple layering)
- **Paper** (`#0e1a1f`): the base field — the page ground.
- **Card** (`#16262c`): elevated surfaces — rows' expanded panel, the empty state, overlays.
- **Sunk** (`#0b151a`): wells and control tracks — the search field, facet/segmented backgrounds.
- **Ink** (`#f2f4ee`): primary label text (~16:1 on paper).
- **Soft** (`#a6bcb7`): secondary/metadata text (clears Apple's 7:1 on both field and card).
- **Rule** (`#33454c`): control boundaries and the disclosure caret.
- **Hair** (`#21343b`): subtle separators — the Apple hairline between rows.
- **Marine-wash** (`#14323a`): the tint at low opacity — hover fills on rows, tiles, and controls.

### Named Rules
**The Price-Only Rule.** `--flamingo` is used for price and nothing else. Its scarcity is what
makes it the memory anchor; spend it anywhere else and the isolation collapses.

**The Tint Rule.** Cyan is the single interactive tint — selection, links, filled controls, the
primary CTA — exactly as an Apple app uses one accent. It never becomes the field and is never
blurred into a glow. Selection *fills* with tint; a neutral thumb marks an exclusive segment.

**The Night Rule.** The app is night-only. The active palette is the deep-marine set above; every
small-text pair clears Apple's 7:1 on both field and card. The lighter tokens in `:root` remain a
dormant, AA-clean fallback — there is no daytime mode in the product.

## Typography

**All faces are the platform's own SF system stack** — `-apple-system, BlinkMacSystemFont,
'SF Pro Text'/'SF Pro Display', system-ui`. Figures (prices, counts, day tokens) use SF Mono via
`ui-monospace` for tabular alignment. No web fonts are downloaded, so first paint is instant and
matches native Apple apps exactly.

**Character:** SF does all the work — Display weight for the large title and headings, Text for
everything read at body size, Mono only where digits must line up. Weight and size carry hierarchy;
tracking tightens as size grows (Apple's optical rule), and case stays sentence throughout.

### Hierarchy
- **Display** (SF 700, `clamp(2rem, 5vw, 2.75rem)`, tracking −0.025em): the wordmark / large title.
- **Section** (SF 700, 28px, tracking −0.02em): the discovery prompt ("What are you in the mood for?").
- **Title** (SF 700, 22px, tracking −0.02em): the result count, the empty-state lead.
- **Name** (SF 600, 17px, tracking −0.015em): restaurant names; the price figure.
- **Body** (SF 400, 15px): row body, filters, teasers, subtitle.
- **Caption** (`.micro`, SF 590, 13px): section labels, counts, meta — a **sentence-case secondary
  label**, never an uppercase eyebrow.

### Named Rules
**The Apple-Ramp Rule.** Six weight-and-size steps — 13 / 15 / 17 / 22 / 28 / display(32–44) —
with fewer than three adjacent pairs under 1.15× (the lint's type-scale floor). Hierarchy is made
by *weight and tracking* as much as size, the Apple way; don't add a step just to nudge one label.

**The Sentence-Case Rule.** Uppercase `text-transform` is retired entirely. Labels lead in
sentence case; a re-introduced uppercase role risks the eyebrow-overuse tell. The content, not
the label, carries the emphasis.

## Layout

A centered `max-width: 1120px` column with a two-track grid: a 216px sticky filter rail beside a
`minmax(0, 1fr)` result column (`gap: 48px`). Below 860px the rail collapses to a drawer behind a
"Filters" toggle and the layout goes single-column. Spacing is a strict 4px base — 4 / 8 / 12 /
16 / 24 / 32 / 48 / 72. The masthead is an iOS-style large title: wordmark left, a tint action
right, a quiet subtitle beneath. Density is the governing constraint: results are rows (~104px),
~8.7 per 900px viewport, never a card grid. Wide content (map, day×meal grid) is bounded so the
body never scrolls sideways; reflow is clean at 320px.

### Named Rules
**The Rows-Not-Cards Rule.** A 380-item comparison directory hits all four NN/g cases where cards
are wrong (search, comparison, homogeneous content, density). Results stay rows; secondary actions
move into the expanded panel to buy the density. Cards would fail the ≥5-items-per-viewport floor.

## Elevation & Depth

Depth is **soft and neutral** — Apple's dark-mode elevation, a low-blur `rgba(0,0,0,…)` offset —
plus tonal steps between paper / card / sunk and 1px hairlines. There is no gradient and no
*coloured* glow anywhere; a blurred coloured shadow is the exact AI-slop tell the lint bans.

### Shadow Vocabulary
- **Eyebrow** (`--eyebrow`, night `0 1px 3px rgba(0,0,0,0.5)`): resting elevation — the row's
  expanded panel, the CTA, price-adjacent surfaces, the map frame, the intro card.
- **Shadow-lg** (`--shadow-lg`, night `0 16px 50px rgba(0,0,0,0.6)`): floating overlays and the
  segmented-control thumb reads against it.

### Named Rules
**The Soft-Neutral Rule.** Elevation is a soft neutral offset, never a hard slab and never a halo.
Shadows are `rgba(0,0,0,…)` only — a coloured blur is the banned slop tell. Reach for tonal
surface steps and hairlines first; add a shadow only where something genuinely floats.

## Shapes

Continuously rounded throughout — three radius tokens (`--r-sm 8`, `--r-md 12`, `--r-lg 20`) plus
`--r-full` for pills. Rows and panels round at `--r-lg`; controls and search fields at `--r-md`;
segmented thumbs and the price pill at `--r-sm`; chips, facet pills, tiles, and buttons are full
pills. Form is drawn with fills and rounded surfaces, backed by 1px hairlines — no ornamental
devices (the old horizon bar and racing stripes are retired).

### Named Rules
**The Continuous-Round Rule.** Everything is rounded; keep at least three distinct radii in play or
the uniform-radius tell fires. If a control needs to read tighter, change its radius step, not its
corners to zero.

## Components

### Buttons
- **Shape:** full pill (`--r-full`), ≥44px tall (`--tap`).
- **Primary (CTA):** marine (tint) fill, card text, soft `--eyebrow` (`Book on OpenTable`, the
  Discover "Pick one for us"). Hover brightens the fill; it never shifts layout.
- **Secondary:** `--sunk` fill, ink/soft text; hover washes to `--marine-wash` with tint text
  (`Browse all`, shortlist `Clear` / `Done`, the intro "Got it" is a tint pill).
- **Hover / Focus:** hover is a background wash or brightness change, never a scale; focus is a 2px
  marine outline at 3px offset, never transitioned, never a border (a border would shift layout).

### Chips (applied-filter chips)
- **Style:** marine (tint) fill, card text, an `×`, full pill; the `Clear all` chip is a `--sunk`
  ghost that hovers to flamingo text.
- **State:** chips represent removable applied filters; every discovery/mood/occasion selection
  resolves to one so nothing is a hidden query.

### Facet pills & discovery tiles
- **Style:** `--sunk` fill (tiles use `--card` + a hairline), full pill, ink label with a soft
  mono count; ≥44px target. Hover washes to `--marine-wash` with tint text.
- **State:** selected = marine (tint) fill + card text. Zero-count options are `disabled` and
  greyed, **never removed** — removing them makes the list jump and destroys spatial memory.

### Segmented controls
- iOS pattern: a `--sunk` track (`--r-md`, 3px inset) with a soft neutral `--card` **thumb**
  (`--r-sm`, `--eyebrow`) on the selected segment — List/Map view and the course strip. Neutral
  thumb for exclusive choices; tint fill is reserved for multi-select. Same idiom everywhere.

### Inputs / Fields
- **Style:** `--sunk` fill, transparent border, `--r-md`, ≥44px tall — Apple's filled search field.
- **Focus:** background lifts to `--card`, border shifts to `--marine`; the shared focus outline
  applies. No glow.

### Rows (signature component)
- The result unit. Three tiers only — name (17/600) / `Cuisine · Hood · N dishes` (soft meta) /
  a course-aware teaser — with the rounded flamingo **price pill** and availability on the right
  and a bookmark pin in a fixed left gutter. The whole row is the disclosure control (a huge Fitts
  target) and washes to `--marine-wash` on hover. Expanding reveals a rounded, soft-elevated
  `--card` panel: one hero image (rounded, degrades to nothing if the CDN is unreachable), the
  "dish to order" line, the day×meal grid, the course ladder, and the actions. Rows are separated
  by a single `--hair` bottom border.

### Day×Meal availability grid (signature component)
- A compact `<table>` with `border-spacing`: Mon–Sun columns × meal rows, a rounded tint cell
  where that meal is served that day, an empty `--sunk` cell where not. A legend states
  served/not-served so nothing depends on colour alone. Reuses the disable-not-remove vocabulary;
  the price column collapses on mobile. Never a control — a data display.

## Do's and Don'ts

### Do:
- **Do** route every colour through a `var()`; raw hex outside `app.css` is a lint finding.
- **Do** express depth with the soft neutral `--eyebrow` / `--shadow-lg` and tonal surface steps.
- **Do** round continuously — keep ≥3 distinct radii (`--r-sm/md/lg` + `--r-full`) in play.
- **Do** keep results as rows at ~104px, ≥5 per 900px viewport; move secondary actions into the
  expanded panel.
- **Do** reserve `--flamingo` for price and let the single tint carry all other interaction.
- **Do** keep type sentence case on the Apple ramp (13 / 15 / 17 / 22 / 28 / display).
- **Do** disable-and-grey zero-count options; never remove them.
- **Do** keep every control's hit target ≥44pt even when it reads slim, and meet the enforced
  floors: 11px min type, 7:1 small-text, 3:1 UI boundary.

### Don't:
- **Don't** use a *coloured* glow, gradient text, glassmorphism, or a radial "aurora" background —
  every one is a catalogued AI-slop tell and a `design-lint.mjs` failure. (Neutral `rgba(0,0,0)`
  shadows are the Apple elevation and are fine.)
- **Don't** put neon on the field: the Vice hues are the tint and one price object, never the wall.
- **Don't** re-introduce uppercase eyebrows, a hard zero-blur offset slab, square corners, or the
  retired Deco devices (horizon bar, racing stripes, Poiret wordmark).
- **Don't** use `--flamingo` for anything but price, or a second isolated accent that dilutes it.
- **Don't** reach for a card grid, a web font (Inter / Geist / Space Grotesk / Poppins …), or
  pure `#000`/`#fff`.
- **Don't** work around a lint rule — if you disagree with it, edit the rule and say why.
