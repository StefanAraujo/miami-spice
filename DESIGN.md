---
name: Miami Spice
description: An honest, keyless Miami Restaurant Week directory — "Midnight Poster."
colors:
  paper: "#0a0d0e"
  card: "#12181a"
  sunk: "#05080a"
  ink: "#f2f3ee"
  soft: "#9fb0ad"
  rule: "#3c4749"
  hair: "#20282a"
  marine: "#1be7ff"
  marineWash: "#0e2f36"
  signal: "#1be7ff"
  flamingo: "#ff6ec7"
  purple: "#c86bff"
  orange: "#ff824d"
  onColor: "#06110f"
typography:
  display:
    fontFamily: "Futura, 'Avenir Next', 'Century Gothic', 'Helvetica Neue', system-ui, sans-serif"
    fontSize: "clamp(3rem, 8vw, 5rem)"
    fontWeight: 700
    lineHeight: 0.82
    letterSpacing: "-0.02em"
  hero:
    fontFamily: "Futura, 'Avenir Next', 'Century Gothic', 'Helvetica Neue', system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 6.5vw, 4rem)"
    fontWeight: 700
    lineHeight: 0.92
    letterSpacing: "-0.02em"
  section:
    fontFamily: "Futura, 'Avenir Next', 'Century Gothic', system-ui, sans-serif"
    fontSize: "40px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.02em"
  name:
    fontFamily: "Futura, 'Avenir Next', 'Century Gothic', system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.47
    letterSpacing: "-0.01em"
  label:
    fontFamily: "Futura, 'Avenir Next', 'Century Gothic', system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "0.08em"
rounded:
  none: "0"
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
    textColor: "{colors.onColor}"
    rounded: "{rounded.none}"
    padding: "0 24px"
    height: "54px"
  price-block:
    backgroundColor: "{colors.flamingo}"
    textColor: "{colors.onColor}"
    rounded: "{rounded.none}"
    padding: "5px 12px"
  facet:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0 16px"
    height: "44px"
  facet-selected:
    backgroundColor: "{colors.marine}"
    textColor: "{colors.onColor}"
    rounded: "{rounded.none}"
    padding: "0 16px"
    height: "44px"
  tile-cyan:
    backgroundColor: "{colors.marine}"
    textColor: "{colors.onColor}"
    rounded: "{rounded.none}"
    padding: "0 16px"
    height: "44px"
  tile-pink:
    backgroundColor: "{colors.flamingo}"
    textColor: "{colors.onColor}"
    rounded: "{rounded.none}"
    padding: "0 16px"
    height: "44px"
---

# Design System: Miami Spice

## Overview

**Creative North Star: "Midnight Poster"**

Miami Vice as a flat, geometric **poster at night** — not a soft app, and not the neon-glow
synthwave cliché. The ground is deep and nearly unlit; electric cyan is the structural tint;
one hot pink is reserved for price; purple and tomato are a categorical accent layer. Chunky
geometric display caps (Futura lineage) carry the brand and the headlines; SF carries the dense
body so a 379-row list stays scannable. Everything is **hard-edged and flat**: 2px borders,
flat colour blocks, a tri-colour rule, and a single **sliced/offset wordmark** — the reference
logo's fragmentation distilled to one confident move. No gradient, no glow, no soft rounding.
The depth device is a hard ink offset (neo-brutalist), never a blurred halo.

