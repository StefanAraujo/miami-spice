# Visual revamp — "Apple-polished, Deco-at-night Miami Vice"

**Date:** 2026-08-01
**Brief:** tear the visual system apart into an 80s-Miami-Vice, Apple-grade website — dramatic,
cinematic, beautiful — *without a single AI-slop tell*. This document proposes; it changes no code.
Read alongside [DESIGN_REVIEW.md](DESIGN_REVIEW.md) (the anti-slop standard), [VICE_DIRECTION.md](VICE_DIRECTION.md)
(how to do Vice tastefully), [CLAUDE.md](CLAUDE.md) and [app/design-lint.mjs](app/design-lint.mjs) (the floors).

Everything below is designed to keep `node app/design-lint.mjs` at **0 critical, 0 slop tells** and
`node app/verify.mjs` green. Where I add a token or a step, the lint reason it survives is stated inline.

---

## 1. The concept, in one paragraph

**Apple-polished, Deco-at-night Miami Vice.** Take the restraint Apple is actually famous for —
one type family, a near-neutral field, colour reserved for meaning, generous vertical rhythm, and
motion used only at hinge moments — and point it at Miami's *real* material world rather than the
synthwave poster. The field is the City of Miami Beach's own regulated near-white by day and a deep
marine-black by night; structure is drawn in marine/cyan; saturation is a signage budget — one
flamingo/pink chip for price and nothing else, on ≤5% of pixels, always hard-edged, never blurred.
The drama is architectural, not luminous: knife-edge Deco "eyebrow" shadows (zero blur), a cinematic
masthead that collapses on scroll like an Apple pinned section, and a density-first result ladder that
stays scannable at 8+ items per viewport. The look is *subtractive* — Michael Mann's "no earth tones,
no red" ban list is the same discipline that keeps the page off every slop list. Cinematic by rhythm
and contrast, not by glow.

---

## 2. Palette — two themes, one system

