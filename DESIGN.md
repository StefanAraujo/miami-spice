---
name: Miami Spice
description: An honest, keyless Miami Restaurant Week directory — "Ocean Drive After Dark."
colors:
  paper: "#e9e6de"
  card: "#f5f3ed"
  sunk: "#e2ded4"
  ink: "#161a19"
  soft: "#464b47"
  rule: "#8e887e"
  hair: "#cfcabe"
  marine: "#12414c"
  signal: "#0c5460"
  flamingo: "#9c1e45"
typography:
  display:
    fontFamily: "Poiret One, Jost, sans-serif"
    fontSize: "clamp(2.75rem, 7vw, 3.5rem)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.16em"
  headline:
    fontFamily: "Poiret One, Jost, sans-serif"
    fontSize: "30px"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "0.02em"
  title:
    fontFamily: "Jost, -apple-system, sans-serif"
    fontSize: "19px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.005em"
  body:
    fontFamily: "Jost, -apple-system, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.14em"
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
  tap: "44px"
components:
  cta-primary:
    backgroundColor: "{colors.marine}"
    textColor: "{colors.card}"
    rounded: "{rounded.none}"
    padding: "0 24px"
    height: "44px"
  price-chip:
    backgroundColor: "{colors.flamingo}"
    textColor: "{colors.card}"
    rounded: "{rounded.none}"
    padding: "4px 12px"
  facet:
    backgroundColor: "{colors.card}"
    textColor: "{colors.soft}"
    rounded: "{rounded.none}"
    padding: "0 12px"
    height: "44px"
  facet-selected:
    backgroundColor: "{colors.marine}"
    textColor: "{colors.card}"
    rounded: "{rounded.none}"
    padding: "0 12px"
    height: "44px"
---

# Design System: Miami Spice

## Overview

**Creative North Star: "Ocean Drive After Dark"**

The system is the arc of a Miami Beach day compressed into one toggle. By day (AM) the field
is the City of Miami Beach's own regulated near-white — Heron Plume paper, a Deco terrazzo
calm — with structure drawn in marine blue and a single flamingo used for price. Flip to night
(PM) and the same room becomes a deep-marine after-hours: the field darkens, the type stays,
and the two Vice hues — cyan and hot pink — surface exactly where the daytime accents lived,
as **neon signage over a pale-then-dark wall, never as the wall itself.** Nothing about the
composition changes across the toggle; only the light does. That restraint is the whole point.

This is "Miami Vice" reached by *exclusion*, per Michael Mann's production rule — no earth
tones, no primaries, no glow. The look is Apple-precise in its discipline (one type family for
work, generous rhythm, a single saturated object per screen) and Art-Deco in its devices (a
hard-edged offset "eyebrow" shadow, racing stripes in threes, square corners, a Poiret-One
wordmark). It is deliberately the opposite of the neon-on-black synthwave that reads as
machine-made; that pattern is the named anti-reference, catalogued in `DESIGN_REVIEW.md` and
enforced by `design-lint.mjs`.

**Key Characteristics:**
- Near-white (or deep-marine) field; color lives only in signage, on a tiny fraction of pixels.
- Depth is hard sun — a zero-blur offset shadow — never a glow or gradient.
- One saturated object per screen (the flamingo price), protected by palette discipline.
- Square corners, hairline rules, racing stripes; a Poiret-One Deco wordmark over a Jost body.
- Dual AM/PM theme that swaps only light, never layout.

## Colors

A near-neutral field with structure in marine and a single hot accent — the entire palette is
chosen by what it *excludes*. Values below are the AM (default) theme; PM redefines the same
token names for night (see the Dual-Theme Rule).

### Primary
- **Marine** (`#12414c`): the structural voice — links, active/selected state, section rules,
  the CTA fill, the horizon line. Everything load-bearing and interactive that isn't price.
- **Flamingo** (`#9c1e45`): price, and price alone. The one saturated object on any screen.

### Secondary
- **Signal / Vice Cyan** (`#0c5460` by day): the *second* interactive voice — a teal deepened
  until it clears 7:1 on near-white. Same hue as the PM neon cyan with the luminance dropped;
  carries any affordance that would otherwise collide with marine.

