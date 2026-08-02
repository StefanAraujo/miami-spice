# Design review — Miami Spice, August 2026

**Brief:** review everything built so far and stop it from looking AI-generated.

**Verdict at review time: it read as AI-generated.** 4 critical, 5 major, 5 minor findings;
5 independent slop tells — above the "high" threshold in the only published dataset on this.

**Verdict after the rebuild (2026-08-02): clean.** 0 critical, 0 major, 0 minor, 0 slop tells,
8.5 results per 900px viewport. Direction B was adopted in full.

Run `node app/design-lint.mjs` to reproduce every number below. The findings are kept as a
record of what was wrong and why — the lint is what keeps it fixed.

---

## 1. The uncomfortable headline

The dark + neon theme I built two days ago is not a Miami Vice interpretation.
**It is the current default output of AI design tools, and it's documented as such.**

Anthropic's own `frontend-design` skill lists the failure modes its models fall into,
and names three clusters. Cluster two is verbatim: *"a near-black background with a
single bright acid-green or vermilion accent."* Paul Bakaus' Impeccable catalog is
blunter — *"Purple/violet gradients and **cyan-on-dark** are the most recognizable
tells of AI-generated UIs"* — and its specimen page for that rule is captioned
*"Neon on dark — Cyberpunk-by-default slop."*

Then the individual moves, each independently catalogued:

| What I built | What the literature calls it |
|---|---|
| Gradient-filled "Spice" in the wordmark | Hallmark: *"Signals 'AI generated' faster than almost anything else."* |
| Two radial glows behind the masthead | Hallmark rates the aurora/blob hero **Critical**; Impeccable has two separate rules for it |
| Space Grotesk | Impeccable lists it beside Inter, Geist and Instrument Serif as an AI-default face |
| `--r-pill` on nearly every control | Impeccable: *"rounds everything into the same soft blob"* |
| `.micro` uppercase labels on 21% of text | Hallmark: *"The page becomes a list of labelled lists"* |

Krebs scanned 1,590 Show HN landing pages with deterministic CSS checks and tiered them:
0–1 tells = low, 2–3 = medium, **4+ = high**. We score 5.

**The deeper failure, which matters more than the tell list.** Hallmark's best line is
about genre-blindness: *"When the nav can't tell you what kind of site you're on, the page
is templated."* Apply it here — swap the restaurant data for a crypto dashboard or a
developer tool and this design still "works." That is the diagnosis. A palette that fits
any subject isn't a palette, it's a reflex.

And to be fair to the empirical record: a blind n=92 study (Romero et al., 2026) found
**no usability penalty** for AI-generated interfaces. The deficit is confined to
originality — one prototype scored −1.0 on "Conventional/Inventive." So this is precisely
an aesthetic-conventionality problem, not a quality problem. The app works. It just looks
like everything else.

---

## 2. Measured findings

