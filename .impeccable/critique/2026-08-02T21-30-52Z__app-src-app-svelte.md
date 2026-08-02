---
target: app/src/App.svelte
total_score: 36
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 0
timestamp: 2026-08-02T21-30-52Z
slug: app-src-app-svelte
---
Method: dual-agent (design review + detector evidence, isolated)

## Design Health Score — 36/40 · Good (upper band) — up from 32

| # | Heuristic | Score | Δ | Key issue |
|---|-----------|-------|---|-----------|
| 1 | Visibility of System Status | 4 | ↑ | URL mirrors full state; share confirmation; live counts. |
| 2 | Match System / Real World | 3 | = | Great copy, but AM/PM reads as a meal-time filter, not a theme. |
| 3 | User Control and Freedom | 4 | ↑ | Wordmark is a real Home button; chips, Clear all, back-via-URL. |
| 4 | Consistency and Standards | 4 | ↑ | One price language now (numeric chip; $$$ tier removed from meta). |
| 5 | Error Prevention | 4 | = | Disable-not-remove; counts stop dead ends. |
| 6 | Recognition Rather Than Recall | 3 | = | Strong, but AM/PM + single-letter rail days need recall/hover. |
| 7 | Flexibility and Efficiency | 4 | ↑ | Presets, mood lens, sort, shortlist, shareable URL. |
| 8 | Aesthetic and Minimalist | 3 | ≈ | Restrained, but masthead metadata is ~5 wrapped mono lines. |
| 9 | Error Recovery | 4 | = | Empty state → "Drop cuisine (N)" + Start over. |
| 10 | Help and Documentation | 3 | ↑↑ | Intro banner, grid legend, AM/PM tooltip, mood-fit hint, dietary caption. |
| **Total** | | **36/40** | **+4** | **Good (upper band)** |

## Design Specificity Verdict

Genuinely design-led ("Ocean Drive After Dark" Tropical Deco), executed with verifiable discipline: rows-not-cards, one saturated object (flamingo price), zero-blur eyebrow shadows, five type steps, dual AM/PM theme by token. The fix cycle produced real changes, not cosmetics — every prior P1/P2/P3 verified resolved in the running app. Deterministic: both the Impeccable detector and the project's design-lint return 0 findings / 0 slop tells across all 8 markup files, new features included. The two passes agree: the surface is slop-free and the improvements are real.

## Prior issues — all resolved

- [P1] CTA vanishing on hover → fixed (`.cta:hover { color: var(--card) }`, offset feedback).
- [P2] Discovery overload → decisive lead first (Pick for us / Open tonight / Browse all), lanes capped at 6 with "+N more".
- [P3] Empty "—" chip → "Menu only" fallback; $$$ tier removed; wordmark = Home; per-view sr-only headings; two-letter grid day headers.
- Help & Docs (was the weakest) → first-run banner + grid legend + AM/PM tooltip + mood-fit hint.
- Shareable search → confirmed both directions (?cuisines=Italian applies on load; typing rewrites the URL).

## Priority Issues (new, none blocking)

**[P2] AM/PM label misleads and is undiscoverable on touch.** In a restaurant-week app "AM/PM" reads as breakfast-vs-dinner; its real meaning (light/dark theme) is carried only by a hover title, invisible on mobile. *Note:* AM/PM is the pinned "Ocean Drive After Dark" sundown metaphor (DESIGN.md North Star), so relabeling to Day/Night is a brand-vs-clarity decision for the owner. *Command: clarify.*

**[P2] Mobile masthead metadata duplicates itself.** Tagline "updated Aug 1" + promo "updated weekly" + prix-fixe tiers restated across promo/intro = ~5 wrapped mono lines pushing the decisive action down. *Fix: collapse tagline+promo under 560px; move the deadline into the intro. Command: layout.*

**[P3] Filter-rail day picker still single letters (M T W T F S S).** Ambiguous two-T/two-S; the availability grid already uses two-letter. *Fix: DayMealGrid slice(0,2) + widen cell. Command: clarify.*

**[P3] No persistent help after the intro is dismissed (remembered forever).** *Fix: a footer "About" affordance that re-opens the intro copy. Command: onboard.*

**[P3] Wordmark-Home has no affordance.** Real button (goHome) but looks like a static logo; hover-only cue. *Fix: title="Back to start" + visible focus/hover cue. Command: clarify.*

## Persona Red Flags

- Alex (power user): well served (URL params, shortlist, sort, course lens); no keyboard shortcuts; `shown` resets to 40 on refine.
- Sam (a11y): strong baseline (aria-pressed, aria-live, sr-only headings, table caption + cell aria-labels, reduced-motion); AM/PM meaning + rail day-letters conveyed via title only — unreliable for touch AT.
- Casey (mobile): tightened masthead, drawer filters, 44px targets; AM/PM tooltip invisible on touch; masthead+intro still fill much of the first screen.
- Owner + friends on a phone: best-fit (shareable link + shortlist + Pick-for-us); a link carrying both filters AND picks opens to results, not the shortlist (showShortlist only when filters empty).

## Minor Observations

- CourseLadder racing stripes use repeating-linear-gradient (hard-stop, not blur) — defensible Deco device; confirm the lint whitelists the `gradient` keyword.
- priceRange() still returns "—" but Row guards on min_price != null, so that branch is now dead — simplify to prevent a future regression.
- Three near-duplicate honesty signals (updated Aug 1 / updated weekly / prix-fixe repeated).
- "By city" and "By neighborhood" are adjacent overlapping discover lanes.

## Questions to Consider

1. If "Pick one for us" is the confident default you're proudest of, why is it the third button and an unexplained random draw — would "we picked X because it's open tonight with the deepest $65 menu" convert a tired group better than a dice roll?
2. Does a day/night theme toggle deserve prime masthead real estate in a dinner-decision tool — especially when the label reads as a meal-time filter?
3. The address bar now IS the group-decision primitive — the one thing OpenTable structurally can't copy. Should the product make that superpower explicit instead of hiding it behind a Share button?