Both themes reuse the tokens already **measured and shipped** in [app/src/app.css](app/src/app.css)
(AM verified in `verify.mjs` at worst pair 6.27:1; PM measured in `VICE_DIRECTION.md`). The revamp does
not invent hues from zero — it promotes the existing marine + flamingo + Vice-cyan into a single
role-based system where *the hue's job is fixed and only its luminance flips with the theme*. That one
rule is what keeps "cyan on dark" from ever becoming the [Impeccable](https://impeccable.style/slop/)
tell: cyan is **structure on a hairline, never the field, never behind text**.

Role legend: `field / raised / sunk` = surfaces; `ink / soft` = text; `rule / hair` = boundaries;
`marine` = structure & interactive; `signal` = secondary interactive (the toned Vice-cyan);
`flamingo` = **price only**.

### Light — "Ocean Drive · AM" (refined Tropical Deco)

| Token | Hex | Approx. contrast | Role |
|---|---|---|---|
| `--field` | `#E9E6DE` | — | paper (SW Heron Plume family) |
| `--raised` | `#F5F3ED` | — | card / row surface |
| `--sunk` | `#E2DED4` | — | wells, inputs |
| `--ink` | `#161A19` | **15.8:1** on field · 8.0:1 on raised | body text |
| `--soft` | `#464B47` | **~7.1:1** on raised | metadata (clears Apple's 7:1) |
| `--rule` | `#8E887E` | **3.1:1** on raised | UI boundary (WCAG 1.4.11) |
| `--hair` | `#CFCABE` | ~1.6:1 | decorative hairline only |
| `--marine` | `#12414C` | **8.9:1** on field | structure, links, active state |
| `--signal` | `#0C5460` | **~7.0:1** on field | secondary interactive (toned Vice-cyan, deepened for light) |
| `--flamingo` | `#9C1E45` | **6.3:1** on field | **price only** (large/500 wt, clears AA) |

The only new token is `--signal`: the *same* cyan hue as PM, dropped in luminance until it clears 7:1
on near-white. It carries any second interactive affordance (selected facet, focus companion) so marine
and flamingo keep their single jobs. It is a deep teal in daylight — no acid, no glow.

### Dark — "Chrome Night · PM" (Deco-at-night, already measured)

| Token | Hex | Approx. contrast | Role |
|---|---|---|---|
| `--field` | `#0E1A1F` | — | deep marine-black (**not** `#000`) |
| `--raised` | `#16262C` | — | card / row surface |
| `--sunk` | `#0A1418` | — | wells |
| `--ink` | `#F2F4EE` | **15.98:1** | body text |
| `--soft` | `#9FB0AC` | **7.82:1** | metadata (clears Apple 7:1) |
| `--rule` | `#6F827E` | **4.36:1** | UI boundary (>3:1) |
| `--hair` | `#26363B` | ~1.5:1 | decorative hairline only |
| `--marine` / `--signal` | `#7FE3EF` | **11.92:1** | structure (the Vice cyan, toned — large & hairline only) |
| `--flamingo` | `#FF6FAE` | **6.86:1** | **price only** (19px/500, past the large-text bar) |

Slop-safety of the dark theme, restated so it is not lost in a refactor: the neon hues touch **≤5% of
pixels** (price chip, one structural hairline), never fill the field, never sit behind body text, and
never blur. That is Miami's actual light budget — signage over a pale wall, not a neon sky
([City of Miami Beach pre-approved paint palette](https://www.miamibeachfl.gov/wp-content/uploads/2022/12/Pre-Approved-Paint-Pallet-for-Body-and-Trim.pdf);
[MDPL — What is Art Deco](https://mdpl.org/about-us/about-miami-design-styles/what-is-art-deco/)). No
`#000`/`#fff` anywhere (SLOP-05). Depth token stays `--eyebrow: 6px 6px 0` at low alpha, cyan-tinted in
PM (SLOP-03 keys on blur radius; zero blur is the Deco eyebrow, not a halo).

**Default is AM.** PM is the toggle, matching the shipped theme and the light-basemap requirement noted
for the Phase 2 map in [CLAUDE.md](CLAUDE.md).

---

## 3. Type — one workhorse, one Deco cameo

Apple's own guidance is the argument for restraint here: *"lean into a single font family… establish
hierarchy through weight, size, and whitespace, not embellishment"*
([HIG — Typography](https://developers.apple.com/design/human-interface-guidelines/foundations/typography/)).

**Keep Jost as the workhorse** for all UI and body. It is the Futura lineage (1927) — the same geometric
Deco DNA as the *Miami Vice* Broadway logotype — self-hosted via `@fontsource`, and on **no** banned list
in `design-lint.mjs`. It already does everything SF Pro does for Apple: continuous weights, tight
geometric caps for the wordmark, humane lowercase for rows. **Keep IBM Plex Mono** for tabular data
(prices, day tokens) — tabular figures are load-bearing for a comparison list.

**Add exactly one display face, for hero moments only: [Poiret One](https://fonts.google.com/specimen/Poiret%2BOne).**
A geometric Art-Deco display (Denis Masharov, SIL OFL, self-hostable via `@fontsource`) named for couturier
Paul Poiret — thin, high-geometry, unmistakably 1920s Miami-Beach signage, and *not* a costume face at
large sizes. It is the tasteful, web-safe stand-in for Broadway that VICE_DIRECTION.md flagged as the one
place a literal Vice quote is safe. Use it **only** in the masthead wordmark and the hero section number —
nowhere in running text, so it never reads as decoration. (Alternate if Poiret feels too light against the
dark theme: [Limelight](https://fonts.google.com/specimen/Limelight), a heavier high-contrast Deco sans,
same license.) Neither is on the SLOP-04 list.

### Scale — five deliberate steps, all ≥1.25×

Apple product pages get their cinema from a *big* jump between hero and body, not from many small steps.
Adding one display step buys that drama while staying inside SPEC-05.

| Step | px | Ratio to prev | Use |
|---|---|---|---|
| `--t-meta` | 12 | — | micro labels, mono day tokens |
| `--t-body` | 15 | 1.25× | row body, filters |
| `--t-name` | 19 | 1.27× | restaurant name |
| `--t-section` | 30 | 1.58× | section heads, detail title |
| `--t-display` | `clamp(2.75rem, 7vw, 3.5rem)` (44→56) | ≥1.46× | masthead wordmark, hero number |

Every adjacent pair is ≥1.25× (SPEC-05 wants ≥1.15×, flags 3+ tight pairs — this has zero). Smallest text
is 12px, above the 11px floor. Uppercase stays in its **two** shipped roles only — `.micro` and the
wordmark — so SLOP-08 does not fire.

---

## 4. Components & layout

The spine of the change is Apple's section rhythm — full-width acts separated by generous whitespace,
each doing one job — wrapped around a directory core that never sacrifices density.

### Masthead / hero (the cinematic act)
A tall opening act (~60vh, not a full takeover — the list must be reachable in one scroll). Poiret-One
wordmark at `--t-display`, three racing hairlines beneath it (rule of three, shipped motif), one line of
mono context ("380 restaurants · 7,000 dishes · Aug–Sep"). A single hard **horizon eyebrow** — a full-bleed
`6px 6px 0` slab under the masthead acting as a Deco sunshade line — is the only "graphic." No hero image,
no gradient, no glow. On scroll the masthead **collapses into the sticky filter bar** (see Motion) — the
one Apple pinned-section move, done with a single honest transform.

### Result list — **rows, not cards. Non-negotiable.**
[NN/g](https://www.nngroup.com/articles/cards-component/) names four cases where cards are the wrong
component and a 380-item directory is all four: search, comparison, homogeneous content, density. Cards
would also *fail* SPEC-07 (density) — the current 104px rows already give **8.5 items / 900px**; cards land
near 4.5. Keep the shipped three-tier row (name / `Italian · $$$ · Brickell` / price), refined:
- Price rendered as a **signage chip** — flamingo/pink, mono tabular, hard `6px 6px 0` offset — the one
  saturated element per row (the "one accessory," Chanel's rule from DESIGN_REVIEW.md §6).
- Actions (Book on OpenTable, Directions, Details) stay in the **expanded panel**, which is what buys the
  density and keeps every control ≥44px (SPEC-04). Row stays 104px collapsed.
- Facet counts inline, zero-result options **greyed not removed** (Baymard; preserves spatial memory).

### Detail view — the row's second act
Expanding a row reveals the **course ladder** (Appetizer / Entrée / Dessert) as a stepped list divided by
terrazzo-fine hairlines, prices in mono aligned on the tabular column. Title in `--t-section` Jost. This is
where the editorial-chapter feel from Awwwards-winning directory work lands
([Dishoom benchmark](https://mobbin.com/explore/sites/categories/restaurant-website-design)) — but inline,
not on a separate page, so scannability is never lost.

### Filters — quiet architecture
Left rail (desktop) / drawer (mobile) of `FacetGroup`s. Selected facet uses `--marine` fill; the secondary
`--signal` teal marks the *counted* self-excluded facet so the two never collide. Generous 24/32px section
gaps (Apple whitespace grouping). Every pill ≥44px hit area, 12px min ink. Sticky bar carries
`scroll-margin-top` (WCAG 2.4.11, SPEC-12).

---

## 5. Motion — cinematic by timing, not by light

Apple's rule: *"motion built around hierarchy… visuals carry the cinematic load only at key moments; most
teams overuse motion because they mistake activity for engagement"*
([Brad Holmes on Apple scroll motion](https://www.brad-holmes.co.uk/web-performance-ux/why-most-scroll-animations-miss-what-apple-gets-right/);
[Builder.io — CSS view-timeline](https://www.builder.io/blog/view-timeline)). Every motion below is named
(never `transition: all`, SLOP-06), carries information, and is nulled under `prefers-reduced-motion`
(SPEC-11, already in `app.css`).

- **Masthead collapse:** as the list scrolls up, the hero condenses to the sticky bar — a single
  `transform: translateY` + `height` on a pinned container, driven by `view-timeline` where supported,
  `IntersectionObserver` fallback. No parallax, no blur, no opacity haze.
- **Row expand:** height auto-animates open (200–240ms, custom cubic-bezier ease-out); the course ladder's
  hairlines draw in as a stepped `clip-path` wipe — an architectural reveal, not a shimmer.
- **Price chip settle:** on filter change, tabular price figures snap into their column with a 120ms
  fade — reinforces the comparison the tabular figures exist for.
- **Theme toggle:** a 200ms token cross-dissolve (opacity only). **Banned:** glow sweeps, shimmer, hover
  `scale()` (SLOP-06), any coloured-blur transition.

---

## 6. Three signature moments (memorable, zero slop tells)

1. **Sundown toggle.** The AM/PM switch is the app's hero interaction — a hard, confident cross-cut from
   near-white day to marine night. The three racing hairlines flip from solid marine to the Vice
   cyan/flamingo **two-tone** (line, never fill); the price chips' eyebrow shadow re-tints cyan. It reads
   as a Miami sundown without a single gradient — the whole recolour is token-swap + 200ms opacity, honest
   under reduced-motion. This is the reference's one genuinely good idea
   ([Project Vice AM/PM](https://dewanism.com/project-vice/)) rebuilt on the restrained side.

2. **The horizon eyebrow.** One full-bleed `6px 6px 0` zero-blur slab under the masthead — a literal Deco
   sunshade / Ocean Drive horizon line. It is the app's signature graphic and it is *drawn architecture,
   not decoration*: it collapses into the sticky filter rule on scroll, so the same line that opens the
   page becomes the boundary that organizes it. Hard sun, the exact opposite of the aurora-blob hero the
   lint rates Critical (SLOP-02).

3. **The signage price chip.** Price is the one saturated object on the page — flamingo by day, hot-pink by
   night — set in mono tabular figures on a chip with a hard offset shadow, like a hand-painted Deco sign
   plate. It is the "one accessory" the rest of the design is quiet around, and because it is the *only*
   place either accent hue appears at fill, it passes the Removal test: take it off and the page goes fully
   monochrome-marine. That is the proof the colour means something.

---

## What this is not (guardrails for the build)

No `background-clip:text` gradient, no radial-gradient/aurora, no blurred coloured shadow, no glassmorphism,
no `#000`/`#fff`, no banned font, no third uppercase role, no card grid for results. Every one of those is a
line item the lint fails on — and, per DESIGN_REVIEW.md, every one is also the exact thing that makes a
"Miami Vice" site read as machine-made. The dramatic version and the lint-clean version are the same target.

**Suggested next step:** build `app/specimen/vice-revamp.html` with these tokens, the five-step scale, and
the Poiret-One wordmark, then run it through `design-lint.mjs` before any app code changes — the same way
Tropical Deco was proven.

---

## Sources

**Apple / design language:**
[Apple HIG — Typography](https://developers.apple.com/design/human-interface-guidelines/foundations/typography/) ·
[Apple HIG — Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) ·
[Apple HIG — Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons) ·
[Why most scroll animations miss what Apple gets right — Brad Holmes](https://www.brad-holmes.co.uk/web-performance-ux/why-most-scroll-animations-miss-what-apple-gets-right/) ·
[Apple-style scroll with CSS view-timeline — Builder.io](https://www.builder.io/blog/view-timeline)

**Type:**
[Poiret One — Google Fonts (SIL OFL)](https://fonts.google.com/specimen/Poiret%2BOne) ·
[Limelight — Google Fonts (SIL OFL)](https://fonts.google.com/specimen/Limelight) ·
[Art Deco fonts overview — Made Good Designs](https://madegooddesigns.com/art-deco-fonts/)

**Directory / restaurant UX:**
[NN/g — Cards: UI-Component Definition](https://www.nngroup.com/articles/cards-component/) ·
[Baymard — Product List & Filtering 2025](https://baymard.com/blog/current-state-product-list-and-filtering) ·
[Mobbin — restaurant website design](https://mobbin.com/explore/sites/categories/restaurant-website-design) ·
[Framer — restaurant website examples](https://www.framer.com/blog/restaurant-website-design-examples/)

**Miami / Vice / anti-slop:**
[City of Miami Beach — Pre-Approved Paint Palette (PDF)](https://www.miamibeachfl.gov/wp-content/uploads/2022/12/Pre-Approved-Paint-Pallet-for-Body-and-Trim.pdf) ·
[MDPL — What is Art Deco](https://mdpl.org/about-us/about-miami-design-styles/what-is-art-deco/) ·
[Impeccable slop catalog — Bakaus](https://impeccable.style/slop/) ·
[Project Vice — Christopher Dewan](https://dewanism.com/project-vice/) ·
plus all sources collected in [DESIGN_REVIEW.md](DESIGN_REVIEW.md) and [VICE_DIRECTION.md](VICE_DIRECTION.md).
