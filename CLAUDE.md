# Miami Spice Directory

A fast, local, keyless replacement for the official Miami Spice browse experience.
380 restaurants, ~7,000 dishes, filtered entirely in memory — no network round trip after load.

Read `BUILD_PLAN.md` for the original reasoning and `DESIGN_REVIEW.md` for the design standard.
Both are load-bearing; this file is the short version.

## Layout

```
scraper/    spice_extract.py   Algolia pull + detail-page scrape  -> restaurants.json
            prepare_data.py    transform                          -> app/src/data/spice.json
            restaurants.json   2.6 MB source of truth
app/        Vite + Svelte 5 (runes). No SSR, no router, one page.
  src/lib/search.js        MiniSearch index + filter predicates + facet counts + formatting
  src/components/          Row, CourseLadder, FacetGroup, DayMealGrid
  src/data/spice.json      GENERATED — never hand-edit
  verify.mjs               behaviour tests (headless Chromium)
  design-lint.mjs          design audit (slop tells + Apple/WCAG floors)
  specimen/                Tropical Deco reference sheet, not app code
derived/    AI summaries, notes, visit history — keyed by restaurant id so a
            re-scrape never clobbers them
```

## Commands

```bash
cd app
npm install          # pulls a Chromium download; playwright is a devDependency
npm run dev          # http://localhost:5173
npm run build        # -> app/dist, static

node verify.mjs      # run AFTER npm run build. 11 behaviour checks.
node design-lint.mjs # run AFTER npm run build. Design audit, non-zero exit on criticals.
```

Re-scrape (Aug–Sep season, menus shift mid-season, weekly is plenty):

```bash
cd scraper
pip install requests beautifulsoup4      # the only Python deps; stdlib otherwise
python3 spice_extract.py                 # ~3 min cold, seconds warm via cache/
python3 prepare_data.py restaurants.json ../app/src/data/spice.json
```

Delete `scraper/cache/` to force a true re-fetch, and keep `DELAY` at 0.6s or higher when you do.

**Always run both scripts after touching filters, colours, or component markup.** They are the
only thing standing between a plausible change and a wrong one — `verify.mjs` checks result
counts against an independent pass over `spice.json` rather than against the app's own filter.

## The data model

`prepare_data.py` denormalizes each restaurant's (day × meal) availability into a flat `serves`
array of `meal@DAY` tokens. The motivating query becomes three `includes` calls:

```js
r.cuisines.includes('Italian') && r.serves.includes('lunch@SAT') && r.serves.includes('dinner@SAT')
// 26 matches — asserted in verify.mjs
```

Combination rules, since they are the one non-obvious part:

| Facet | Rule |
|---|---|
| Day + meal | every selected **meal** on at least **one** selected day |
| Cuisine, neighborhood, price | OR within the facet |
| Dietary & amenities | **AND** — these read as requirements, not alternatives |
| Across facets | AND |

`facetCounts()` recomputes every option's count against everything else applied, self-excluding
the facet being counted. Zero options are **disabled and greyed, never removed** — removing them
makes the list jump and destroys the user's spatial memory of it.

## Design standard — Tropical Deco

Full reasoning in `DESIGN_REVIEW.md`. The short version, because it is easy to undo by accident:

- **Near-white field, marine structure, one flamingo for price.** `--paper #E9E6DE`,
  `--card #F5F3ED`, `--ink #161A19`, `--soft #464B47`, `--rule #8E887E`, `--marine #12414C`,
  `--flamingo #9C1E45`. The pastel is the paper, not the ink.
- **The accent is chosen by exclusion**, per Michael Mann's rule for *Miami Vice*: no earth tones,
  no red, no primaries. `--flamingo` is used for price and nothing else.
- **Hard shadows, never glow.** `box-shadow: 6px 6px 0` — an Art Deco eyebrow. There is no blur
  and no gradient anywhere in the app, deliberately.
- **Four type steps only**: 12 / 15 / 19 / 44, each ≥1.25× the last. Jost + IBM Plex Mono,
  self-hosted via `@fontsource`. Never introduce a fifth size.
- **Rows, not cards.** NN/g lists four cases where cards are the wrong component — search,
  comparison, homogeneous content, density — and a 380-item directory is all four.
  Target ≥6 results per 900px viewport; currently 8.5.
- **Uppercase is limited to two roles**: `.micro` and the wordmark. Adding a third re-triggers
  the eyebrow-overuse rule.

Floors enforced by `design-lint.mjs`, not by vigilance: 11px minimum type, 44px minimum tap
target, 7:1 for small text, 3:1 for UI boundaries. Where Apple and WCAG disagree it takes the
stricter — WCAG for contrast, Apple for target size.

If you disagree with a lint rule, **edit the rule and say why**. Do not work around it.

## Conventions

- Svelte 5 runes (`$state`, `$derived`, `$props`, `$effect`). No stores, no legacy syntax.
- 2-space indent, no semicolons in JS, single quotes.
- Every colour goes through a `var()`. Raw hex outside `app.css` is a lint finding.
- Comments explain *why*, especially where a value traces to a source (an Apple number, a WCAG
  clause, a Baymard finding). Those citations are the point — keep them when editing nearby code.
- Copy rules: active voice, sentence case, buttons named for what happens. "Book on OpenTable,"
  not "Reserve." Availability reads "Dinner $65 · Fri, Sat" — never "Participating."

## Gotchas

- `spice.json` is generated. Fix data problems in `prepare_data.py` and regenerate. The file is
  kept `chmod 444` as a guard against hand-edits — `chmod u+w` before regenerating, `chmod 444` after.
- Availability comes from the record's **`spice_schedule`** (the Algolia field: `"Saturday > Dinner $65"`),
  **not** `participating_days`. The detail-page day-table scrape in `spice_extract.py`
  (`parse_days_table`) reads a dash-marked *unavailable* day as present, so `participating_days` lists
  all seven days for ~99% of records — that is what once showed 107 Steak and Bar a Sunday it doesn't
  serve. `build_serves()` sources `spice_schedule` and only falls back to `participating_days` when it
  is empty. If you re-scrape, either fix `parse_days_table` (confirm the glyph against a fresh page) or
  keep sourcing from `spice_schedule`.
- ~31% of dish names arrive ALL CAPS from the CMS and are title-cased in `prepare_data.py` with
  Italian/Spanish particle handling. Restaurant names are deliberately untouched — AVIV and KOKO
  are brand capitals, not shouting.
- Svelte trims leading whitespace inside `{#if}` blocks. Build display strings in the script
  block rather than interpolating around markup, or you get "NEIGHBORHOODS· DATA FROM".
- Review content is **deep-linked, never fetched**. Yelp, Google Places and Tripadvisor all
  forbid caching their content. Do not add a review API.
- Facet options render their count inside the label, so Playwright `{ name: 'Italian', exact: true }`
  no longer matches — use a regex.

## Status

Phase 1 (browse) is complete. Phase 2 is the map: Leaflet + OpenFreeMap + markercluster synced to
the filtered set, plus a detail panel. It needs a **light** basemap to match the current theme.
Phase 3 (natural-language search) is deferred by choice. See `README.md` for the full phase table.
