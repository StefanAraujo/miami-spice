/**
 * The whole query engine. Loads once, filters in memory, never touches the
 * network again (BUILD_PLAN §1).
 *
 * Two independent layers that compose:
 *   1. MiniSearch  — fuzzy full-text over name / cuisine / hood / blurb / dishes
 *   2. predicates  — pure set-membership tests over the denormalized fields
 *
 * The `serves` array of `meal@DAY` composite tokens is what makes layer 2
 * trivial: "Italian serving lunch AND dinner on Saturday" is three `includes`
 * calls, no nested traversal (BUILD_PLAN §3).
 */
import MiniSearch from 'minisearch'
import data from '../data/spice.json'

export const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
export const DAY_LABEL = { MON: 'Mon', TUE: 'Tue', WED: 'Wed', THU: 'Thu', FRI: 'Fri', SAT: 'Sat', SUN: 'Sun' }
export const MEAL_LABEL = { brunch: 'Brunch', lunch: 'Lunch', dinner: 'Dinner' }
/** Chronological, not alphabetical — the facet list arrives sorted A–Z. */
export const MEAL_ORDER = ['brunch', 'lunch', 'dinner']

export const restaurants = data.restaurants
export const facets = data.facets
export const generatedAt = data.generated_at

const byId = new Map(restaurants.map((r) => [r.id, r]))
export const getById = (id) => byId.get(id)

/* ---------------------------------------------------------------- text ---- */

const mini = new MiniSearch({
  idField: 'id',
  fields: ['name', 'cuisineText', 'hoodText', 'blurb', 'dish_text'],
  storeFields: [],
  searchOptions: {
    prefix: true,
    fuzzy: 0.2,
    boost: { name: 4, cuisineText: 2, hoodText: 2, dish_text: 1 },
  },
})

mini.addAll(
  restaurants.map((r) => ({
    id: r.id,
    name: r.name,
    cuisineText: r.cuisines.join(' '),
    hoodText: r.hoods.join(' '),
    blurb: r.blurb,
    dish_text: r.dish_text,
  })),
)

/** Ordered ids for a text query, or null when the query is empty. */
export function textMatchIds(query) {
  const q = (query || '').trim()
  if (!q) return null
  return mini.search(q).map((hit) => hit.id)
}

/* ----------------------------------------------------------- predicates ---- */

export const emptyFilters = () => ({
  query: '',
  days: [],
  meals: [],
  cuisines: [],
  hoods: [],
  prices: [],
  flags: [],
})

export const isEmpty = (f) =>
  !f.query.trim() &&
  !f.days.length && !f.meals.length && !f.cuisines.length &&
  !f.hoods.length && !f.prices.length && !f.flags.length

const someIn = (values, selected) => selected.some((s) => values.includes(s))
const everyIn = (values, selected) => selected.every((s) => values.includes(s))

/**
 * Availability is the only non-obvious rule, so it is spelled out:
 *
 *   days + meals  → the restaurant must serve EVERY selected meal on at least
 *                   ONE selected day. "Lunch and dinner, Sat or Sun" is the
 *                   query people actually mean; requiring every meal on every
 *                   day would return almost nothing.
 *   days only     → open for anything on at least one selected day
 *   meals only    → offers every selected meal, any day
 */
export function matchesAvailability(r, days, meals) {
  if (!days.length && !meals.length) return true
  if (!days.length) return everyIn(r.meals, meals)
  if (!meals.length) return someIn(r.days, days)
  return days.some((d) => meals.every((m) => r.serves.includes(`${m}@${d}`)))
}

/** Per-facet predicates, kept separate so the empty state can ask "which one hurt?" */
export const PREDICATES = {
  availability: (r, f) => matchesAvailability(r, f.days, f.meals),
  cuisines: (r, f) => !f.cuisines.length || someIn(r.cuisines, f.cuisines),
  hoods: (r, f) => !f.hoods.length || someIn(r.hoods, f.hoods),
  prices: (r, f) => !f.prices.length || someIn(r.prices, f.prices),
  // Dietary and amenity flags read as requirements, so they AND.
  flags: (r, f) => !f.flags.length || everyIn(r.flags, f.flags),
}

export const matchesFacets = (r, f) => Object.values(PREDICATES).every((p) => p(r, f))

/* -------------------------------------------------------------- sorting ---- */

