# Miami Spice — customer-first implementation roadmap

**Date:** 2026-08-01 · **Owner brief (verbatim):** *"I want to be a customer and easily navigate
the Miami Spice menu and decide what I want to do based on location, timing, cuisine, and craving."*

This roadmap **sequences** work that is already reasoned out in
[REVAMP_VISUAL.md](REVAMP_VISUAL.md) (the approved "Apple-polished, Deco-at-night Vice" look) and
[REVAMP_IA.md](REVAMP_IA.md) (the approved food-first information architecture). It does not
re-derive those; it turns them into an ordered build with the three new requirements the owner just
raised phased in explicitly:

1. a restaurant **detail view** with a per-restaurant **day × meal availability matrix** (Phase 3);
2. **intelligent interdependent filtering** the customer can trust (Phase 2);
3. a **cuisine-forward, discovery-first home page** to replace the empty-filter-rail cold start (Phase 4).

Every phase stays inside the two guardrails that already exist: `node app/verify.mjs` (behaviour,
counts checked against an independent pass over `spice.json`) and `node app/design-lint.mjs`
(0 critical, ≤1 slop tell, Apple/WCAG floors). No phase invents data that isn't in
`app/src/data/spice.json`.

---

## Product vision — from the customer's chair

*I open Miami Spice and it already knows I'm hungry, not that I'm ready to operate a filter panel. The
front door offers me the four ways I actually think — a cuisine I'm craving, a neighborhood I'll be
in, the night I'm free, or a mood ("something light," "date night") — and one tap turns any of those
into a live, honest list. As I narrow down, the app never lies to me: pick Saturday dinner and the
cuisines that can't serve it grey out with their real counts, so I never chase a combination into a
dead end. When one restaurant catches my eye I can see, at a glance, exactly which meals it serves on
which days — a little grid, not a paragraph I have to decode — plus its full three-course menu and a
button that books it. It's fast, it's local, it never asks me to log in, and it looks like Miami at
night, not like every other generated app.*

---

## The ground truth this roadmap is built on

Measured from `app/src/data/spice.json` (380 restaurants; 375 with published menus/`serves`; 5 with
none, already handled by the "menu not published" state):

| Fact | Value | Why it matters here |
|---|---|---|
| Restaurants with **per-meal-varying day-sets** | **123 / 380** | The single strongest justification for the availability matrix (Phase 3): for a third of the directory, "which meal on which day" genuinely differs by meal — a one-line summary loses that. |
| Restaurants **not** serving all 7 days | **173 / 380** | A schedule grid conveys real information; a "Daily" assumption would be wrong for ~46% of the list. |
| Meals | dinner 349 · lunch 217 · **brunch 68** | Timing lanes ("weekend brunch", "tonight") map to real cohorts. |
| Cuisines | **28** (Italian 72, American 56, Mediterranean 52, Steakhouse 39, Japanese 36, International 34…) | Cuisine-forward home tiles have real weight and counts. |
| Neighborhoods | **38** (South Beach 67, Downtown 66, Brickell 60, Coral Gables 30, Coconut Grove 27…) | Location lane + "near me" have coverage. |
| Price caps at $40 | 26 · caps including $65 | "Value" and "big-night" occasion presets are real filters. |
| Amenity flags | outdoor 199 · michelin 23 · vegetarian 188 · vegan 95 · gluten-free 166 | Occasion/mood presets and dietary AND-facet already supported. |
| `lat`/`lng`, `blurb`, `image` | 380 / 380 / 380 | "Near me", mood keywords, tile imagery — no scrape needed. (Only **restaurant-level** image; no per-dish photos.) |

The query engine that all of this rides on is one `Array.filter` pass in
[`app/src/lib/search.js`](app/src/lib/search.js): `runQuery(f, sort)`, `facetCounts(f)`,
`relaxations(f)`, `SORTS`, and the per-facet `PREDICATES`. Every phase below composes with that engine
rather than forking a second query path — the design rule from REVAMP_IA §2.

---

## Phase sequence

