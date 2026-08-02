# Miami Spice Directory

A fast, local, keyless replacement for the official Miami Spice browse experience.
380 restaurants, ~7,000 dishes, filtered in memory — no network round trip after load.

See [BUILD_PLAN.md](./BUILD_PLAN.md) for the reasoning behind every choice here.

## Status

| Phase | What | State |
|---|---|---|
| 0 | Data pipeline (scrape → transform) | done |
| 1 | Browse: search, filters, cards, course ladder | **done** |
| 2 | Map, detail panel, review deep links | not started |
| 3 | Natural-language / AI layer | deferred by choice |
| 4 | Saved list, open-now, distance sort, compare | not started |

## Run it

```bash
cd app
npm install
npm run dev          # http://localhost:5173
```

Production build:

```bash
npm run build        # -> app/dist, a static folder you can serve anywhere
npm run preview
```

## Refresh the data

Miami Spice runs Aug–Sep and menus shift mid-season, so re-scrape weekly.

```bash
cd scraper
python3 spice_extract.py                                  # ~3 min cold, seconds warm
python3 prepare_data.py restaurants.json ../app/src/data/spice.json
```

`scraper/cache/` makes re-runs free. Delete it to force a true re-fetch, and keep
`DELAY` at 0.6s or higher when you do.

## Verify

```bash
cd app
npm run build
node verify.mjs
```

Drives the real UI in headless Chromium and checks every result count against an
independent pass over `spice.json` — so a broken filter fails the run rather than
silently returning the wrong restaurants. Also asserts WCAG AA contrast across the
palette and that nothing overflows a 390px viewport. Writes `verify-*.png` screenshots.

Playwright is a devDependency, so the first `npm install` pulls a Chromium build.

## How the filtering works

`prepare_data.py` denormalizes each restaurant's (day × meal) availability into a
flat `serves` array of `meal@DAY` tokens. "Italian serving both lunch and dinner
on Saturday" is then three `includes` calls:

```js
r.cuisines.includes('Italian') &&
r.serves.includes('lunch@SAT') &&
r.serves.includes('dinner@SAT')      // 43 matches
```

Everything else — cuisine, price, neighborhood, dietary flags — is the same shape,
so the whole engine is one `Array.filter` in [`app/src/lib/search.js`](./app/src/lib/search.js).

Combination rules, since they are the one non-obvious part:

| Facet | Rule |
|---|---|
| Day + meal | every selected **meal** on at least **one** selected day |
| Cuisine, neighborhood, price | OR within the facet |
| Dietary & amenities | AND — these read as requirements |
| Across facets | AND |

## Layout

```
scraper/    spice_extract.py, prepare_data.py, restaurants.json (source of truth)
app/        Vite + Svelte 5 frontend
  src/lib/search.js       MiniSearch index + filter predicates + formatting
  src/components/         FacetGroup, DayMealGrid, Card, CourseLadder
  src/data/spice.json     generated — do not hand-edit
derived/    AI summaries, notes, visit history — keyed by id so a re-scrape
            never clobbers them
```

## Design: Tropical Deco

Near-white field, marine structure, one flamingo accent for price. Full reasoning and the
audit that produced it are in [DESIGN_REVIEW.md](./DESIGN_REVIEW.md).

| Token | Hex | Use |
|---|---|---|
| `--paper` | `#E9E6DE` | Page ground (City of Miami Beach approved district palette) |
| `--card` | `#F5F3ED` | Raised surface |
| `--ink` | `#161A19` | Body — 15.8:1 |
| `--soft` | `#464B47` | Metadata — 8.0:1, clears Apple's 7:1 small-text target |
| `--rule` | `#8E887E` | UI boundaries — 3.2:1, clears WCAG 1.4.11 |
| `--marine` | `#12414C` | Structure and state |
| `--flamingo` | `#9C1E45` | **Price only** |

Three rules:

1. **The accent is chosen by exclusion**, per Michael Mann's rule for *Miami Vice* — no earth
   tones, no red, no primaries. What survives is marine and one flamingo.
2. **Hard shadows, never glow.** `box-shadow: 6px 6px 0` — a Deco eyebrow. Miami light is
   knife-edge sun. There is no blur and no gradient anywhere in the app.
3. **The pastel is the paper, not the ink.** The historic district's own approved paint palette
   is ~250 near-white low-chroma tints with trim restricted to greys. Saturation belongs to
   signage, and here that means price.

Type is **Jost** (Futura lineage, 1927) and **IBM Plex Mono**, self-hosted via `@fontsource`.
Four steps only: 12 / 15 / 19 / 44, each ≥1.25× the last.

Results are **rows, not cards** — NN/g lists four cases where cards are the wrong component and
a 380-restaurant directory is all four. 104px rows, 8.5 per viewport.

## Design lint

```bash
cd app && npm run build && node design-lint.mjs
```

Deterministic audit, no LLM judgment, non-zero exit on criticals. `SLOP/*` rules are the
catalogued markers of generated UI; `SPEC/*` are numeric floors from Apple's HIG and WCAG 2.2
(11px minimum type, 44px minimum target, 7:1 small text, 3:1 UI boundaries, ≥1.25× type steps).

## Notes

- Review content is **deep-linked, never fetched**. Yelp, Google Places and
  Tripadvisor all forbid caching their content; each card links out instead.
- Data snapshot date is shown in the masthead so you know how stale it is.
- Facet options show live counts and grey out at zero rather than disappearing, which is
  Baymard's first line of defence against dead-end result sets.
- `prepare_data.py` normalizes ALL-CAPS dish names (31% of the source) and strips instruction
  lines the CMS stored as if they were dishes.
