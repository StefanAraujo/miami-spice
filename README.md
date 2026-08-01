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
silently returning the wrong restaurants. Writes `verify-*.png` screenshots.

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

## Notes

- Review content is **deep-linked, never fetched**. Yelp, Google Places and
  Tripadvisor all forbid caching their content; each card links out instead.
- Fonts load from Google Fonts with system fallbacks. Everything else is local.
- Data snapshot date is shown in the masthead so you know how stale it is.
