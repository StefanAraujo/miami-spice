---
target: app/src/App.svelte
total_score: 32
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 1
timestamp: 2026-08-02T20-29-33Z
slug: app-src-app-svelte
---
Method: dual-agent (A: design review · B: detector evidence)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Strong live counts/aria-live/share confirmation — but the primary CTA's state is lost on hover (P1 bug). |
| 2 | Match System / Real World | 4 | Mood/occasion/timing + availability copy map exactly to how people pick a night out. |
| 3 | User Control and Freedom | 3 | Chips, relaxations, disable-not-remove — but no persistent Home; wordmark isn't clickable. |
| 4 | Consistency and Standards | 3 | Segmented-control idiom reused well; undercut by two price languages ($$$$ tier vs numeric chip). |
| 5 | Error Prevention | 3 | No dead ends; but the empty flamingo "—" chip reads as breakage. |
| 6 | Recognition Rather Than Recall | 3 | Counts/chips/teasers reduce recall; day-grid `M T W T F S S` forces recall of which T / which S. |
| 7 | Flexibility and Efficiency | 3 | Presets, "Pick for us," sort — but filter state isn't in the URL (only `?picks`). |
| 8 | Aesthetic and Minimalist Design | 4 | Restraint is the identity, executed with discipline; corroborated clean by both detectors. |
| 9 | Error Recovery | 4 | Empty state names the conflict and offers "Drop cuisine (28)" fixes. Textbook. |
| 10 | Help and Documentation | 2 | No first-run orientation, no legend for the day×meal grid, opaque AM/PM + mood, disclaimer only in footer. |
| **Total** | | **32/40** | **Good (upper band)** |

## Design Specificity Verdict

**LLM assessment (A):** Authored for this product, decisively — not category-interchangeable. The day×meal availability grid and the course ladder's choose-fractions exist because *this* decision needs them; the copy is written for the scene ("Open tonight · Sunday," "The dish to order"). You could not swap this onto a SaaS dashboard. The one interchangeable-feeling moment is the Discovery home's ~40-tile wall.

**Deterministic scan (B):** The Impeccable mechanical detector returns **0 findings** across `App.svelte` + all 7 components (exit 0), and was proven to fire on a known-bad input (a positive-control `background-clip:text` gradient), so the clean result is a true clean. It correctly does **not** false-positive on the zero-blur eyebrow shadow or the hairline stripe. The project's own `design-lint.mjs` independently agrees: 0 critical / 0 major / 0 minor, 0 slop tells, density 8.5.

**Where they meet:** the detector's clean sweep *corroborates* the human "Aesthetic & Minimalist = 4" — the anti-slop identity is verified, not asserted. Crucially, **every real issue A found is invisible to a mechanical scan** (a hover bug, IA overload, a data-display gap, missing headings). That's the whole point of the dual pass: B proves the surface is slop-free; A finds the functional defects a detector can't see. No false positives to discount.

**Visual overlays:** none — Assessment B reported browser-overlay fallback (no automation), so no user-visible overlay was injected.

## Overall Impression

This is a genuinely well-authored Operate surface with a real point of view — and its flaws are **concentrated, not diffuse**. Heuristics 2, 8, 9 are excellent; the expanded row is a legitimately delightful decision surface. But two things undercut it at the exact moments that matter most: the **primary "Book" action goes invisible on hover** (desktop), and the **front door overloads the tired, social group it's built for** while burying the one antidote ("Pick one for us") at the very bottom. Fix those two and this jumps a band.

## What's Working

1. **The day×meal grid + course ladder** — a real `<table>` with per-cell aria-labels and "1 of 4" choose-fractions answer the two questions the official site hides (open that night? how much choice?). The defensible core, built honestly.
2. **Rows-not-cards with whole-row disclosure + a fixed pin gutter** — every name on one x-coordinate, the whole row is the Fitts target, the bookmark is a separate button (no nested buttons). Textbook scannability for 380 items.
3. **Interdependent live counts + disable-not-remove + empty-state relaxations** — self-excluding facet counts, zero options grey instead of vanishing, and dead ends become "Drop neighborhood (28)."

## Priority Issues