This world is **brief-pinned**: the owner supplied the Miami-Vice colour palette
(colorswall #246639) and the sliced-caps poster logo, asking for a modern take. It replaces the
retired "Apple form · Vice night" (soft-round, SF, sentence-case) and, before that, "Tropical
Deco" — both held only as historical anti-reference. This is deliberately the opposite of the
neon-on-black glow the anti-slop discipline rejects: the boldness comes from flat colour and
geometry, not luminance.

**Key Characteristics:**
- Deep near-dark ground; colour lives in cyan structure, one flamingo price, and flat blocks.
- Depth is a hard ink offset — flat, geometric, never a gradient or glow.
- Zero rounding: a poster is cut, not softened. 2px borders draw the form.
- Futura-lineage geometric caps for brand/headings/labels; SF for the dense body.
- One saturated object per row (the hot-pink price block), plus a colour-blocked tile wall.
- Rows, not cards — a 379-item comparison directory at ~8.5 per 900px viewport.

## Colors

A deep near-dark ground with structure in electric cyan and one hot accent for price — the
palette is chosen by what it *excludes* (no earth tones, no primaries, no glow). Single theme
on `:root`; the app ships one dark world.

### Primary
- **Marine / Electric cyan** (`#1be7ff`): the structural **tint** — selection, filled controls,
  the primary CTA, segmented-control fill, links, the sliced wordmark's second line, the sheet
  header band. Everything load-bearing that isn't price.
- **Flamingo / Hot pink** (`#ff6ec7`): price, and price alone. The one saturated object per row.

### Categorical accent layer
- **Purple** (`#c86bff`) and **Tomato** (`#ff824d`): reserved for a categorical layer (mood /
  occasion). Present so the full Miami palette reads, held back so the composition stays flat
  cyan/pink/ink, never a rainbow.

### Neutral
- **Paper** (`#0a0d0e`): the base night ground.
- **Card** (`#12181a`): lifted surfaces — the expanded row panel, the menu sheet, the empty state.
- **Sunk** (`#05080a`): wells / control tracks (the search field).
- **Ink** (`#f2f3ee`): primary type and the hard offset shadow; held just off the maximum.
- **Soft** (`#9fb0ad`): secondary text — clears 7:1 on both ground and card.
- **Rule** (`#3c4749`): the 2px hard borders that draw every control.
- **Hair** (`#20282a`): row separators.
- **On-color** (`#06110f`): the deep type that sits on a cyan or pink colour block.
- **Marine-wash** (`#0e2f36`): cyan at low light — the image-fallback tile ground.

### Named Rules
**The Price-Only Rule.** `#ff6ec7` is used for price and nothing else — the scarcest ink points
at the one thing the eye hunts for in a directory of $40/$50/$65 tiers.

**The Tint Rule.** Cyan is the single structural interactive colour: fills, selection, links,
CTAs. It never becomes a glow; it fills flat blocks and draws 2px edges.

**The Exclusion Rule.** Per Michael Mann's *Miami Vice* production rule — no earth tones, no
red, no primaries. What survives is cyan, one flamingo, and the two-hue accent layer.

## Typography

**Display is a geometric caps face** — the platform's Futura / Avenir Next (a Futura-lineage
geometric), set UPPERCASE. It carries the sliced wordmark, the giant mood headline, section
labels, control labels, restaurant names, and price figures — the Miami-Vice poster voice.
**Body is SF** (`-apple-system`) for everything read at length: dish descriptions, teasers, row
meta, prose captions — where sentence-case legibility beats poster shout. **Figures** use SF Mono
for tabular alignment. No web fonts download; production may self-host a display face
(Monument Extended / Clash Display) for non-Apple platforms where Futura is absent.

### Hierarchy
- **Display** (Futura 700 caps, `clamp(3rem, 8vw, 5rem)`): the sliced MIAMI / SPICE wordmark.
- **Hero** (Futura 700 caps, `clamp(2.5rem, 6.5vw, 4rem)`): "WHAT ARE YOU IN THE MOOD FOR?"
- **Section** (Futura 700, 40px): the result count number (in cyan).
- **Name** (Futura 700, 20px): restaurant names, the "dish to order" signature, price figures.
- **Body** (SF 400, 15px): dish descriptions, teasers, row meta, prose.
- **Label** (`.micro`, Futura 700 caps, 13px, tracked): section labels, counts, control labels.

### Named Rules
**The Caps-Voice Rule.** Uppercase geometric caps are the brand's display voice — wordmark,
hero, tiles, section labels, primary CTAs, price, segmented controls. This is intentional
poster language, not an eyebrow. Its guardrail is the **rendered** caps-density (design-lint
SPEC-06, kept under 25% of text nodes): the dense functional controls — rail facets, day/meal —
stay **sentence case** so the caps signal keeps meaning and the list stays scannable.

**The Two-Face Rule.** Futura for the poster (brand, headings, labels, names, figures); SF for
the body (descriptions, teasers, meta, prose). Never set a paragraph of running copy in caps.

## Layout

A centered `max-width: 1120px` column with a 216px sticky filter rail beside a `minmax(0, 1fr)`
result column (`gap: 48px`). Below 860px the rail collapses to a drawer behind a "Filters"
toggle. Spacing is a strict 4px base (4 / 8 / 12 / 16 / 24 / 32 / 48 / 72). The masthead is a
poster: sliced wordmark top-left, a tri-colour rule beneath it, a quiet caps stat line, then a
huge caps mood headline over the colour-blocked discover wall. Density governs: rows (~104px),
~8.5 per 900px viewport, never a card grid. Wide content (map, day×meal grid, course strip) is
bounded so the body never scrolls sideways; reflow is clean at 320px.

### Named Rules
**The Rows-Not-Cards Rule.** A 379-item comparison directory hits all four NN/g cases where
cards are wrong (search, comparison, homogeneous content, density). Results stay rows; secondary
actions move into the expanded panel to buy density.

## Elevation & Depth

Depth is a **hard ink offset** (neo-brutalist), plus tonal steps between paper / card / sunk and
2px borders. This is a committed flat-poster world, so the hard offset is the identity, not a
costume; there is no gradient and no coloured glow anywhere (the banned synthwave tells).

### Shadow Vocabulary
- **Eyebrow** (`--eyebrow`, `4px 4px 0 var(--ink)`): the resting offset — the primary CTA, the
  expanded row panel, the empty state, the map frame.
- **Shadow-lg** (`--shadow-lg`, `8px 8px 0 var(--ink)`): the menu-sheet's deeper offset.

### Named Rules
**The Hard-Offset Rule.** Elevation is a flat ink offset with zero blur — a cut sheet casting a
hard shadow. A blurred or coloured glow is the banned slop tell; reach for tonal surface steps
and 2px borders first, and add the hard offset only where something genuinely lifts.

## Shapes