export const SORTS = {
  relevance: { label: 'Best match', cmp: null },
  name: { label: 'Name A–Z', cmp: (a, b) => a.name.localeCompare(b.name) },
  price_asc: { label: 'Price low to high', cmp: (a, b) => (a.min_price ?? 1e9) - (b.min_price ?? 1e9) || a.name.localeCompare(b.name) },
  price_desc: { label: 'Price high to low', cmp: (a, b) => (b.max_price ?? -1) - (a.max_price ?? -1) || a.name.localeCompare(b.name) },
  choice: { label: 'Most menu choice', cmp: (a, b) => choiceScore(b) - choiceScore(a) || a.name.localeCompare(b.name) },
}

/** Total dishes on offer — a rough proxy for "how much choice do I actually get". */
function choiceScore(r) {
  let n = 0
  for (const m of r.menus || []) for (const c of m.courses) n += c.of
  return n
}

/* ---------------------------------------------------------------- query ---- */

/** The one call the UI makes. Pure, synchronous, ~1ms over 380 records. */
export function runQuery(f, sort = 'relevance') {
  const ids = textMatchIds(f.query)
  const pool = ids ? ids.map(getById).filter(Boolean) : restaurants
  const hits = pool.filter((r) => matchesFacets(r, f))

  const key = sort === 'relevance' && !ids ? 'name' : sort
  const cmp = SORTS[key]?.cmp
  return cmp ? [...hits].sort(cmp) : hits
}

/**
 * For the empty state: which single facet, if dropped, would bring results back?
 * Returns [{ facet, count }] sorted by how much each one is costing you.
 * Never a bare "no results" (BUILD_PLAN §6).
 */
export function relaxations(f) {
  const ids = textMatchIds(f.query)
  const pool = ids ? ids.map(getById).filter(Boolean) : restaurants
  const active = [
    f.days.length || f.meals.length ? 'availability' : null,
    f.cuisines.length ? 'cuisines' : null,
    f.hoods.length ? 'hoods' : null,
    f.prices.length ? 'prices' : null,
    f.flags.length ? 'flags' : null,
  ].filter(Boolean)

  return active
    .map((facet) => {
      const others = active.filter((k) => k !== facet)
      const count = pool.filter((r) => others.every((k) => PREDICATES[k](r, f))).length
      return { facet, count }
    })
    .filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count)
}

/* --------------------------------------------------------------- format ---- */

export const priceRange = (r) =>
  r.min_price == null ? '—' : r.min_price === r.max_price ? `$${r.min_price}` : `$${r.min_price}–$${r.max_price}`

export const sortDays = (days) => days.slice().sort((a, b) => DAYS.indexOf(a) - DAYS.indexOf(b))
export const sortMeals = (meals) => meals.slice().sort((a, b) => MEAL_ORDER.indexOf(a) - MEAL_ORDER.indexOf(b))

/** "Mon–Thu, Sat" rather than "Mon, Tue, Wed, Thu, Sat" — runs collapse to ranges. */
export function dayRange(days) {
  const ds = sortDays(days)
  if (ds.length === 7) return 'Daily'
  const out = []
  for (let i = 0; i < ds.length; ) {
    let j = i
    while (j + 1 < ds.length && DAYS.indexOf(ds[j + 1]) === DAYS.indexOf(ds[j]) + 1) j++
    const [a, b] = [DAY_LABEL[ds[i]], DAY_LABEL[ds[j]]]
    out.push(j - i >= 2 ? `${a}–${b}` : j - i === 1 ? `${a}, ${b}` : a)
    i = j + 1
  }
  return out.join(', ')
}

/** "Dinner $65 · Fri, Sat" — never "Participating" (BUILD_PLAN §6 copy rules). */
export const offerLine = (o) =>
  `${MEAL_LABEL[o.meal] ?? o.meal}${o.price ? ` $${o.price}` : ''} · ${dayRange(o.days)}`

export const flagLabel = (f) =>
  ({ 'gluten-free': 'Gluten-free', 'seed-oil-free': 'Seed-oil-free', 'low-glycemic': 'Low-glycemic', michelin: 'Michelin', outdoor: 'Outdoor seating', reservations: 'Takes reservations', wheelchair: 'Wheelchair access', 'special-offer': 'Special offer', vegetarian: 'Vegetarian', vegan: 'Vegan', halal: 'Halal', kosher: 'Kosher' })[f] ??
  f.replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase())
