# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: the owner and their circle (friends) — people personally navigating Miami's
"Miami Spice" Restaurant Week to decide where to go out. Situation: choosing where to eat
during the Aug–Sep promotion, frequently as a social/group decision. Job: quickly find a
spot that fits a craving, occasion, neighborhood, or the night they're free — and see what
is actually on the fixed-price menu — faster and more honestly than the official site.

Not a public/mass-market product and not a portfolio piece: success is defined by whether it
is genuinely the owner and friends' preferred way to make this decision.

## Product Purpose

A fast, local, keyless replacement for the official Miami Spice browse experience — ~380
restaurants and ~7,000 dishes, filtered entirely in memory with no network round-trip after
load. It exists because the official site is slow and buries the two things that actually
decide the choice: honest day×meal availability and full three-course menu depth. Success:
for the owner and their circle, it is faster, more honest, and more pleasant than the
official site for their own going-out decisions.

## Positioning

The honest, fact-and-voice directory. Its defensible mechanism is the combination a
neighboring product (the official site, OpenTable) cannot truthfully copy: **accurate
day×meal availability** sourced from the reliable Algolia `spice_schedule` field (not the
buggy detail-page day table), **full prix-fixe menu depth** surfaced instead of buried, and
a **keyless, fully in-memory** engine — all with **no reviews or photos to slow it down or
expose it legally**. Trust is bought with objective facts and honest availability, not with
hosted ratings.

## Operating Context

- Seasonal event: Miami Spice / Restaurant Week runs roughly Aug–Sep; menus shift mid-season,
  so the dataset is re-scraped (weekly is enough). Fixed prix-fixe tiers are $40 / $50 / $65,
  three courses (Appetizers / Entrees / Desserts).
- The decision is usually social and ends off-site: the app helps decide, then deep-links out
  to book (OpenTable / Resy / etc.) and to ratings (Google / Yelp).
- Data pipeline: `scraper/spice_extract.py` (Algolia + detail scrape) → `scraper/restaurants.json`
  → `scraper/prepare_data.py` → `app/src/data/spice.json` (generated; kept `chmod 444`).
- Two guardrail scripts are part of the product's operating discipline: `app/verify.mjs`
  (behaviour, counts checked against an independent pass over the data) and `app/design-lint.mjs`
  (anti-slop tells + Apple/WCAG floors). Both must stay green.

## Capabilities and Constraints

Capabilities (confirmed, shipped): discovery-first home (browse by cuisine / city / neighborhood
/ mood / occasion / timing); interdependent filters with live counts and no dead ends;
per-restaurant day×meal availability grid; a map synced to the filtered result set; course-first
browsing; mood/craving scoring; a client-side shortlist and shareable search/shortlist links; and a
"pick for us" confident default with a stated reason. Single night-only theme ("Ocean Drive After Dark").

Hard constraints future work MUST preserve (owner-confirmed):

- **Keyless / no login / no backend.** Fully in-memory; no accounts, no server round-trip after
  load. Load-bearing architectural promise.
- **No reviews / no dish photos.** Never cache Yelp / Google / Tripadvisor review content
  (legal); deep-link out instead. At most one restaurant-level image per record — never per-dish
  photo galleries.
- **Unofficial / unaffiliated.** Must never imply endorsement by or affiliation with the official
  Miami Spice promotion.
- **`spice.json` is generated** — never hand-edited; data problems are fixed in `prepare_data.py`
  and regenerated.

Terminology: "Miami Spice" (the promotion), prix-fixe tiers, courses (Appetizers / Entrees /
Desserts), `serves` (`meal@DAY` availability tokens), the day×meal availability grid.

## Brand Commitments

- **Name:** "Miami Spice" — used unofficially.
- **Binding visual constraint (owner-stated):** the theme must be *purely "Miami Vice" captured* —
  the entire design and colour scheme — rendered **modern**. The current committed world is
  **"Midnight Poster"** (brief-pinned 2026-08-03 from the owner's colorswall #246639 palette and
  the sliced-caps Miami Vice logo): a flat, geometric night poster — electric-cyan structure, one
  hot-pink price, hard edges, Futura-lineage caps. It superseded the earlier "Apple form · Vice
  night" (soft-round SF) take; the Apple-HIG rendition is retired, though its restraint discipline
  carries forward. The concrete visual world lives in `DESIGN.md`, not this product record.
- **Anti-AI-slop design discipline is binding**, not incidental: the `design-lint.mjs` floors and
  the "no neon glow, no gradient, hard-edged, restraint-first" standard
  (`DESIGN_REVIEW.md`, `VICE_DIRECTION.md`) are commitments. Note the deliberate reconciliation
  already in the codebase — "Miami Vice via colour-as-signage and hard Deco edges, not neon-on-black"
  — because literal neon-Vice is exactly the AI-slop pattern the discipline rejects. Any future
  visual work resolves the "purely Vice" + "anti-slop" pairing in `DESIGN.md`, not by abandoning
  either commitment.
- **Copy rules:** active voice, sentence case, buttons named for what happens ("Book on OpenTable,"
  not "Reserve"); availability reads "Dinner $65 · Fri, Sat," never "Participating."

## Evidence on Hand

- Real data: ~380 restaurants / ~7,000 dishes in `app/src/data/spice.json`, generated from
  `scraper/restaurants.json`.
- One real restaurant-level image URL per record (external CDN, verified reachable) — the only
  imagery available; there is no per-dish photography.
- Deep-link targets present per record: booking (`reserve`/`platform`), directions (`maps`),
  ratings (`gsearch` Google, `yelp`), official page (`url`).
- Product/design docs already in-repo: `CLAUDE.md`, `DESIGN_REVIEW.md`, `VICE_DIRECTION.md`,
  `REVAMP_VISUAL.md`, `REVAMP_IA.md`, `ROADMAP.md`, `UX_PSYCHOLOGY_REVIEW.md`.
- Absences future work must NOT fabricate: no hosted user reviews/ratings, no booking inventory
  or seat availability, no per-dish photos, no social graph or accounts.

## Product Principles

1. **Honesty over completeness.** Show only what is true — accurate availability, real menu depth
   — and deep-link out rather than fabricate trust it cannot host.
2. **Keyless and instant.** Everything filters in memory; no login, no backend, no network after
   load is a promise, not an implementation detail.
3. **Decision-first, for a social choice.** Help the owner and friends *decide* — together, via
   shortlist and shareable link — not merely filter a list.
4. **Discipline is the identity.** "Miami Vice," captured through Apple-grade restraint, never
   AI-slop neon; the lint floors are the guardrail that keeps it so.
5. **Seasonal and scoped.** Built for the Aug–Sep promotion and re-scraped each season — not a
   year-round or multi-city product.

## Accessibility & Inclusion

Enforced by `design-lint.mjs` rather than vigilance: WCAG AA contrast (with a 7:1 target for small
text), Apple's 44pt minimum tap targets, `prefers-reduced-motion` honored, visible keyboard focus,
and no meaning conveyed by colour alone.
