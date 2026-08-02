# Revamp — information architecture & food-first discovery

**Brief:** "Help anyone look for what they want in Miami Spice, including course food, what
they are feeling, and things like that." Today the app answers one question well — *"which
restaurants match these facts?"* — through a precise, Baymard-clean filter rail. It does not
answer the questions people actually arrive with: *"I want something light tonight," "where's
a good date-night spot near me," "who has the best desserts," "I'm feeling adventurous."*

This document proposes discovery entry points **above** the existing filter engine, not instead
of it. Every feature below names the exact fields it reads. Nothing here asks the scraper for
new data unless it is called out in **`derived/` — needs enrichment**. The filter rail,
`facetCounts`, `relaxations`, density rules, and the Tropical Deco system all stay; this is a
new front door onto the same `runQuery`.

---

## 0. What the data actually supports (the ground truth)

Measured from `app/src/data/spice.json`, 380 restaurants, 7,063 dish items:

| Field | Coverage | Discovery value |
|---|---|---|
| `menus[].courses[]` = `{name, choose, of, items[]}` | Courses normalize to exactly **Appetizers / Entrees / Desserts** (669 / 669 / 670 restaurants) | Course-first browse is essentially free — the taxonomy is already clean |
| `dish_text` (all dish names concatenated) | 375 / 380 | Keyword-based craving/mood scoring, dish search |
| `cuisines` | 380, 28 values (Italian 72, American 56, Mediterranean 52, Steakhouse 39, Japanese 36…) | Mood axis, occasion signal |
| `flags` | vegetarian 188, gluten-free 166, vegan 95, outdoor 199, michelin 23, halal 11, kosher 10… | Dietary requirements, occasion signals (outdoor→date, michelin→celebration) |
| `min_price`/`max_price`/`prices` (40/50/65) | 380 | Occasion + value signal (23 restaurants top out at $40) |
| `serves` (`meal@DAY` tokens), `offers[]` | 380; dinner 352, brunch 68 | "Tonight," "this weekend," day/meal availability |
| `lat`/`lng` | 380 | "Near me tonight," distance sort |
| `blurb` | 380 (≥20 chars each) | Mood keyword signal, detail view |
| `image` | 380 (**restaurant-level only — no per-dish images**) | Visual entry tiles |
| `reserve` / `platform` | 339 | Booking CTA |

**The single most important structural fact:** courses are perfectly uniform. Every menu is
Appetizers / Entrees / Desserts with a real `choose N of M`. That means a food-first pivot —
"show me the entrees," "who has the best dessert course" — is a data-model reshaping we already
have the pieces for, not a scraping project.

**Research context.** Baymard's commissioned study found **60% of sites don't support thematic
queries** ("winter inners," "pool chair") and **84% can't handle subjective qualifiers**
("expensive," "best quality"). Craving/mood/occasion browse is exactly the gap they name. Caviar
already ships "browse by craving"; Uber Eats leads with dish-first visual tiles across cuisines;
Netflix's mood/occasion rows are the canonical "I don't know exactly what I want" pattern. All
three are buildable here because the fields exist. (Sources at end.)

---

## 1. Discovery entry points

The current app opens on the full 380-row list with an empty filter rail — a *"you already know
what to filter"* start. Proposal: add a **Discover** landing state above the list (the list is
one click, or one scroll, away and stays the default for returning/filtered sessions). Four entry
lanes, each a horizontally-scannable set of tiles that resolve to an ordinary `filters` object +
sort, so they compose with the existing engine and chips.

### 1a. By course / dish — the food-first door

**UI.** A four-chip segmented strip at the top of results: **All · Starters · Mains · Desserts**
(plus a persistent dish-search field). Selecting a course does two things:

1. Re-sorts and re-scopes the list to restaurants whose menus contain that course with real
   choice, and
2. **Changes what each row shows** — the row teaser and the expanded ladder lead with *that*
   course's items instead of the current "first entree" teaser.

A dedicated **"Best desserts"** / **"Most main-course choice"** tile is a one-field sort (see §3).

**Maps to data:** `menus[].courses[]` where `c.name` matches `/appetizer|starter/`, `/entree|main/`,
`/dessert/` (already normalized to three exact buckets). Choice depth = `c.of` / `c.choose`. Dish
search hits `dish_text` via the existing MiniSearch `dish_text` field — the index already exists;
it just needs a course-scoped surfacing. No new data.

### 1b. By mood / feeling / craving — the "I'm feeling…" door