| Phase | Title | Effort | Status |
|---|---|---|---|
| 1 | Visual foundation — "Apple-polished, Deco-at-night Vice" (AM/PM) | L | **Done** |
| 2 | Trustworthy interdependent filtering (req #2) | S–M | Next |
| 3 | Restaurant detail view + day × meal availability matrix (req #1) | M–L | High value |
| 4 | Discovery-first, cuisine-forward home (req #3) | M | High value |
| 5 | Food-first IA — course strip, course-aware rows, dish-first view | M | Deeper IA |
| 6 | Mood/craving scoring + occasion presets + "near me tonight" | M–L | Deeper IA |
| 7 | Enrichment via `derived/` — cached moods, signature dishes, editorial collections | L | Last |

---

### Phase 1 — Visual foundation: "Apple-polished, Deco-at-night Vice" — DONE

**Goal.** A bold-but-lint-clean AM/PM design system so every later phase inherits a finished visual
language instead of retrofitting one. Reasoning in [REVAMP_VISUAL.md](REVAMP_VISUAL.md); proven first
in the approved specimen [`app/specimen/vice-revamp.html`](app/specimen/vice-revamp.html), exactly as
Tropical Deco was proven before it.

**Delivered.**
- **Role-based, two-theme token system** — `--field / --raised / --sunk`, `--ink / --soft`,
  `--rule / --hair`, `--marine`, the new `--signal` (a toned Vice-cyan that carries the *second*
  interactive job so marine and flamingo keep their single jobs), `--flamingo` (price only). AM
  "Ocean Drive" (default) and PM "Chrome Night", the hue's job fixed while only luminance flips.
- **Poiret One** display face (`--f-deco`, self-hosted via `@fontsource`) for the wordmark and section
  heads only; **Jost** workhorse and **IBM Plex Mono** for tabular data unchanged.
- **Five-step scale** 12 / 15 / 19 / 30 / 44→56, every adjacent pair ≥1.25×.
- **The horizon eyebrow** (one full-bleed `6px 6px 0` zero-blur slab) and the **signage price chip**
  (the one saturated object per row); hard shadows, never glow.

**Files.** `app/src/app.css`, `app/src/App.svelte`, `app/src/components/*.svelte`, `app/index.html`
(`@fontsource/poiret-one`), reference `app/specimen/vice-revamp.html`. **Data:** none new.

**Verification (green).** `design-lint.mjs` at 0 critical / 0 slop tells; `verify.mjs` green with the
AM/PM contrast pairs asserted (PM neon confined to ≤5% of pixels, never behind text, never blurred),
no horizontal overflow at 390/320px. Every later phase **must keep both green** — that is the
acceptance floor for the whole roadmap.

---

### Phase 2 — Trustworthy interdependent filtering (req #2)

**Goal.** The customer can trust that day/meal, cuisine, price, neighborhood and dietary facets always
reflect one another: pick Saturday dinner and the cuisines that can't serve it grey out with honest
counts, and vice-versa — no dead ends, no stale numbers.

**Audit — does the existing engine already deliver this? Mostly yes.** `facetCounts(f)` in
[`search.js`](app/src/lib/search.js) already implements true interdependence, and it is worth being
precise about what is done vs. missing so this phase stays small:

*Already correct (keep, don't rebuild):*
- **Self-excluding recomputation.** For facet X, `poolFor(skip=X)` applies every *other* active facet
  first, then counts each option of X against that pool — the exact behaviour Baymard calls "one of
  the single highest-impact improvements you can make to a filter UI"
  ([Baymard — Ecommerce Filter UI](https://baymard.com/learn/ecommerce-filter-ui)).
- **Day/meal ↔ cuisine interplay exists today.** `counts.days` and `counts.meals` are recomputed
  against the current cuisine/price/flag selection; `counts.cuisines` is recomputed against the
  current day/meal selection. Selecting Saturday+dinner already changes Italian's number and vice-versa.
- **Disable-not-remove.** Zero options are `disabled` and greyed in `FacetGroup.svelte` and
  `DayMealGrid.svelte`, never removed — preserving spatial memory. This is a *deliberate* divergence
  from the "delete zero options" school; Baymard's own position (disable rather than necessarily
  delete) supports it, and the rationale comment must stay.
- **Live, zero-latency updates.** `$derived` recomputes on every change (~1 ms over 380 rows), which is
  the interactive-filtering mode NN/g recommends for exploratory users on a fast dataset
  ([NN/g — Applying Filters](https://www.nngroup.com/articles/applying-filters/)).
- **Applied filters stay visible and removable** as chips (`App.svelte` `chips`) — Baymard flags that
  20% of sites fail this.

*Concrete gaps / UX improvements this phase adds:*
1. **Day counts are invisible.** `DayMealGrid` shows a count on each *meal* button but the per-day
   count only lives in the `title` tooltip. Surface a compact count (or at minimum keep the greyed
   disabled state visually obvious) so the day↔meal↔cuisine interplay is legible without hovering.
2. **An "N match" affordance at the point of choice.** The results bar has a live `aria-live` count,
   but the customer choosing a facet in the rail can't see the consequence without looking away. Echo
   the running "N restaurants" beside the rail header and on every discovery tile (Phase 4 consumes
   this), the count-next-to-option pattern NN/g ties directly to avoiding zero-result surprises
   ([NN/g — Ecommerce Search report](https://www.nngroup.com/reports/ecommerce-ux-search-including-faceted-search/)).
3. **Make the OR/AND logic self-describing.** Cuisine/neighborhood/price OR within the facet; dietary
   & amenities AND. Add a one-line `.micro` caption to the Dietary group ("all selected are required")
   so the different maths is telegraphed by the UI, not just documented — Baymard notes users abandon
   when multi-select logic is ambiguous.
4. **Use `--signal`** (Phase 1) to mark the self-excluded facet currently being counted, so marine
   (selected) and the counted state never visually collide (REVAMP_VISUAL §4).

**Files / functions.** `app/src/lib/search.js` (`facetCounts` already returns `days`/`meals`; no
engine change needed — optionally add a tiny `wouldMatch(f, patch)` helper for tile previews used in
Phase 4). `app/src/components/DayMealGrid.svelte` (render day counts), `FacetGroup.svelte` (dietary
caption), `App.svelte` (running-count echo near the rail). **Data:** `serves` (`meal@DAY`), `cuisines`,
`hoods`, `prices`, `flags` — all existing.

**Effort.** S–M (mostly surfacing, not new engine logic). **Depends on:** Phase 1 (`--signal`, tokens).

**Verification.** New `verify.mjs` assertions, each checked against an independent pass over
`spice.json`, exactly as availability is asserted today: (a) after selecting **Saturday + dinner**, the
count rendered on the **Italian** option equals `restaurants.filter(Italian ∧ serves lunch? no — dinner@SAT)`
independent count; (b) selecting **Italian** greys ≥1 day cell whose independent count is 0; (c)
selecting a cuisine changes a specific meal button's count. `design-lint.mjs` unaffected (no new type
step, no new uppercase role — the dietary caption reuses `.micro`).

---

### Phase 3 — Restaurant detail view + day × meal availability matrix (req #1)

**Goal.** On any restaurant, the customer sees at a glance **exactly which meals (brunch / lunch /
dinner) are served on which days (Mon–Sun)** — a grid, not a sentence — alongside the full three-course
menu, dietary flags, blurb, and booking. This is the highest-value net-new customer feature and the
scraper source fix means `serves`/`offers` are now accurate enough to render truthfully.

**Why a matrix and not just a line.** 123/380 restaurants serve *different day-sets per meal* and
173/380 don't serve all 7 days, so "Dinner $65 · Fri, Sat" alone hides the shape. The matrix pattern
should stay tightly constrained to the two axes that matter — **7 days × up to 3 meal-periods** — not a
24-hour scheduler; scheduler components explicitly recommend restricting visible days/time-range to the
meaningful window ([Mobiscroll — visible hours/days](https://demo.mobiscroll.com/scheduler/show-hide-hours-days)).

**Component & data mapping.** New `app/src/components/ScheduleMatrix.svelte`.
- **Source of truth:** the `serves` array of `meal@DAY` tokens. Add a pure helper `serveMatrix(r)` to
  `search.js` returning `{ meal: Set<DAY> }` for the meals the restaurant actually offers (chronological
  via `MEAL_ORDER`, filtered to `r.meals`), plus per-meal price pulled from `r.offers[].price`.
- **Cell semantics:** a `meal@DAY` token present → **served** (marine fill / on-state); absent →
  **not served** (`--sunk`, greyed) — the same disable-not-remove vocabulary as the facets, so the grid
  reads consistently with the rest of the app. No cell is a control; it is a data display.

**Desktop rendering.** A 7-column grid: `Mon Tue Wed Thu Fri Sat Sun` header in mono single letters;
one row per meal-period, each row labelled with the meal and its `$` price chip (flamingo, mono). Filled
cells marine, empty cells hairline. Reuses the eyebrow/`--rule` language; no new tokens.

**Mobile rendering.** Availability is sparse for most restaurants, and a horizontally-scrolling table
is the classic mobile failure. Below ~560px the matrix **collapses to a compact "meal → days served"
summary list** using the existing `dayRange()` formatter — e.g. *"Dinner $65 · Fri–Sat", "Brunch $40 ·
Sun"* — which also matches the shipped copy rule and mirrors the timeline-summary-over-dense-grid
guidance for sparse schedules ([Mobiscroll — timeline vs time-grid](https://demo.mobiscroll.com/timeline/timeline-time-grid)).
This is the same responsive strategy `DayMealGrid` already uses (auto-fit, never shrink a cell below
the 44px floor).

**Where it lives.** The expanded row panel (`Row.svelte` → `CourseLadder`) is already the strongest
surface in the app; the detail view **enriches that panel** rather than forcing a route: `ScheduleMatrix`
at the top of the panel, then the course ladder, then `blurb` as a two-line description (currently
loaded but unused in the row), then flags and the existing Book / Directions / Details CTAs. Keeping it
inline preserves the density floor. (A fully routed detail page is possible later but is *not* required
to satisfy req #1 and would cost the single-page simplicity — deferred, see out-of-scope.)

**Files / functions.** New `app/src/components/ScheduleMatrix.svelte`; `app/src/lib/search.js`
(`serveMatrix(r)` helper, reusing `MEAL_ORDER`, `dayRange`, `offers`); `app/src/components/Row.svelte`
(mount matrix + blurb in the panel). `prepare_data.py` needs **no change** — `serves`/`offers` are the
accurate source; the 5 restaurants without `serves` fall through to the existing "menu not published"
state. **Data:** `serves`, `offers` (price), `menus`, `blurb`, `flags`, `reserve`/`platform`/`maps`/`url`.

**Effort.** M (L only if a routed full-page detail is chosen). **Depends on:** Phase 1 (price chip,
eyebrow, tokens).

**Verification.** New `verify.mjs` checks against an independent pass: open a known restaurant (e.g.
*107 Steak and Bar*), assert every `meal@DAY` token in its `serves` maps to a filled matrix cell and
every absent token maps to a greyed cell; assert the per-meal price shown equals `offers[].price`;
assert the mobile summary line for a brunch-only-Sunday place reads via `dayRange`. `design-lint.mjs`:
matrix type ≥11px, contrast ≥ floors in **both** themes, no horizontal overflow at 320/390px (the grid
*must* have reflowed to the summary), and density of the result list itself unchanged (the matrix is
inside the already-open panel, not the collapsed row).

---

### Phase 4 — Discovery-first, cuisine-forward home (req #3)

**Goal.** Replace the empty-filter-rail cold start with a **front door**: the customer starts from a
cuisine, a neighborhood, a time, or a craving — the four ways they actually arrive — and one tap becomes
a live filtered list. The filter rail stays; this is a new entry surface *above* it, sketched already in
the approved specimen's `.discover` section.

**Why.** NN/g frames the homepage as the "front door" and a "safe harbor," which must convey purpose
immediately ([NN/g — Homepage Usability](https://www.nngroup.com/books/homepage-usability/)); an empty
filter shell conveys "you already know what to filter." The dominant industry pattern is tappable
cuisine/category entry points as the *primary* browse mechanism (DoorDash surfaces American, Italian,
Mexican, Sushi, Thai, Pizza as top-of-app chips —
[DoorDash categories](https://www.lemon8-app.com/@rhinonicole8/7461460225468580398?region=us)), plus a
content-first home feed (Yelp's redesign replaced search-first with a Home Feed of local highlights and
popular dishes — [Yelp redesign](https://www.aol.com/news/yelp-updates-android-app-redesigned-130048784.html)),
and curated collections as shortcuts (DoorDash "Top 10 Lists" —
[DoorDash newsroom](https://about.doordash.com/en-us/news/introducing-new-ways-for-consumers-to-easily-discover-popular-and-trusted-eats-in-their-neighborhood)).

**Features.** A **Discover** landing state renders when `isEmpty(f)` and there's no text query; the list
is one scroll (or one tap of "Browse all 380") away and stays the default for filtered/returning
sessions. Four lanes, each a horizontally-scannable set of tiles that resolve to a `{ filters, sort }`
object pushed into the existing `runQuery` — **not a parallel query path** (REVAMP_IA §1–2):
- **By cuisine** — tiles for the top cuisines with live counts (Italian 72, American 56, Mediterranean
  52, Steakhouse 39, Japanese 36…).
- **By location** — tiles for the top neighborhoods (South Beach 67, Downtown 66, Brickell 60…), plus a
  prominent **"Open near me tonight"** button (full behaviour lands in Phase 6; here it degrades to
  "Open tonight" = today's weekday + dinner, no geolocation dependency yet).
- **By timing** — "Weekend brunch (68)", "Lunch under $40 (26)", "Tonight".
- **By craving / occasion** — Date night · Group / celebration · Solo & value · Al-fresco (199 outdoor).
  Each is a `PRESETS` entry (a partial `filters` + sort), the highest-intent queries that precise facets
  serve worst, modeled on Infatuation's finite "Perfect For" tag set
  ([Infatuation — Perfect For / Date Night](https://www.theinfatuation.com/los-angeles/perfect-for/date-night)).

Tiles reuse the `FacetGroup` slab styling and obey the same disable-zero-count rule (Phase 2), so a tile
that would return nothing greys instead of dead-ending.

**Files / functions.** New `app/src/components/Discover.svelte` (or promote the specimen `.discover`
markup); `app/src/lib/search.js` (`PRESETS` lookup table + `applyPreset(id) → {filters, sort}`, pure
data); `app/src/App.svelte` (render `Discover` on cold start, "Browse all" affordance, wire tile →
`f = { ...emptyFilters(), ...preset.filters }`). **Data:** `cuisines`, `hoods`, `serves`, `prices`,
`flags`, `lat`/`lng`.

**Effort.** M. **Depends on:** Phase 1 (tile styling), Phase 2 (counts must be trustworthy before they
headline a tile).

**Verification.** New `verify.mjs` assertions against independent passes: clicking the **Italian** tile
yields the same result count as selecting the Italian facet; the **"Weekend brunch"** tile count equals
`serves ∋ brunch@SAT ∨ brunch@SUN`; the **"Solo & value"** preset equals `max_price ≤ 40`; Discover is
present on cold load and hidden once any filter is applied. `design-lint.mjs`: tiles ≥44px targets, no
fifth uppercase role, list stays rows (density floor intact).

---

### Phase 5 — Food-first IA: course strip, course-aware rows, dish-first view

**Goal.** Let the customer browse by **course and dish**, not only by restaurant — the "course food"
half of the owner's brief. The menu taxonomy is already perfectly uniform (Appetizers / Entrees /
Desserts, ~669/669/670 restaurants), so this is a reshaping we have the pieces for, not a scrape.

**Features (REVAMP_IA §1a / §3a / §3b).**
- **Course segmented strip:** All · Starters · Mains · Desserts. Selecting a course re-scopes the list
  to restaurants whose menus contain that course with real `choose N of M`, and **changes the row teaser**
  to lead with that course's items (in Desserts mode the teaser reads "Guava cheesecake · Tres leches",
  not a steak).
- **Course-aware row + choice badge:** generalize `Row.teaser` (today "first entree") to the selected
  course; add a compact `12 dishes` / `4 mains` badge from `choiceScore` / per-course `c.of` — one mono
  token, no height cost, surfacing the thing the official site buries.
- **Dish-first view toggle (Restaurants / Dishes):** flattens the *already-filtered* set into dish rows
  via `flatMap` over `menus[].courses[].items[]` — "Grilled Spanish Octopus — 107 Steak & Bar ·
  Appetizer · Doral · $65." Reuses the existing MiniSearch `dish_text` field for the query; density is
  preserved because dishes are even more homogeneous than restaurants (rows, per
  [NN/g — Cards](https://www.nngroup.com/articles/cards-component/)).
- **New sorts:** "Best desserts" / "Most main-course choice" — one-field entries in `SORTS`.

**Files / functions.** `app/src/lib/search.js` (`SORTS` additions; a course-scoping predicate; a dish
`flatMap` helper), `Row.svelte` (course-aware teaser + choice badge), `App.svelte` (course strip + view
toggle), optional new `DishRow.svelte`. **Data:** `menus[].courses` (`name`/`choose`/`of`/`items`),
`dish_text`.

**Effort.** M. **Depends on:** Phase 1; Phase 4 (the course strip *is* discovery lane 1a — build once).

**Verification.** `verify.mjs`: "Most main-course choice" sort orders by an independent per-course `of`
sum; Dishes-mode item count equals the `flatMap` length over the filtered pool; the "Desserts" strip
scopes to restaurants with a real (`of > 0`) dessert course. `design-lint.mjs`: dish mode stays rows
(density), no new type step or uppercase role.

---

### Phase 6 — Mood/craving scoring + occasion presets + "near me tonight"

**Goal.** The "I'm feeling…" and "what's good near me tonight" doors — the subjective and the
contextual queries precise facets can't assemble. Baymard's commissioned study found 84% of sites can't
handle subjective qualifiers and 60% can't handle thematic queries; this is exactly that gap
([Baymard — Ecommerce Filter UI](https://baymard.com/learn/ecommerce-filter-ui)).

**Features (REVAMP_IA §1b / §1d / §4).**
- **`moodScore(r, mood)`** added beside `choiceScore` in `search.js`:
  `2×|cuisines ∩ mood.cuisines| + 1×|flags ∩ mood.flags| + w×(keyword hits in dish_text)/dishCount(r)`.
  Density-normalizing the keyword term is what stops big menus and "salad-somewhere" from dominating.
  Seven moods (Light & fresh, Rich & indulgent, Seafood forward, Steak & fire, Comfort, World &
  adventurous, Sweet tooth), each mapped to real cuisine/flag/keyword sets already measured against the
  data. A mood tile applies a preset and sorts by fit, rendering as a **removable chip** ("Mood: Light
  & fresh ×") so it is transparent and undoable, never a black box — and a **"why it matches"** line in
  the detail panel shows the hits that scored it. This mirrors DoorDash's cross-cuisine craving
  carousels ("Healthy enough" spanning Thai/Mediterranean/Mexican —
  [DoorDash healthy](https://blog.doordash.com/en-us/post/healthy-food-delivery)) and Infatuation's
  composable mood-plus-logistics guides.
- **`distance` sort + "Open near me tonight":** add a haversine `distance` sort to `SORTS` (vs a
  `userPos`), request geolocation on tap, then apply today's weekday + `dinner` + Nearest, relabel the
  sort, and add a `0.4 mi` line to rows. Declining geolocation degrades to "Open tonight" (availability
  only). Reuses `lat`/`lng` for all 380 — a lightweight **precursor to the deferred Phase-2 map** that
  shares the exact coordinate data, no map dependency.

**Files / functions.** `app/src/lib/search.js` (`moodScore`, `MOODS` table, `distance` sort,
`userPos`), `App.svelte` (mood tiles, near-me button, permission prompt), `Row.svelte`/detail panel
("why it matches" + distance line). **Data:** `cuisines`, `flags`, `dish_text`, `lat`/`lng`, `serves`.

**Effort.** M–L. **Depends on:** Phase 4 (tile framework), Phase 5 (dish/course surfacing feeds the
"why it matches" line).

**Verification.** `verify.mjs`: `moodScore` is deterministic, so assert a known ceviche/crudo-heavy
restaurant lands in "Light & fresh" above a known steakhouse, and that the density-normalized keyword
term keeps a large generic menu *out* of "Light & fresh" (guards the over-match failure mode); assert
`distance` sort orders a fixed set correctly against a fixed `userPos`. `design-lint.mjs` unaffected
(tiles reuse existing styling).

---

### Phase 7 — Enrichment via `derived/` — cached moods, signatures, editorial collections

**Goal.** Performance and *human-correctable judgment* the raw fields can't express, stored in the
`derived/` folder the repo already anticipates (keyed by restaurant id so a re-scrape never clobbers it).

**Features (REVAMP_IA §4 "needs enrichment").**
- **`derived/moods.json`** — cached `moodScore` per restaurant, computed offline in `prepare_data.py`
  from the same fields; turns the per-keystroke scan of Phase 6 into a lookup and lets a human correct
  obvious misses. (Phase 6 works without it; this is the optimization + correction pass.)
- **`derived/signatures.json`** — 1–2 signature dishes per menu nominated by an AI pass over
  `blurb` + `dish_text`; a dish name alone can't tell you which of 12 items is the standout. Powers a
  signature-dish highlight in the detail panel (marine on the standout, soft on the rest). This is the
  one genuinely new judgment, not derivable from field membership — where enrichment earns its keep.
- **Editorial occasion collections** — human-authored curated id lists ("Critics' celebration picks"),
  the fixed-set analogue of DoorDash's dynamic "Top 10 Lists"
  ([DoorDash newsroom](https://about.doordash.com/en-us/news/introducing-new-ways-for-consumers-to-easily-discover-popular-and-trusted-eats-in-their-neighborhood)).

**Files / functions.** `scraper/prepare_data.py` (emit/merge `derived/` keyed by id — never overwrite
human edits), `derived/*.json`, `app/src/lib/search.js` (load `derived`, `moodScore` reads cache when
present), detail panel (signature highlight). **Data:** `derived/` keyed by id, reading `blurb`,
`dish_text`, `menus`.

**Effort.** L. **Depends on:** Phase 6 (`moodScore` definition), Phase 3 (detail panel for the highlight).

**Verification.** `verify.mjs`: cached mood scores match live `moodScore` within tolerance; **every**
signature dish name exists in that restaurant's own `items` (a hard guard against a hallucinated dish —
the one place generated content touches the UI); and a re-run of `prepare_data.py` leaves `derived/`
edits intact (keyed-by-id survives regeneration). `design-lint.mjs` unaffected.

---

## Complete feature inventory

| Feature | Phase | Effort | Status |
|---|---|---|---|
| AM/PM role-based token system + `--signal` | 1 | L | Done |
| Poiret One wordmark (`--f-deco`) | 1 | S | Done |
| Five-step type scale (12/15/19/30/44) | 1 | S | Done |
| Horizon eyebrow + signage price chip | 1 | M | Done |
| PM-theme contrast pairs asserted in verify | 1 | S | Done |
| Self-excluding live facet counts (`facetCounts`) | 1/2 | M | Done (audit-confirmed) |
| Disable-not-remove zero options | 1/2 | S | Done |
| Day counts surfaced on `DayMealGrid` | 2 | S | Planned |
| Running "N match" echo at point of choice | 2 | S | Planned |
| Self-describing OR/AND caption (dietary) | 2 | S | Planned |
| `--signal` marks the self-excluded counted facet | 2 | S | Planned |
| `serveMatrix(r)` helper | 3 | S | Planned |
| `ScheduleMatrix.svelte` (7×3 grid, desktop) | 3 | M | Planned |
| Matrix mobile collapse → meal→days summary | 3 | S | Planned |
| Detail panel: matrix + blurb + flags + CTAs | 3 | M | Planned |
| Discover landing (renders on cold start) | 4 | M | Planned |
| Cuisine tiles with live counts | 4 | S | Planned |
| Neighborhood/location tiles | 4 | S | Planned |
| Timing tiles (brunch, lunch<$40, tonight) | 4 | S | Planned |
| Occasion presets (`PRESETS` table) | 4 | M | Planned |
| "Browse all 380" affordance | 4 | S | Planned |
| Course segmented strip (All/Starters/Mains/Desserts) | 5 | M | Planned |
| Course-aware row teaser | 5 | S | Planned |
| Choice badge on rows | 5 | S | Planned |
| Dish-first view toggle | 5 | M | Planned |
| "Best desserts" / "Most main choice" sorts | 5 | S | Planned |
| `moodScore` + seven-mood taxonomy | 6 | M | Planned |
| Mood tiles → preset + fit sort + removable chip | 6 | M | Planned |
| "Why it matches" transparency line | 6 | S | Planned |
| `distance` sort (haversine) | 6 | S | Planned |
| "Open near me tonight" (geolocation, degrades) | 6 | M | Planned |
| `derived/moods.json` cached scores | 7 | M | Planned |
| `derived/signatures.json` signature dishes | 7 | L | Planned |
| Editorial occasion collections | 7 | M | Planned |

---

## Deferred / out of scope

Each is a deliberate exclusion, with the reason:

- **Phase 2 Leaflet map** (Leaflet + OpenFreeMap + markercluster synced to the filtered set, needs a
  light basemap). Real, but heavier than the customer-first wins above; Phase 6's "near me tonight"
  reuses the same `lat`/`lng` as the low-cost precursor.
- **Natural-language search** — deferred by choice (README Phase 3).
- **A fully routed, separate detail *page*** — the enriched inline panel (Phase 3) satisfies req #1
  while preserving the one-page, no-router simplicity; a route is a later option, not a requirement.
- **Per-dish photos** — only a restaurant-level `image` exists; there is no per-dish imagery to show,
  and none is promised.
- **Ratings / reviews** — deep-linked, never fetched. Yelp, Google Places and Tripadvisor forbid
  caching their content (CLAUDE.md); do not add a review API.
- **Live reservation availability / time-slot booking** — OpenTable/Resy expose date/time/party-size
  slot grids ([observed pattern, PageCrawl](https://pagecrawl.io/blog/restaurant-reservation-availability-alerts)),
  but we have no booking API and deep-link out to their platforms instead.
- **Spice level, portion size, ambience beyond `outdoor`** — not reliably present in the menu text; do
  not invent them.

---

## Guardrails carried through every phase

- **One engine, not two.** Every discovery tile, mood, preset and sort resolves to a `{ filters, sort }`
  object into the existing `runQuery` / `facetCounts` — so chips, `relaxations`, density and the AM/PM
  system keep working unchanged (REVAMP_IA §2).
- **`spice.json` is generated.** Any keyword, mood, or signature logic lands in `prepare_data.py`, and
  **both** `verify.mjs` and `design-lint.mjs` run after every change to filters, colours, or markup —
  a new sort/predicate gets a `verify.mjs` assertion against an independent pass, exactly as
  availability is asserted today.
- **The lint floors are the acceptance test, not vigilance.** 0 critical / ≤1 slop tell; 11px type,
  44px targets, 7:1 small-text and 3:1 UI-boundary contrast in **both** themes; four→five deliberate
  type steps; two uppercase roles only; rows-not-cards density ≥5/900px. If a phase needs to change a
  rule, edit the rule and write down why — never work around it.

## Sources

**Faceted / interdependent search (primary):**
[Baymard — Ecommerce Filter UI](https://baymard.com/learn/ecommerce-filter-ui) ·
[NN/g — Applying Filters (interactive vs batch)](https://www.nngroup.com/articles/applying-filters/) ·
[NN/g — Ecommerce Search UX report](https://www.nngroup.com/reports/ecommerce-ux-search-including-faceted-search/) ·
[NN/g — Cards: UI-Component Definition](https://www.nngroup.com/articles/cards-component/) ·
[NN/g — Homepage Usability](https://www.nngroup.com/books/homepage-usability/) ·
[Baymard — Product List & Filtering 2025](https://baymard.com/blog/current-state-product-list-and-filtering)

**Location + timing + cuisine browse / discovery front doors:**
[OpenTable time-slot behaviour (observed) — PageCrawl](https://pagecrawl.io/blog/restaurant-reservation-availability-alerts) ·
[OpenTable availability (observed) — Apify](https://apify.com/clearpath/opentable-availability-api) ·
[DoorDash cuisine categories](https://www.lemon8-app.com/@rhinonicole8/7461460225468580398?region=us) ·
[DoorDash Top 10 Lists / discovery — newsroom](https://about.doordash.com/en-us/news/introducing-new-ways-for-consumers-to-easily-discover-popular-and-trusted-eats-in-their-neighborhood) ·
[DoorDash cross-cuisine craving carousels](https://blog.doordash.com/en-us/post/healthy-food-delivery) ·
[Yelp home-feed redesign](https://www.aol.com/news/yelp-updates-android-app-redesigned-130048784.html) ·
[Infatuation — "Perfect For" occasion tags](https://www.theinfatuation.com/los-angeles/perfect-for/date-night)

**Availability-matrix / schedule UI:**
[Mobiscroll — restrict visible hours/days](https://demo.mobiscroll.com/scheduler/show-hide-hours-days) ·
[Mobiscroll — timeline vs time-grid (sparse data)](https://demo.mobiscroll.com/timeline/timeline-time-grid)

**Design standard (carried from the existing docs):**
[REVAMP_VISUAL.md](REVAMP_VISUAL.md) · [REVAMP_IA.md](REVAMP_IA.md) · [VICE_DIRECTION.md](VICE_DIRECTION.md) ·
[DESIGN_REVIEW.md](DESIGN_REVIEW.md) · [Apple HIG — Typography](https://developers.apple.com/design/human-interface-guidelines/foundations/typography/) ·
[WCAG 2.2](https://www.w3.org/TR/WCAG22/)