### Neutral
- **Paper** (`#e9e6de`): the page ground — SW Heron Plume, the district's regulated near-white.
- **Card** (`#f5f3ed`): raised surfaces — rows, panels, facet pills, tiles.
- **Sunk** (`#e2ded4`): wells and inset fields.
- **Ink** (`#161a19`): body and headline text (15.8:1 on paper).
- **Soft** (`#464b47`): metadata and secondary text (clears Apple's 7:1 small-text target).
- **Rule** (`#8e887e`): UI boundaries (clears WCAG 1.4.11's 3:1).
- **Hair** (`#cfcabe`): decorative hairlines and dividers.

### Named Rules
**The Price-Only Rule.** `--flamingo` is used for price and nothing else. Its scarcity is what
makes it the memory anchor; spend it anywhere else and the isolation collapses.

**The Signal Rule.** Saturation lives only in signage — accents touch ≤5% of any screen, never
the field, never behind body text, never blurred. That is Miami's real light budget: neon
tubing over a pale wall, not a neon sky.

**The Dual-Theme Rule.** Every colour is overridden *by name* under `:root[data-theme='pm']`, so
the whole app recolours with zero component changes. PM: paper `#0e1a1f`, card `#16262c`, ink
`#f2f4ee`, soft `#9fb0ac`, rule `#6f827e`, hair `#26363b`, marine & signal `#7fe3ef` (Vice cyan),
flamingo `#ff6fae` (hot pink). AM is the default. Every pair clears its contrast floor in both.

## Typography

**Display Font:** Poiret One (with Jost fallback) — a geometric Art-Deco face, hero moments only.
**Body Font:** Jost (with -apple-system) — the Futura/1927 lineage; period-correct Deco geometry
that still reads as contemporary UI type.
**Label/Mono Font:** IBM Plex Mono — all data, counts, day tokens, and uppercase micro-labels.

**Character:** Poiret's thin high-geometry says "Ocean Drive signage" at the wordmark; Jost does
the humane, legible work of the interface; Plex Mono's tabular figures make a comparison list
line up. Self-hosted via `@fontsource`; no CDN, no silent fallback.

### Hierarchy
- **Display** (Poiret One 400, `clamp(2.75rem, 7vw, 3.5rem)`, tracking 0.16em, uppercase): the
  wordmark and hero numbers only.
- **Headline** (Poiret One 400, 30px): section heads and the discovery prompt ("What are you in
  the mood for?").
- **Title** (Jost 600, 19px): restaurant names; the price chip figure.
- **Body** (Jost 400, 15px): row body, filters, teasers.
- **Label** (IBM Plex Mono 400, 12px, tracking 0.14em, uppercase): micro-labels, day tokens,
  counts, the wordmark eyebrow.

### Named Rules
**The Five-Step Rule.** Exactly five sizes — 12 / 15 / 19 / 30 / 44–56 — each ≥1.25× the last.
Never introduce a sixth; a cluster of near-identical sizes reads as no hierarchy.

**The Two-Caps Rule.** Uppercase appears in exactly two roles — the `.micro` label and the
wordmark. A third uppercase role re-triggers the eyebrow-overuse tell.

## Layout

A centered `max-width: 1120px` column with a two-track grid: a 216px sticky filter rail beside a
`minmax(0, 1fr)` result column (`gap: 48px`). Below 860px the rail collapses to a drawer behind a
"Filters" toggle and the layout goes single-column. Spacing is a strict 4px base — 4 / 8 / 12 /
16 / 24 / 32 / 48. Density is the governing constraint: results are rows (~104px), targeting ~8.5
items per 900px viewport, never a card grid. Wide content (the map, the day×meal grid) is bounded
so the page body never scrolls sideways; reflow is clean at 320px.

### Named Rules
**The Rows-Not-Cards Rule.** A 380-item comparison directory hits all four NN/g cases where cards
are wrong (search, comparison, homogeneous content, density). Results stay rows; secondary actions
move into the expanded panel to buy the density. Cards would fail the ≥5-items-per-viewport floor.

## Elevation & Depth

There are **no soft shadows, no blur, and no glow anywhere in the system** — that absence is a
position, not an oversight. Depth is a single hard-edged offset slab: a Deco "eyebrow" sunshade.
Surfaces are otherwise flat, separated by 1px hairlines and tonal steps between paper/card/sunk.

### Shadow Vocabulary
- **Eyebrow** (`box-shadow: 6px 6px 0 rgba(18,65,76,0.1)`; PM `6px 6px 0 rgba(127,227,239,0.14)`):
  the only shadow. Applied to raised panels, the price chip, the CTA, the map frame, and the
  full-bleed horizon bar. Always zero blur.

### Named Rules
**The Hard-Sun Rule.** Miami light is knife-edge sun, so elevation is a hard offset slab with
zero blur — never a halo. A blurred coloured shadow is the exact AI-slop tell the lint bans; if
you reach for `box-shadow` with a blur radius, stop.

## Shapes

Square-cornered throughout — `border-radius` is `0` everywhere; Art Deco is a square-cornered
idiom and rounding it would erase the identity. Form is drawn with 1px hairlines (`--hair`,
`--rule`), not fills. Two signature devices recur: the **horizon eyebrow** (one full-bleed 6px
marine bar with a 6px offset cyan slab beneath it — the Ocean Drive skyline line under the
masthead) and the **racing stripes** (three stacked hairlines, marine/flamingo/marine — the
"rule of three" that carries the whole 1930s reference in three lines).

### Named Rules
**The Square Rule.** Nothing is rounded. If a control needs to read softer, change its weight or
value, not its corners.

## Components

### Buttons
- **Shape:** square (`0` radius), ≥44px tall (`--tap`).
- **Primary (CTA):** marine fill, card text, hard eyebrow shadow (`Book on OpenTable`, the
  Discover "Pick one for us"). Mono label.
- **Secondary / Outline:** transparent with a 1px `--rule` border, soft text; darkens to ink on
  hover (`Browse all`, shortlist `Clear` / `Done`).
- **Hover / Focus:** hover shifts border/colour toward marine or ink; focus is a 2px marine
  outline at 3px offset, never transitioned, never a border (a border would shift layout).

### Chips (filter chips)
- **Style:** applied-filter chips are marine fill with card text and an `×`; the `Clear all` chip
  is a bordered ghost that hovers to flamingo.
- **State:** chips represent removable applied filters; every discovery/mood/occasion selection
  resolves to one so nothing is a hidden query.

### Facet pills & discovery tiles
- **Style:** card background, 1px `--hair` border, `--soft` label with a mono count; ≥44px target.
- **State:** selected = marine fill + card text. Zero-count options are `disabled` and greyed,
  **never removed** — removing them makes the list jump and destroys spatial memory.

### Segmented controls
- Bordered inline group, one press-selected cell in marine (AM/PM mood, List/Map view, the
  course strip). Same idiom everywhere so the pattern is learned once.

### Inputs / Fields
- **Style:** card background, 1px `--hair` border, mono text, ≥44px tall, square.
- **Focus:** border shifts to `--rule`; the shared focus outline applies. No glow.

### Rows (signature component)
- The result unit. Three tiers only — name (title) / `Cuisine · $$$ · Hood · N dishes` (mono
  meta) / a course-aware teaser — with the flamingo price chip and availability on the right and
  a bookmark pin in a fixed left gutter. The whole row is the disclosure control (a huge Fitts
  target); expanding reveals the day×meal grid, one hero image, the "dish to order" line, the
  course ladder, and the actions. Rows are separated by a single `--hair` bottom border.

### Day×Meal availability grid (signature component)
- A compact `<table>`: Mon–Sun columns × meal rows, a filled marine cell where that meal is served
  that day, hollow (hairline) where not. Reuses the disable-not-remove vocabulary; collapses to a
  `dayRange()` summary on mobile. Never a control — a data display.

## Do's and Don'ts

### Do:
- **Do** route every colour through a `var()`; raw hex outside `app.css` is a lint finding.
- **Do** express depth with the zero-blur eyebrow (`6px 6px 0`) and tonal steps between surfaces.
- **Do** keep results as rows at ~104px, ≥5 per 900px viewport; move secondary actions into the
  expanded panel.
- **Do** reserve `--flamingo` for price and let a single saturated object anchor each screen.
- **Do** keep uppercase to the two roles (`.micro`, wordmark) and type to the five sizes.
- **Do** disable-and-grey zero-count options; never remove them.
- **Do** meet the enforced floors: 11px min type, 44px min target, 7:1 small-text, 3:1 UI
  boundary — in *both* themes.

### Don't:
- **Don't** use blur, glow, gradients, glassmorphism, or a radial "aurora" background — every one
  is a catalogued AI-slop tell and a `design-lint.mjs` failure.
- **Don't** put neon on the field: the Vice hues are signage over a pale/dark wall, never the wall.
- **Don't** round corners, add a third uppercase role, or introduce a sixth type size.
- **Don't** use `--flamingo` for anything but price, or a second isolated accent that dilutes it.
- **Don't** reach for a card grid, Space Grotesk / Inter / Instrument Serif, or pure `#000`/`#fff`.
- **Don't** work around a lint rule — if you disagree with it, edit the rule and say why.
