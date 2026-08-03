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

## Design standard — Midnight Poster

Full record in `DESIGN.md`. The 2026-08-03 redesign is a brief-pinned pivot: the owner supplied
the Miami-Vice palette (colorswall #246639) and the sliced-caps poster logo and asked for a
modern take. It replaced "Apple form · Vice night" (soft-round SF, retired) and, before that,
Tropical Deco — both are historical anti-reference now. The short version, easy to undo by accident:

- **Deep near-dark ground, electric-cyan structure, one hot pink for price.** Single theme on
  `:root` (no `data-theme` — `main.js` no longer sets one): `--paper #0a0d0e`, `--card #12181a`
  (lifted surface), `--sunk #05080a` (wells), `--ink #f2f3ee`, `--soft #9fb0ad`, `--marine #1be7ff`
  (the structural tint — fills, selection, links, CTAs), `--flamingo #ff6ec7` (price, nothing else),
  `--purple #c86bff` + `--orange #ff824d` (categorical accent layer only), `--on-color #06110f`
  (deep type on a cyan/pink block).
- **The accent is chosen by exclusion**, per Michael Mann's *Miami Vice* rule: no earth tones, no
  red, no primaries. `--flamingo` is price only; cyan carries everything else structural.
- **Flat, hard-edged, neo-brutalist depth.** `border-radius` is `0` everywhere (a poster is cut,
  not softened); form is drawn with **2px `--rule` borders** and flat colour blocks. Depth is a
  hard ink offset — `--eyebrow: 4px 4px 0 var(--ink)`, `--shadow-lg: 8px 8px 0 var(--ink)`. No
  gradient, no glow (the banned synthwave tells). The uniform-radius lint rule is scoped to allow
  this deliberately hard world.
- **Two faces.** Futura-lineage geometric **caps** (`--f-display`) for the poster voice — sliced
  wordmark, hero, section labels, tiles, CTAs, restaurant names, price figures. **SF** (`--f-body`)
  for the dense body — dish descriptions, teasers, row meta, prose. SF Mono for figures. No web
  fonts (production may self-host Monument/Clash for non-Apple platforms).
- **Caps is the brand voice, not an eyebrow — but bounded.** Uppercase is intentional here; its
  guardrail is the **rendered** caps-density (design-lint SPEC-06, kept < 25% of text nodes). So
  the dense functional controls — rail facets, day/meal — stay **sentence case** for scannability.
  The eyebrow-overuse rule-count proxy is relaxed (threshold raised, reason documented in the rule).
- **Signatures.** The sliced wordmark (MIAMI ink / SPICE cyan with a hard pink offset) and the
  tri-colour rule (cyan/pink/ink) under the masthead. `ViceMark` is a flat cyan Miami-sun mark
  (solid fills, no glow) for the image-fallback tile and empty state.
- **Controls.** Segmented controls (view / course) are a 2px frame with a cyan-filled selected
  segment; facets/day/meal are 2px-bordered, sentence case, cyan fill when selected. Discovery
  tiles cycle cyan / pink / outline. Every control keeps a ≥44pt hit target.
- **Rows, not cards.** A 379-item directory is all four NN/g anti-card cases. Target ≥6 results
  per 900px viewport; currently 8.5.

Floors enforced by `design-lint.mjs`, not by vigilance: 11px minimum type, 44px minimum tap
target, 7:1 for small text, 3:1 for UI boundaries.

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
- **Course `items` are `{name, note}` objects, not bare strings.** `prepare_data.py`'s
  `flatten_menus()` carries the per-dish description `note` (present on ~90% of dishes) alongside the
  `name`. `CourseLadder` shows names; the `MenuSheet` popup shows names + descriptions. Consumers must
  read `item.name` (Row teaser/signature, CourseLadder). `note` is deliberately kept OUT of the search
  `dish_text` (names only) — indexing descriptions would let a free-text query match a word never in
  any dish *name* and break the facet+text "contradiction" tests in `verify.mjs`.
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
