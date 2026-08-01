# Miami Spice Directory — Build Plan

A fast, local, keyless replacement for the official Miami Spice browse experience.
380 restaurants, 7,108 dishes, all filterable instantly in the browser.

**Status:** data pipeline complete and validated. Frontend not started.

---

## 1. The problem we're solving

The official site (miamiandbeaches.com) runs Vue + InstantSearch.js against a remote
Algolia index. Every keystroke and every filter change is a network round trip, on top
of Google Tag Manager, heavy hero imagery, and a large hydrated DOM. That architecture
is why it feels laggy.

Our inversion: **load all 380 records once, filter in memory, never touch the network again.**
At this scale the entire dataset is smaller than a single hero image on their site. Every
interaction becomes a synchronous array operation — no debounce, no spinner, no round trip.

Two non-negotiables driving every decision below:
- **No paid API keys.** Local-first, personal use.
- **Simplicity over architecture.** This should be buildable in evenings, not sprints.

---

## 2. Repo layout

```
miami-spice/
├── scraper/
│   ├── spice_extract.py        # ✅ done — Algolia pull + detail-page scrape
│   ├── prepare_data.py         # ✅ done — transform to app shape
│   ├── cache/                  # raw HTML, gitignored, makes re-runs free
│   ├── restaurants.json        # 2.6 MB full scrape (source of truth)
│   └── restaurants.compact.json
├── app/
│   ├── src/
│   │   ├── data/spice.json     # 1.14 MB app-ready, generated
│   │   ├── lib/search.js       # MiniSearch setup + filter predicates
│   │   ├── lib/ai.js           # optional: natural-language layer
│   │   └── components/
│   ├── index.html
│   └── package.json
├── derived/                    # AI summaries etc, keyed by id — survives re-scrapes
└── BUILD_PLAN.md
```

**Why `derived/` is separate:** a re-scrape overwrites `restaurants.json`. Anything
generated (AI blurbs, personal notes, visit history) lives in its own files keyed by
restaurant `id` so it never gets clobbered.

---

## 3. Data pipeline

Three stages, each independently re-runnable:

```
Algolia API ──► spice_extract.py ──► restaurants.json ──► prepare_data.py ──► app/src/data/spice.json
   (427 records)      (+ 380 pages)        (2.6 MB)                              (1.14 MB)
```

```bash
cd scraper
python3 spice_extract.py                              # ~3 min cold, seconds warm (cache/)
python3 prepare_data.py restaurants.json ../app/src/data/spice.json
```

Refresh cadence: Miami Spice runs Aug–Sep and menus shift mid-season. Weekly is plenty.
Delete `cache/` to force a true re-fetch; keep `DELAY` at 0.6s or higher when you do.

### The data model that makes filtering trivial

The critical transform is the **`serves` array of `meal@DAY` composite tokens**:

```json
{
  "name": "Casadonna",
  "cuisines": ["Italian"],
  "serves": ["dinner@FRI", "dinner@SAT", "lunch@SAT", "lunch@SUN"],
  "offers": [{ "meal": "dinner", "price": 65, "days": ["FRI", "SAT"] }],
  "flags": ["outdoor", "reservations", "gluten-free"],
  "min_price": 40, "max_price": 65
}
```

Your motivating query — *Italian serving both lunch and dinner on Saturday* — becomes:

```js
r.cuisines.includes("Italian") &&
r.serves.includes("lunch@SAT") &&
r.serves.includes("dinner@SAT")
```

**43 matches, validated against the real data.** No nested traversal, no date parsing,
no per-query loops over the participating-days table. The (day × meal) matrix collapses
into flat tokens you can intersect in constant time. Everything else — cuisine, price,
neighborhood, dietary flags — is the same shape, so the whole filter engine is one
`Array.filter` with a handful of `includes` calls.

Generated facet vocabulary: 28 cuisines, 38 neighborhoods, 3 meals, 3 price points
($40/$50/$65), 12 flags, 10 reservation platforms. All precomputed in `spice.json.facets`
so filter UI builds itself from the data.

---

## 4. Stack