**Zero rounding** — `border-radius` is `0` everywhere; a poster is cut, not softened. Form is
drawn with **2px borders** (`--rule`) and flat colour blocks. Two signature devices recur: the
**sliced wordmark** (MIAMI in ink over SPICE in cyan with a hard flat pink offset — one clean
misregistration) and the **tri-colour rule** (cyan / pink / ink, the rule of three under the
masthead). The design-lint uniform-radius rule is scoped to allow this deliberately hard world.

### Named Rules
**The Cut Rule.** Nothing is rounded. If a control needs to read softer, change its fill or
weight, not its corners. Hard edges and 2px borders are the geometry.

## Components

### Buttons
- **Shape:** hard-cornered, ≥44px tall (`--tap`), drawn with a 2px `--rule` border or a flat fill.
- **Primary (CTA):** cyan fill, `--on-color` caps label, a hard ink offset (`Pick one for us`,
  `Book on OpenTable`). Hover inverts to an ink fill.
- **Secondary:** transparent with a 2px `--rule` border, caps label; hover lights the border cyan.
- **Hover / Focus:** hover changes fill or border colour, never scale; focus is a 2px cyan
  outline at 3px offset, never a border (a border would shift layout).

### Chips (applied-filter chips)
- **Style:** cyan flat block, `--on-color` caps label, an `×`; the `Clear all` chip is a 2px
  ghost that lights flamingo on hover.

### Discovery tiles (the poster wall)
- **Style:** hard blocks, caps label, a soft mono count. Outline by default; every 4th fills
  **cyan**, every 4th+2 fills **pink**, so the lanes read as a flat tri-colour composition.

### Facet pills & day/meal controls
- **Style:** transparent, 2px `--rule` border, **sentence-case** Futura (not caps — these are
  dense functional controls where scannability wins). Selected = cyan flat fill + `--on-color`.
  Zero-count options are disabled and greyed, **never removed** (Baymard spatial memory).

### Segmented controls
- **Style:** a 2px `--rule` frame; the selected segment fills cyan with `--on-color`. Caps
  labels. Used for List/Map and the course strip.

### Inputs / Fields
- **Style:** `--sunk` fill, 2px `--rule` border, hard corners; border lights cyan on hover/focus.

### Rows (signature component)
- The result unit. Name (Futura caps-weight, sentence case) / `Cuisine · Hood · N dishes` (SF
  soft) / a course-aware teaser — with the hot-pink **price block** and the primary offer on the
  right, and a bookmark pin in a fixed left gutter. Hover pulls the row onto the elevated surface
  and lights a 3px cyan left edge. Expanding reveals a 2px-framed `--card` panel with a hard
  offset: one image (or a cyan sun fallback tile), the "dish to order" line, the day×meal grid,
  the course ladder, the full-menu button, and the actions. Rows separated by a 1px `--hair`.

### Menu detail popup — `MenuSheet` (signature component)
- The full-menu sheet answers "what exactly is on the brunch menu." Opened per meal from the
  course ladder, it shows every course, the choose-count, and each dish with its **description
  note**. A real modal: portalled to `<body>`, focus trapped and restored, Esc + backdrop close,
  scroll locked, `role="dialog"`. A solid **cyan header band** carries the meal title with the
  hot-pink price block on it (the two hues together, on purpose); a 2px cyan frame and hard
  offset. Bottom-sheet on mobile, centered ≥640px.

### Day×Meal availability grid & ViceMark
- The grid is a compact `<table>` of hard cyan/`--sunk` cells (served / not) with a legend.
- `ViceMark` is a flat cyan Miami-sun mark (solid fills, no gradient/glow) used as the
  image-fallback tile and the empty-state mark.

## Do's and Don'ts

### Do:
- **Do** route every colour through a `var()`; raw hex outside `app.css` is a lint finding.
- **Do** draw form with 2px `--rule` borders and flat colour blocks; hard corners everywhere.
- **Do** express depth with the flat ink offset (`4px 4px 0`) and tonal surface steps.
- **Do** reserve `--flamingo` for price; let cyan carry all other structure.
- **Do** set the poster voice (brand, headings, labels, tiles, CTAs) in Futura caps, and the
  body (descriptions, teasers, meta) in sentence-case SF.
- **Do** keep dense functional controls (rail facets, day/meal) sentence case for scannability.
- **Do** disable-and-grey zero-count options; never remove them.
- **Do** keep every hit target ≥44pt and meet the floors: 11px min type, 7:1 small text.

### Don't:
- **Don't** use a gradient, a coloured glow, glassmorphism, or a radial aurora — every one is a
  catalogued AI-slop tell and a `design-lint.mjs` failure. Flat colour only.
- **Don't** round corners, or soften the hard ink offset into a blur.
- **Don't** set a paragraph of running copy in caps, or let rendered caps-density pass 25%.
- **Don't** use `--flamingo` for anything but price, or scatter purple/tomato beyond the
  categorical layer.
- **Don't** reach for a card grid, a banned web font (Inter / Geist / Space Grotesk / Poppins …),
  or pure `#000`/`#fff`.
- **Don't** work around a lint rule — if you disagree with it, edit the rule and say why.