**UI.** A row of ~7 mood tiles (Netflix/Caviar pattern), each a word + count:
*Light & fresh (140) · Rich & indulgent (95) · Seafood forward · Steak & fire · Comfort · World
& adventurous · Sweet tooth.* Tapping one applies a **mood preset** — a saved combination of
cuisine membership + flag + `dish_text` keyword scoring — and sorts by mood-fit. It renders as a
removable chip like any filter ("Mood: Light & fresh ×"), so it's transparent and undoable, not a
black box.

**Maps to data:** cuisines + flags + `dish_text` keyword scoring. Full taxonomy in §4. This is
the one lane that benefits from a cached score (see §4 / `derived/`), but a v1 runs live over
`dish_text` with zero new data.

### 1c. By occasion — the "who am I going with" door

**UI.** Tiles: *Date night · Group / celebration · Solo & quick · Big-night blowout ·
Al-fresco lunch · Weekend brunch.* Each maps to a filter+sort preset (details below). These are
the highest-intent queries and the ones precise facets serve worst, because "date night" is a
*blend* of price, ambience-flag, cuisine and availability that a user can't assemble by hand.

**Maps to data — every occasion is a real filter preset:**

| Occasion | Preset (fields) |
|---|---|
| **Date night** | `flags` includes `outdoor`; `min_price` ≥ 50; `meals` includes `dinner`; sort by price desc. Optionally boost `michelin`. |
| **Group / celebration** | `flags` includes `michelin` **or** `prices` includes 65; `serves` dinner; cuisines weighted to Steakhouse / Italian / Japanese (shareable formats). Sort `choice` (more dishes = easier for a table). |
| **Solo & quick / value** | `max_price` ≤ 40 (23 restaurants) **or** `meals` includes `lunch`; sort price asc. |
| **Big-night blowout** | `prices` includes 65 **and** `flags` includes `michelin`; sort price desc. |
| **Al-fresco** | `flags` includes `outdoor` (199); sort by mood or distance. |
| **Weekend brunch** | `serves` includes `brunch@SAT` or `brunch@SUN` (68 restaurants). |

No new data. Each is expressible today as an `emptyFilters()` object with a sort.

### 1d. "What's good near me tonight" — the context door

**UI.** A single prominent button: **"Open near me tonight."** On tap it requests geolocation,
then applies: today's weekday (from system date) + `dinner` meal + distance sort, and relabels
the sort control to **"Nearest"**. Rows gain a `0.4 mi` distance line. If the user declines
geolocation, it degrades to "Open tonight" (availability only, existing sort).

**Maps to data:** `serves` token `dinner@<TODAY>` (today's day is derivable — the app already
stamps `generated_at`); `lat`/`lng` for a haversine distance vs. the browser's position (all 380
have coordinates). Availability logic already exists in `matchesAvailability`. The only new code
is a haversine sort and a geolocation permission prompt — **no new data, no map dependency**
(this is a lightweight precursor to the Phase 2 Leaflet map, reusing the same coordinates).

---

## 2. How each entry point reuses the existing engine

Critically, **none of these are a parallel query path.** Each entry point is a function that
returns `{ filters, sort }` and pushes it into the existing `runQuery(f, sort)`. Consequences:

- Facet counts, chips, empty-state `relaxations`, and density all keep working unchanged.
- A user can start from a mood tile and then hand-tune the rail (add "Brickell," drop "$65").
  Discovery and precision compose instead of competing.
- Everything stays keyless and in-memory; discovery adds ~0 ms because it's the same filter pass.

Two engine additions are needed, both small and both belonging in `search.js` next to the
existing predicates:

1. **A `distance` sort** (haversine vs. a `userPos`), added to `SORTS`. Reads `lat`/`lng`.
2. **A mood-fit sort + predicate**, `moodScore(r, mood)` (§4), added alongside `choiceScore`.

Presets themselves are pure data — a `PRESETS` table mapping a tile id to a partial `filters` +
sort. That is the entire "IA" layer: a lookup table over the query engine that already exists.

---

## 3. Result display & detail view — toward food-first

Today's `Row` is restaurant-first: name → `cuisine · $$$ · hood` → one entree teaser → price /
when. That is correct for the default list and the density floor (8.5 rows / 900px) must not
regress. The proposal keeps the row shape and adds **food-first behavior on top of it**, plus a
richer detail view.

### 3a. Course-aware rows (cheap, high value)

