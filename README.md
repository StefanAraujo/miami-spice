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

## Design: Vice noir

Dark, minimal, two neons and nothing else. Grounded in the show's actual brand
colors — cyan `#0BD2D3` and pink `#F990E8` — pulled off full saturation and set
on a blue-black ground rather than pure black, per standard dark-mode practice.

| Token | Hex | Use |
|---|---|---|
| `--void` | `#0A0D14` | Page ground |
| `--surface` | `#12161F` | Cards, controls |
| `--line` | `#232939` | Hairlines |
| `--text` | `#EAECF2` | Body |
| `--cyan` | `#22D3D4` | Structure and state: active filters, section heads |
| `--hot` | `#FF4D9D` | Price only |
| `--pink` | `#F97FD9` | Availability only |

Three rules keep it from tipping into pastiche:

1. **Neon is information, never decoration.** Cyan means "you selected this."
   Pink means "this is what it costs and when." Nothing is neon for atmosphere.
2. **One gradient, one place.** A sunset bleeds out of the top edge at ~15%
   opacity. That is the whole 80s reference.
3. **The two neons touch exactly once**, in the wordmark.

Type is two families: **Space Grotesk** (display and body) and **IBM Plex Mono**
(all data, tabular figures). Both are self-hosted via `@fontsource`, so the app
renders identically offline and makes no request to Google.

Every text color pair clears WCAG AA 4.5:1 — `verify.mjs` asserts it by parsing
the tokens straight out of `app.css`, so a future palette tweak that breaks
contrast fails the run instead of shipping.

## Notes

- Review content is **deep-linked, never fetched**. Yelp, Google Places and
  Tripadvisor all forbid caching their content; each card links out instead.
- Data snapshot date is shown in the masthead so you know how stale it is.
- The palette is entirely CSS custom properties, so a light theme is a variable
  swap in `app.css` rather than a rewrite.