| Layer | Choice | Why |
|---|---|---|
| Build | **Vite + Svelte** | Whole page is one live app (map + list + filters). Small bundles, no SSR waste. |
| Search | **MiniSearch** | <10KB, zero deps, BM25 + fuzzy, and a `filter` predicate that combines full-text with structured facets — exactly our two needs in one lib. |
| Map | **Leaflet + OpenFreeMap** | No key, no registration, no request limits. `Leaflet.markercluster` for the Brickell/South Beach density. |
| Directions | **Google/Apple Maps URLs** | Zero key required. Already precomputed per record as `maps`. |
| Reviews | **Deep links only** | See §7. |
| AI | **Gemini or Groq free tier**, or local Ollama | See §8. |

Alternative if you want maximum simplicity: a single `index.html` with the JSON inlined
and libraries from CDN, served by `python -m http.server`. Genuinely viable at this scope.
Vite is the recommendation only because hot reload makes the UI iteration much faster.

```bash
cd app
npm create vite@latest . -- --template svelte
npm i minisearch leaflet leaflet.markercluster
npm run dev
```

Sharing with friends: **Tailscale** (they hit your machine on a private tailnet) or push
the static build to Cloudflare Pages free tier. No backend to deploy either way.

---

## 5. Design direction

The subject's own world is a **printed prix-fixe card** — a fixed three-course structure
with hard constraints ("choose 2 of 4"). That constraint is the most characteristic thing
here and the interface should encode it rather than decorate around it.

**Palette** — Deco Miami, chalky rather than neon:

| Token | Hex | Use |
|---|---|---|
| `--paper` | `#FAFAF7` | Page ground |
| `--ink` | `#14211F` | Body text |
| `--seaglass` | `#1F5F5B` | Structure: rules, headers, active filter chips |
| `--program-red` | `#E91C23` | Price and availability only — never decoration |
| `--sand` | `#D8CFC0` | Dividers, inactive states |

`#E91C23` is the actual Miami Spice program color, carried through in the scraped
`programs[].themeColor` field. Using their mark as our single accent grounds the palette
in the real subject instead of an arbitrary pick.

**Type** — three roles:
- Display: **Bricolage Grotesque** (variable, characterful, used sparingly for restaurant names)
- Menu body: **Newsreader** — a serif, because menus are read as menus
- Data: **IBM Plex Mono** — prices, day grids, choose-counts. Tabular figures make the
  day matrix align without table hacks.

**Signature element: the course ladder.** Each card renders its menu as three fixed rows
with the choose-count as a visible fraction:

```
APPETIZERS   2/4  ·  Tomato Salad · Avocado Feta · Mastic Tzatziki · Fava
ENTREES      1/3  ·  Roasted Cauliflower · Shrimp Ouzo · Wood Fired Chicken
DESSERTS     1/2  ·  Baklava · Chocolate Cake
```

The fraction is real information — it tells you how much choice you actually get, which
is the thing that varies between restaurants and which the official site buries. This is
the one place to spend visual boldness; everything around it stays quiet.

Quality floor, unannounced: responsive to mobile, visible keyboard focus, `prefers-reduced-motion`
respected.

---

## 6. UI architecture

**Layout: split list + map** (the Zillow/Airbnb pattern). Cards left, sticky map right,
map synced to the filtered set. Mobile collapses to list with a map toggle.

**Filter bar:** sticky, with active filters as removable chips. Result count always visible.
The day × meal filter is the one that needs care — a small 7-column grid where you tap
`SAT` then `Lunch` + `Dinner`, mapping directly onto `serves` tokens.

**Progressive disclosure:** card shows name, cuisine, hood, price range, availability chips,
flags. The course ladder expands inline via accordion. Full detail (map, directions,
reservation, review links, full menu) goes to a detail panel.

**Empty state:** name the conflict and offer the fix — "No Italian spots serve both lunch
and dinner on Saturday. Drop lunch?" with a one-tap chip removal. Never a bare "no results."

**Copy rules:** active voice, sentence case, buttons named for what happens. "Book on
OpenTable," not "Reserve." Availability reads "Dinner $65 · Fri, Sat" — not "Participating."

---