**[P1] "Book on OpenTable" label disappears on hover (both themes).** `.actions .cta` computes `color` = its own marine background on hover, because `.actions a:hover { color: var(--marine) }` (specificity 0,3,1) beats `.actions .cta` (0,3,0) with no `.cta:hover` override; PM repeats it cyan-on-cyan.
*Why it matters:* the single most important conversion action goes invisible the instant a desktop user reaches to click it — and it hid from mobile testing because touch has no hover.
*Fix:* add `.actions .cta:hover { color: var(--card) }`; carry hover feedback in the shadow/bg, not the text colour.
*Suggested command: harden*

**[P2] The Discovery home overloads the exact audience it's for.** Six lanes / ~40 tiles, with "Pick one for us" (the tired-group primitive) as the *last* element. 4 of 8 cognitive-load checks fail, all on this screen.
*Why it matters:* the stated user is a group deciding mid-conversation on a phone — peak deferral — and the front door maximizes choices when they can least handle them; the antidote arrives after the overwhelm.
*Fix:* lead with a "Tonight's pick"/"Open tonight" decisive row above the lanes; cap default tiles (~5 + "more"); consider folding city+neighborhood into one "By location" lane.
*Suggested command: layout*

**[P3] Empty flamingo price chip "—".** ~1 of 43 visible rows shows a saturated pink chip containing only an em-dash, no "when" line.
*Why it matters:* the design's one rule is flamingo = price and one saturated object per row; spending it on nothing makes a data gap look like a bug and dilutes the accent.
*Fix:* suppress the chip when `min_price == null` (quiet "Menu only" in mono, or nothing).
*Suggested command: polish*

**[P3] No heading in results/shortlist/pick views; wordmark isn't a home affordance.** `main` has zero headings outside Discover; the `<h1>` wordmark isn't a link.
*Why it matters:* screen-reader users get no landmark to reach results (only an aria-live count), and no one has a persistent way back to the front door.
*Fix:* add a visible-or-`sr-only` `<h2>` per view; make the wordmark reset to Discover.
*Suggested command: clarify*

**[P3] Two price languages + ambiguous day letters.** Row meta shows `$$$$` tier beside the numeric prix-fixe chip; grid header reads `M T W T F S S`.
*Fix:* drop `$$$$` from the row (or move to the panel); use two-letter day headers (Mo/Tu/We…).
*Suggested command: clarify*

## Persona Red Flags

**Alex (power user):** hits the invisible-CTA every booking; can't bookmark/share a filtered view (only `?picks` is serialized, never the query `f`); picking "Price low to high" then a mood silently discards the sort (the `runQuery` mood branch overrides it).

**Sam (a11y / SR / keyboard):** no heading in results/shortlist/pick views — no landmark to the list; the invisible-CTA is also a contrast failure; ambiguous single-letter day headers. (Focus-visible and the grid aria-labels are genuinely good.)

**Casey (distracted mobile):** a 3-meal restaurant's expanded panel is a ~9-block scroll; the Discovery home is a very tall tile stack at 279–375px; the price chip reflows *below* the name on mobile, separating "$" from what it prices.

**Owner + friends deciding on a phone mid-conversation:** shortlist + `?picks` share is a real strength — but "Pick one for us" is buried, and the copied link carries no title/preview, arriving as a bare URL in a thread.

## Minor Observations

- "Adventurous" mood returns 13 vs 140–249 for peers — a near-empty lane that reads as broken.
- Masthead has no above-the-fold affiliation caveat; only the footer says "Unofficial."
- Map popups are terminal — a pin can't open the row's menu/availability, so the map locates but doesn't decide.
- The horizon eyebrow + racing stripes consume most of the first mobile screen before any content.
- "Clear all" sits inline as the last chip, easy to mis-tap.

## Questions to Consider

1. Your user is a tired group mid-conversation — why is the most decisive element ("Pick one for us") the *last* thing on the page instead of a "Tonight's pick" hero at the top? Would one confident suggestion out-convert 40 tiles?
2. You allow exactly one image, but it only appears *after* a row is expanded — is it doing any appetite work if it's invisible until the user has already committed to opening the row?
3. A shortlist is shareable but a search isn't. For a decision that ends in "send it to whoever you're going with," why is "Italian, Saturday dinner, Brickell" not a URL?