- **Row teaser follows the active course.** `Row.svelte`'s `teaser` already picks "first entree";
  generalize it to pick from the *selected* course lane (§1a). In "Desserts" mode the teaser reads
  *"Guava cheesecake · Tres leches"* instead of a steak. Field: `menus[].courses[].items`.
- **Choice badge on the row.** Surface the thing the official site buries and that varies most:
  a compact `12 dishes` or `4 mains` count from `choiceScore` / per-course `c.of`. One mono token,
  no height cost.

### 3b. A dish-first result mode (medium)

Add a **view toggle: Restaurants ▢ / Dishes ▢**. Dishes mode flattens the current filtered set
into a dish list — each `menus[].courses[].items[]` entry becomes a row *"Grilled Spanish Octopus
— 107 Steak & Bar · Appetizer · Doral · $65."* This directly serves "course food" and
"I want octopus tonight." It reuses the MiniSearch `dish_text` field for the query and the same
filtered restaurant pool for scope; the flattening is a `flatMap` over the already-filtered
results. Density is preserved because dishes are even more homogeneous than restaurants — the same
row grammar applies. **No new data** (dish rows link back to their restaurant's row/detail).

### 3c. Detail view (expanded panel → optional full panel)

The expanded `CourseLadder` is already the strongest thing in the app. Enrich the panel, not the
row:

- **"Why it matches" line** when arrived via a mood/occasion tile — e.g. *"Matches Light & fresh:
  3 ceviche/crudo starters, seafood-forward."* Reads the same keyword hits that scored it. Makes
  the mood lane transparent (addresses the black-box risk of mood browse).
- **Signature dish highlight.** Pick 1–2 standout items per menu (see `derived/` note below) and
  set them in marine, the rest soft — a food-first focal point inside the ladder.
- **Blurb** (already present, currently unused in the row) belongs here as a two-line description.
- Keep booking / directions / details CTAs where they are.

### 3d. What stays fixed

Density floor, rows-not-cards, four type steps, one-accent palette, hard-edge shadows, live facet
counts, greyed-not-removed zero options. Discovery tiles use the same eyebrow-shadow slab and
`micro` labels; **no new uppercase role, no fifth type size, no gradient.** (DESIGN_REVIEW §5–6.)

---

## 4. Mood / craving taxonomy from existing fields

A mood is a **weighted score**, not a hard filter — because raw keyword ORs over-match (`salad`
appears as an appetizer nearly everywhere, so a naive "light & fresh" OR hits 303/380). The score
combines three signals per restaurant:

```
moodScore(r, mood) =
    2 * (cuisines ∩ mood.cuisines).length          // strongest signal
  + 1 * (flags ∩ mood.flags).length
  + w * (count of mood.keywords found in r.dish_text) / dishCount(r)   // density-normalized
```

Restaurants above a threshold enter the mood; the list sorts by score. Density-normalizing the
keyword term (hits per dish, not raw hits) is what stops big menus from dominating and stops
"salad-somewhere" from meaning "light."

### The seven moods (real mappings, measured against the data)

| Mood | Cuisines (×2) | Flags (×1) | `dish_text` keywords | Feasibility (raw OR) |
|---|---|---|---|---|
| **Light & fresh** | Japanese, Mediterranean, Peruvian, Greek, Seafood | vegan, low-glycemic, seed-oil-free | ceviche, crudo, tartare, tiradito, poke, gazpacho, hamachi, branzino, salad *(demote)* | ~140 after weighting |
| **Rich & indulgent** | Steakhouse, Italian, French | michelin | wagyu, truffle, foie, short rib, risotto, lobster, braised, bone marrow, burrata | 178 |
| **Seafood forward** | Seafood, Japanese, Peruvian, Spanish | — | salmon, tuna, branzino, snapper, octopus, shrimp, oyster, ceviche, crab, lobster | 324 |
| **Steak & fire** | Steakhouse, Argentinean, Brazilian | — | steak, filet, wagyu, picanha, ribeye, churrasco, skirt, chop, short rib | 258 |
| **Comfort** | American, Italian | — | burger, pasta, gnocchi, meatball, fried chicken, mac, pizza, frites, risotto | 179 |
| **World & adventurous** | Korean, Thai, Vietnamese, Moroccan, Indian, Peruvian | — | octopus, uni, sweetbread, tongue, bone marrow, escargot, kimchi, curry, harissa | 59 (deliberately narrow — it's a discovery reward) |
| **Sweet tooth** | Bakery & Sweets | — | chocolate, tiramisu, cheesecake, flan, gelato, churros, tres leches, key lime, dulce | 272 have a real dessert course |

(Counts are raw OR matches over `dish_text`, shown to prove the keyword sets fire against real
data; the shipped score weights and thresholds them so the moods are distinct rather than
overlapping supersets.)

**Two "feeling" axes that are pure flags, no keywords needed:**
- **Feed the table** → `flags` michelin or `prices` 65 + high `choiceScore`.
- **Keep it clean** (dietary-led mood) → `flags` AND of vegan/gluten-free, already the exact
  behavior of the flag facet.

### `derived/` — needs enrichment (flag it)

Everything above runs live with **no new data**. Two upgrades want the `derived/` folder that the
repo already anticipates (AI summaries keyed by restaurant id, so a re-scrape never clobbers them):

1. **Cached mood scores** `derived/moods.json` = `{ [restaurantId]: { light: 0.8, rich: 0.2, … } }`,
   computed offline in `prepare_data.py` from the same fields. Turns a per-keystroke scan into a
   lookup and lets a human correct obvious misses. **Optional** — v1 works without it.
2. **Signature-dish selection** `derived/signatures.json` = `{ [id]: ["Grilled Spanish Octopus"] }`.
   A dish name alone can't tell you which of 12 items is the standout; an AI pass over
   `blurb` + `dish_text` can nominate 1–2. Powers §3c's highlight. This is genuinely new judgment,
   not derivable from field membership — the one place enrichment earns its keep.

**Explicitly NOT derivable from current data (do not promise):** per-dish photos (only one
restaurant-level `image` exists), ratings/reviews (deep-linked, never fetched — CLAUDE.md), spice
level or portion size (not in the menu text reliably), ambience beyond `outdoor`.

---

## 5. Prioritization — staged by impact vs. cost

**Stage 1 — high impact, cheap (pure lookup tables + existing engine, no new data):**
- Course segmented strip (All / Starters / Mains / Desserts) + course-following row teaser (§1a, §3a).
- Occasion tiles as `PRESETS` over `runQuery` (§1c).
- Choice badge on rows (§3b, `choiceScore`).
- "Best desserts / most main choice" sorts — new entries in `SORTS`.
- Blurb into the expanded panel (§3c).

*All of Stage 1 is filter-object presets + surfacing fields that already load. Highest ratio of
"answers the owner's brief" to lines of code, and it stays fully within the lint's floors.*

**Stage 2 — high impact, moderate (small engine additions):**
- Mood tiles + live `moodScore` over `dish_text` (§1b, §4). Add `moodScore` beside `choiceScore`.
- "Open near me tonight" — geolocation + haversine `distance` sort (§1d). Reuses `lat`/`lng`,
  precursor to Phase 2's map.
- Dish-first view toggle (§3b) — a `flatMap` over filtered results.
- "Why it matches" transparency line (§3c).

**Stage 3 — higher cost, needs `derived/` enrichment:**
- `derived/moods.json` cached scores (perf + human correction).
- `derived/signatures.json` signature-dish highlight (§3c, §4) — the one true AI-enrichment task.
- Editorial occasion collections ("Critics' celebration picks") — curated id lists, human-authored.

**Deliberately deferred / out of scope:** per-dish imagery, ratings, natural-language search
(Phase 3 already deferred by choice), the full Leaflet map (Phase 2 — but §1d's geolocation is a
stepping stone that shares the coordinate data).

---

## Guardrails carried forward

- Every discovery tile resolves to a **transparent, removable chip** — nothing is a hidden query.
- Discovery **composes with** the filter rail; it never replaces `runQuery`, `facetCounts`, or
  `relaxations`.
- `spice.json` stays generated; any mood-keyword or signature logic lands in `prepare_data.py`,
  and both `verify.mjs` and `design-lint.mjs` run after — new sorts/predicates get a `verify.mjs`
  assertion against an independent pass, exactly as availability is asserted today.
- Density, four type steps, one accent, hard shadows, uppercase-in-two-roles: unchanged.

## Sources

- [Baymard — Product List & Filtering UX (2025 benchmark)](https://baymard.com/blog/current-state-product-list-and-filtering)
- [Baymard — Ecommerce Category Pages](https://baymard.com/learn/ecommerce-category-page) (thematic / subjective-qualifier query gap: 60% / 84%)
- [Baymard — Ecommerce Filter UI best practices](https://baymard.com/learn/ecommerce-filter-ui)
- Caviar "browse by craving," Uber Eats dish-first tiles, Netflix mood/occasion rows — discovery patterns for "I don't know exactly what I want."