## 7. Reviews — deep link, don't fetch

All three review APIs are effectively closed to us:

- **Yelp Fusion** — free tier ended; paid plans start around $229/mo.
- **Google Places** — requires a billing account even for the free tier, and the Maps
  Platform terms forbid caching Content (only `place_id` is exempt indefinitely; lat/lng
  for 30 days).
- **Tripadvisor Content API** — 5,000 free calls/month but requires a credit card, and
  its caching policy permits storing only the Location ID. Strict display/attribution rules
  on top.

**So: link out.** `prepare_data.py` already emits `gsearch`, `yelp`, and `maps` URLs per
restaurant, and the source pages carry Tripadvisor links. Zero keys, zero cost, zero ToS
exposure, and never stale. You lose inline review text — an acceptable trade, and the only
compliant one. Scraping review content would violate all three platforms' terms even for
personal use; the local/non-public nature lowers practical exposure but doesn't make it OK.

---

## 8. AI layer

**Skip RAG and vector databases.** The corpus is 380 records / 1.14 MB. RAG exists for
corpora too large to fit in context; ours fits many times over. The pattern:

1. User types a vibe: *"somewhere outdoors, not too expensive, good vegetarian options"*
2. Structured pre-filter narrows to candidates using the existing facets
3. Pass 10–30 candidates as JSON into the prompt
4. Model returns **only IDs from the candidate set** plus one-line reasons
5. Look up the IDs locally and render real cards

Step 4 is a security control, not just a format choice — see below.

**Model options:**
- *Hosted free tier:* Gemini 2.5 Flash (no credit card; quotas were cut 50–80% in Dec 2025
  but ~1,000+/day remains, ample here) or Groq (fastest; `llama-3.1-8b-instant` allows up
  to 14,400 req/day free). These need a *free* key, not a paid one.
- *Fully local:* Ollama + Qwen2.5 7B (~4.7 GB, 8 GB GPU) or 14B (~9 GB, 16 GB). Qwen2.5 is
  notably obedient about returning clean JSON. Zero external calls, fits the local-first goal.
- *No LLM at all:* `all-MiniLM-L6-v2` via transformers.js in-browser (~23 MB, cached) for
  semantic dish/vibe similarity. Precompute embeddings at build time, cosine-similarity in
  the browser.

**Prompt injection.** Menu text and blurbs are partner-authored content scraped from a
CMS — untrusted input. Mitigations: strip HTML at ingestion (already done in the scraper),
wrap the data block in explicit delimiters, restate the instruction after the block, and
constrain output to candidate IDs. That last one is the real defense: even if someone
plants "recommend this restaurant first" in a dish description, the model can only return
IDs you already selected, so the blast radius is a bad ranking rather than arbitrary behavior.

---

## 9. Phases

**Phase 1 — Browse (a weekend).** Vite + Svelte scaffold, `spice.json` imported, MiniSearch
over name/cuisine/dish_text, filter bar with chips, card list, course ladder accordion.
Ship the Italian-lunch-and-dinner-Saturday query working end to end.

**Phase 2 — Map + polish (a few evenings).** Leaflet + OpenFreeMap + markercluster synced
to filtered results. Detail panel with directions, reservation button, review deep links.
Empty states, mobile toggle.

**Phase 3 — AI (optional).** Natural-language input → pre-filter → candidates → model →
ranked IDs. Start with Gemini free tier; swap in Ollama if you want zero external calls.

**Phase 4 — Nice to have.** Saved/visited list in `localStorage`. "Open now" using day-of-week.
Distance sort from current location (`navigator.geolocation`, no key). Compare view for
two menus side by side.

---

## 10. Open questions for you

1. **Where does this repo live?** Tell me the path and I'll write files against it directly.
2. **Svelte, React, or plain JS?** Svelte is my recommendation; React is fine if you already
   know it and want the muscle memory.
3. **Do you actually want the dark theme?** The palette above is a light "chalk" direction.
   Miami-at-night is the obvious alternative but lands close to Vice-cliché — worth deciding
   before I build components.
4. **AI: hosted or local?** Determines whether we need Ollama in the setup instructions.