Everything here comes out of `design-lint.mjs`, which combines slop detectors with numeric
floors from Apple's HIG and WCAG 2.2. Where the two disagree it takes the stricter: WCAG
for contrast (Apple grants bold-at-any-size 3:1, which is not AA conformant), Apple for
target size (44pt beats WCAG AA's 24px).

### Critical

**C1 · Gradient text is both a tell and an accessibility failure.**
The lint caught the wordmark twice — once as `SLOP/gradient-text`, once as
`SPEC/contrast-fail` at **1.08:1**. `background-clip: text` requires `color: transparent`,
so the computed contrast is nil, and it collapses entirely under forced-colors mode.
→ Solid ink. Emphasis via weight or a drawn rule.

**C2 · Two decorative radial gradients behind content.** Pure decoration, zero information.
→ Delete. Miami's actual light is knife-edge sun; the Deco device for depth is a
hard-edged offset shadow (an "eyebrow" sunshade), not bloom.

**C3 · 175 controls below WCAG 2.5.8's 24×24px floor.**
All the card action links — *Book on OpenTable*, *Directions*, *Details* — are 16px tall.
→ Give them real hit areas, or move them into the expanded panel.

**C4 · Reflow.** Clean at 320px now, but only because the last pass caught the sort
control. It's asserted in the lint so it stays fixed.

### Major

**M1 · 514 elements below 11px.** Smallest is **9.6px**. Apple's iOS floor is 11pt and
they ship nothing smaller anywhere on the platform — Caption 2 at xSmall Dynamic Type is
exactly 11pt. Our `.micro` class is 10px, and `.frac`/`.row-when` go to 9.6px.
→ 11px minimum, full stop.

**M2 · 107 controls below Apple's 44×44pt.** Day buttons are 30×30, facet pills 26px tall,
the expand button 27px. Apple's Buttons page: *"a button needs a hit region of at least
44×44 pt."*
→ Pad the hit area; the ink can stay small.

**M3 · Flat type scale.** Nine distinct sizes — `9.6, 10, 10.6, 10.9, 16, 16.8, 21.1,
21.6, 64` — with four adjacent pairs under 1.15×. Four sizes clustered around 10px is not
hierarchy, it's noise.
→ Four or five deliberate steps at ≥1.25×. The specimen uses 12 / 15 / 19 / 44.

**M4 · Density: 4.5 result items per 900px viewport** (199px rows).
NN/g lists four cases where cards are the wrong component and this app hits all four:
search contexts, comparison tasks, homogeneous content, and information density. Their
words: *"A standard vertical list view is more scannable than cards because the positioning
of the individual elements is fixed in size and more predictable for the eye."*
Google Maps rows are 110–130px; Google Flights are 76–96px.
→ Rows with rules, not cards. The specimen gets to **104px / 8.7 per viewport**.

**M5 · Space Grotesk.** On every AI-default font list.
→ Jost — the Futura lineage (1927), period-correct for Deco and still contemporary.

### Minor

- 375 small-text elements sit between WCAG AA and Apple's 7:1 dark-mode target
  (*"strive for 7:1, especially in small text"*).
- `backdrop-filter` with no `prefers-reduced-transparency` fallback.
- No `prefers-contrast: more` block.
- Sticky bar at `top: 0` with no `scroll-margin-top` on focusable content — WCAG 2.4.11,
  the classic sticky-header failure.
- Pure `#000` present in a shadow.

---

## 3. Two data defects the design exposed

Both fixed in `prepare_data.py`, both invisible until real content was set in a real layout.

**31% of dish names arrived in ALL CAPS** (2,208 of 7,063) because each restaurant types
into the CMS however it likes. Half the ladders shouted, half didn't. Now normalized with
title-casing that respects Italian and Spanish particles — `ZUPPA DEL GIORNO` renders as
*Zuppa del Giorno*, `GNOCCHI ALLA SORRENTINA` as *Gnocchi alla Sorrentina*. Restaurant
names are deliberately untouched: AVIV and KOKO are brand capitals, not shouting.

**~45 instruction lines were being served as dishes** ("Choose one of the following").
Stripped earlier in the same pass.

---

## 4. Where the Miami research actually points

The most useful finding is that the Vice/Deco cliché and the AI-slop cliché are *the same
three moves* — neon glow, sunset gradient, palm silhouette. Avoiding one avoids the other.
The archive says something different from the Instagram version:

**The pastel is the paper, not the ink.** The City of Miami Beach publishes a pre-approved
paint palette for the historic district. Body colours are ~250 **near-white, very
low-chroma tints** — Heron Plume, Snowfall, Sea Salt, Ice Cube. Trim is restricted to
**greys and whites only**. The district as actually built and actually regulated is a
near-neutral field; saturation lives only in signage, neon tubing, awnings and terrazzo —
a tiny fraction of visual area. Almost every "Miami" website inverts this, which is exactly
why they look cheap.

**The pastel is also a 1980 invention.** The buildings were white. Leonard Horowitz
repainted Friedman's Bakery in 1980; *Miami Vice* then asked owners to repaint and filmed
the result. The Miami everyone remembers is a five-year-old paint job.

**Vice's rule was subtractive.** Costume designer Jodie Tillen: *"We had a color palette:
no earth tones, no primary, all pastel."* Mann's version: *"No earth tones, no red."*
Director Bobby Roth on how far it went: *"If the script says 'A Mercedes pulls up here'…
You will not get a red or brown one."* Mann on the ceiling: *"if you let it get too loud,
then it was just … kind of gross."* The look is a **ban list**, not an addition.

**Corroboration from the two best contemporary references.** I read both stylesheets.
Poolsuite — the most successful 80s-Miami project on the web — contains **no neon and no
sunset gradient**: cream `#f9efe4`, dusty pink `#f6d6d5`, sage-aqua `#9ecec7`, one red
`#fb5858`. And the Wolfsonian, the world's leading museum of Art Deco, uses **contemporary
neutral typefaces** on its site. Expertise in an era produces restraint, not imitation.

**The formal grammar that does translate** (Miami Design Preservation League's own list):
eyebrows, racing stripes, ziggurat parapets, portholes, glass block, terrazzo, symmetry,
and *"elements in groups of three."* These are 2D-portable in a way that glow is not.

---

## 5. Direction B — the specimen

**Adopted 2026-08-02.** `app/specimen/specimen.html` (built by
`node specimen/build-specimen.mjs`) was the proving ground; the app itself now implements it.
The specimen is kept as the reference sheet for the direction.

| | Current (Vice noir) | Specimen (Tropical Deco) |
|---|---|---|
| Row height | 199px | **104px** |
| Items per 900px viewport | 4.5 | **8.7** |
| Type steps | 9 sizes, 4 pairs <1.15× | 4 steps, all ≥1.25× |
| Smallest text | 9.6px | 11px |
| Smallest target | 16px | 44px |
| Slop tells | 5 | 0 |

Shipped app after the rebuild: **104px rows, 8.5 per viewport, 0 tells, all lint checks green.**

What carries "Miami" without a single cliché:

- **Field** from the city's own approved palette — `#E9E6DE` paper, `#F5F3ED` raised.
- **Structure** in marine `#12414C`; **one accent**, flamingo `#9C1E45`, used for price
  and nothing else. Chosen by Mann's exclusion rule: no earth tones, no red, no primaries.
- **Racing stripes** under the wordmark — three hairlines, the rule of three.
- **Depth is an eyebrow**: `box-shadow: 6px 6px 0` — zero blur. Hard sun, never bloom.
- **Jost** for everything, IBM Plex Mono for data. No Deco display face, deliberately.
- **Rows, not cards.** Three tiers and no more: name / `Italian · $$$ · Brickell` / price.
  Actions move into the expanded panel, which is what buys the density.
- Facet counts on every option, with zero-result options greyed rather than removed —
  Baymard calls live counts *"one of the single highest-impact improvements."*

Every colour pair clears AA; metadata clears Apple's 7:1.

---

## 6. The repeatable method

Three artifacts, in increasing order of usefulness:

**`app/design-lint.mjs`** — run it. Deterministic, no LLM judgment, exits non-zero on
criticals. Two rule families: `SLOP/*` (the catalogued tells) and `SPEC/*` (Apple + WCAG
numeric floors). Add it to the same habit as `verify.mjs`.

**The three questions**, for anything the lint can't measure:

1. **Genre test.** Swap the content for a different product. Does the design still "work"?
   If yes, it's a template.
2. **Subject test.** Does each choice trace to *this* subject's own world — its materials,
   artifacts, vernacular — or to a design trend?
3. **Removal test.** Chanel's rule, quoted in Anthropic's own skill: before leaving the
   house, take one accessory off. Name the one signature element and make everything else
   quiet.

**Know that the tells move.** Purple gradient + glassmorphism + Inter is the 2022–24
fingerprint. Cream + Instrument Serif + terracotta, broadsheet layouts with `01 —`
eyebrows, and near-black + acid accent are the **2025–26** fingerprint. A review written
against last year's list will praise this year's slop. Direction B is not immune — it sits
near the "editorial restraint" cluster — which is why the lint is the durable artifact and
this document is the perishable one. Re-read the tell list before the next big visual pass.

---

## Sources

Design criticism: [Krebs, *Scoring Show HN submissions for AI design patterns*](https://www.adriankrebs.ch/blog/design-slop/) ·
[Bakaus, *Impeccable* slop catalog](https://impeccable.style/slop/) ·
[Nutlope/Hallmark anti-patterns](https://github.com/Nutlope/hallmark/blob/main/skills/hallmark/references/anti-patterns.md) ·
[Anthropic frontend-design skill](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md) ·
[Romero et al., *Usable but Conventional*](https://arxiv.org/html/2605.15124)

Guidelines: [Apple HIG — Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) ·
[Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons) ·
[Typography](https://developer.apple.com/design/human-interface-guidelines/typography) ·
[Dark Mode](https://developer.apple.com/design/human-interface-guidelines/dark-mode) ·
[Lists and tables](https://developer.apple.com/design/human-interface-guidelines/lists-and-tables) ·
[WCAG 2.2](https://www.w3.org/TR/WCAG22/)

Directory UX: [NN/g — Cards: UI-Component Definition](https://www.nngroup.com/articles/cards-component/) ·
[NN/g — Layer-Cake Scanning](https://www.nngroup.com/articles/layer-cake-pattern-scanning/) ·
[Baymard — Product List UX 2025](https://baymard.com/blog/current-state-product-list-and-filtering) ·
[Baymard — Applied Filters](https://baymard.com/blog/how-to-design-applied-filters) ·
[Carbon — Data table density](https://carbondesignsystem.com/components/data-table/style/)

Miami: [City of Miami Beach — Pre-Approved Paint Palette (PDF)](https://www.miamibeachfl.gov/wp-content/uploads/2022/12/Pre-Approved-Paint-Pallet-for-Body-and-Trim.pdf) ·
[MDPL — What is Art Deco](https://mdpl.org/about-us/about-miami-design-styles/what-is-art-deco/) ·
[MDPL — The Colors of Leonard Horowitz's Life](https://mdpl.org/archives/2021/07/the-colors-of-leonard-horowitzs-life/) ·
[Television Academy — Miami Vice at 40: An Oral History](https://www.televisionacademy.com/features/emmy-magazine/articles/miami-vice-oral-history) ·
[THR — Mann and the costume designers](https://www.hollywoodreporter.com/lifestyle/style/miami-vice-michael-mann-costume-designers-interview-menswear-1235961920/) ·
[Letterform Archive — Art Deco](https://letterformarchive.org/art-deco/) ·
[Brett Maurer — HEAT Vice](https://www.brettmaurer.com/heatvice) ·
[Poolsuite](https://poolsuite.net) · [The Wolfsonian–FIU](https://www.wolfsonian.org)
