<script>
  import Card from './components/Card.svelte'
  import DayMealGrid from './components/DayMealGrid.svelte'
  import FacetGroup from './components/FacetGroup.svelte'
  import {
    facets, generatedAt, restaurants,
    emptyFilters, isEmpty, runQuery, relaxations,
    SORTS, DAY_LABEL, MEAL_LABEL, flagLabel,
  } from './lib/search.js'

  let f = $state(emptyFilters())
  let sort = $state('relevance')
  let shown = $state(60)
  let filtersOpen = $state(false)

  const results = $derived(runQuery(f, sort))
  const relax = $derived(results.length === 0 && !isEmpty(f) ? relaxations(f) : [])
  const visible = $derived(results.slice(0, shown))

  // Any filter change resets the scroll window.
  $effect(() => {
    void f
    void sort
    shown = 60
  })

  const clearAll = () => (f = emptyFilters())

  const drop = (facet) => {
    if (facet === 'availability') f = { ...f, days: [], meals: [] }
    else f = { ...f, [facet]: [] }
  }

  const FACET_NAME = {
    availability: 'day and meal',
    cuisines: 'cuisine',
    hoods: 'neighborhood',
    prices: 'price',
    flags: 'dietary and amenity',
  }

  /** Every active filter as a removable chip. */
  const chips = $derived.by(() => {
    const out = []
    if (f.query.trim()) out.push({ label: `“${f.query.trim()}”`, remove: () => (f = { ...f, query: '' }) })
    for (const d of f.days) out.push({ label: DAY_LABEL[d], remove: () => (f = { ...f, days: f.days.filter((x) => x !== d) }) })
    for (const m of f.meals) out.push({ label: MEAL_LABEL[m] ?? m, remove: () => (f = { ...f, meals: f.meals.filter((x) => x !== m) }) })
    for (const c of f.cuisines) out.push({ label: c, remove: () => (f = { ...f, cuisines: f.cuisines.filter((x) => x !== c) }) })
    for (const h of f.hoods) out.push({ label: h, remove: () => (f = { ...f, hoods: f.hoods.filter((x) => x !== h) }) })
    for (const p of f.prices) out.push({ label: `$${p}`, remove: () => (f = { ...f, prices: f.prices.filter((x) => x !== p) }) })
    for (const g of f.flags) out.push({ label: flagLabel(g), remove: () => (f = { ...f, flags: f.flags.filter((x) => x !== g) }) })
    return out
  })

  const stamp = generatedAt ? new Date(generatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : null
  const tagline = [
    `${restaurants.length} restaurants`,
    `${facets.cuisines.length} cuisines`,
    `${facets.hoods.length} neighborhoods`,
    stamp && `updated ${stamp}`,
  ].filter(Boolean).join('  ·  ')

  function sentinel(node) {
    const io = new IntersectionObserver((es) => {
      if (es[0].isIntersecting && shown < results.length) shown += 60
    })
    io.observe(node)
    return { destroy: () => io.disconnect() }
  }
</script>

<header class="masthead">
  <div class="wrap">
    <h1>Miami <span>Spice</span></h1>
    <p class="tagline micro">{tagline}</p>
  </div>
</header>

<div class="wrap layout">
  <!-- ------------------------------------------------------------- rail -->
  <aside class="rail" class:open={filtersOpen}>
    <div class="rail-inner">
      <label class="search">
        <span class="sr-only">Search restaurants, cuisines or dishes</span>
        <input type="search" placeholder="Search a name, cuisine, dish…" bind:value={f.query} />
      </label>

      <section class="avail">
        <h3 class="micro">When you want to go</h3>
        <DayMealGrid bind:days={f.days} bind:meals={f.meals} />
      </section>

      <FacetGroup label="Price" options={facets.prices} bind:selected={f.prices} format={(p) => `$${p}`} />
      <FacetGroup label="Cuisine" options={facets.cuisines} bind:selected={f.cuisines} collapsible limit={10} />
      <FacetGroup label="Neighborhood" options={facets.hoods} bind:selected={f.hoods} collapsible limit={10} />
      <FacetGroup label="Dietary & amenities" options={facets.flags} bind:selected={f.flags} format={flagLabel} collapsible limit={12} />
    </div>
  </aside>

  <!-- ---------------------------------------------------------- results -->
  <main>
    <div class="bar">
      <p class="count" aria-live="polite">
        <strong class="mono">{results.length}</strong>
        <span class="micro">{results.length === 1 ? 'restaurant' : 'restaurants'}</span>
      </p>

      <div class="bar-right">
        <label class="sortsel">
          <span class="sr-only">Sort results</span>
          <select class="mono" bind:value={sort}>
            {#each Object.entries(SORTS) as [k, v]}<option value={k}>{v.label}</option>{/each}
          </select>
        </label>
        <button type="button" class="toggle mono" onclick={() => (filtersOpen = !filtersOpen)}>
          {filtersOpen ? 'Close' : chips.length ? `Filters · ${chips.length}` : 'Filters'}
        </button>
      </div>
    </div>

    {#if chips.length}
      <ul class="chips">
        {#each chips as c}
          <li>
            <button type="button" class="mono" onclick={c.remove}>
              {c.label}<span class="x" aria-hidden="true">×</span><span class="sr-only">, remove filter</span>
            </button>
          </li>
        {/each}
        <li><button type="button" class="clear mono" onclick={clearAll}>Clear all</button></li>
      </ul>
    {/if}

    {#if results.length === 0}
      <div class="empty">
        <p class="lead">Nothing matches all of those at once.</p>
        {#if relax.length}
          <p class="fix micro">Loosen one and results come back</p>
          <ul>
            {#each relax as r}
              <li>
                <button type="button" class="mono" onclick={() => drop(r.facet)}>
                  <span>Drop {FACET_NAME[r.facet]}</span>
                  <span class="n">{r.count}</span>
                </button>
              </li>
            {/each}
          </ul>
        {:else}
          <p class="fix micro">Try clearing a filter or two</p>
          <button type="button" class="mono reset" onclick={clearAll}>Start over</button>
        {/if}
      </div>
    {:else}
      <div class="list">
        {#each visible as r (r.id)}
          <Card {r} />
        {/each}
      </div>
      {#if shown < results.length}
        <div class="sentinel micro" use:sentinel>Loading more</div>
      {/if}
    {/if}
  </main>
</div>

<footer class="wrap">
  <p class="micro">
    Unofficial · menus and prices come from miamiandbeaches.com and shift mid-season · confirm before you go
  </p>
</footer>

<style>
  .wrap { max-width: 1240px; margin: 0 auto; padding: 0 1.5rem; }

  .masthead { padding: 3.25rem 0 1.75rem; }

  h1 {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: clamp(2.4rem, 7vw, 4rem);
    letter-spacing: -0.045em;
    line-height: 0.95;
    margin: 0;
    color: var(--text);
  }
  h1 span {
    /* The one place the two neons touch. Everything else keeps them apart. */
    background: linear-gradient(96deg, var(--hot), var(--pink) 45%, var(--cyan));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .tagline { margin: 0.85rem 0 0; }

  .layout {
    display: grid;
    grid-template-columns: 232px minmax(0, 1fr);
    gap: 3rem;
    align-items: start;
  }

  .rail-inner {
    position: sticky;
    top: 1.5rem;
    display: grid;
    gap: 1.75rem;
    max-height: calc(100vh - 3rem);
    overflow-y: auto;
    padding-bottom: 1rem;
    scrollbar-width: thin;
  }

  .search input {
    width: 100%;
    border: 1px solid var(--line);
    border-radius: var(--r-pill);
    background: var(--surface);
    padding: 0.55rem 0.9rem;
    font-family: var(--font-mono);
    font-size: 0.75rem;
    transition: border-color 140ms, background 140ms;
  }
  .search input::placeholder { color: var(--text-faint); }
  .search input:hover { border-color: var(--surface-2); }
  .search input:focus { background: var(--surface-2); }

  .avail { display: grid; gap: 0.7rem; }
  .avail h3 { margin: 0; }

  .bar {
    position: sticky;
    top: 0;
    z-index: 5;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1.1rem 0 0.9rem;
    background: color-mix(in srgb, var(--void) 88%, transparent);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border-bottom: 1px solid var(--line-soft);
    margin-bottom: 1.25rem;
  }

  .count { margin: 0; display: flex; align-items: baseline; gap: 0.45rem; }
  .count strong { font-size: 1.35rem; font-weight: 500; letter-spacing: -0.02em; color: var(--text); }

  .bar-right { display: flex; align-items: center; gap: 0.5rem; }

  .sortsel select {
    border: 1px solid var(--line);
    border-radius: var(--r-pill);
    background: var(--surface);
    padding: 0.32rem 0.7rem;
    font-size: 0.68rem;
    color: var(--text-soft);
    transition: border-color 140ms;
  }
  .sortsel select:hover { border-color: var(--surface-2); color: var(--text); }

  .toggle {
    display: none;
    border: 1px solid var(--line);
    border-radius: var(--r-pill);
    background: var(--surface);
    padding: 0.32rem 0.8rem;
    font-size: 0.68rem;
    color: var(--text-soft);
  }

  .chips { list-style: none; display: flex; flex-wrap: wrap; gap: 0.35rem; margin: 0 0 1.25rem; padding: 0; }
  .chips button {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    border-radius: var(--r-pill);
    background: var(--cyan);
    color: var(--void);
    padding: 0.22rem 0.5rem 0.22rem 0.7rem;
    font-size: 0.68rem;
    font-weight: 500;
    transition: opacity 140ms;
  }
  .chips button:hover { opacity: 0.82; }
  .chips .x { font-size: 0.85rem; line-height: 1; opacity: 0.65; }
  .chips .clear {
    background: none;
    color: var(--text-faint);
    border: 1px solid var(--line);
    padding: 0.22rem 0.7rem;
  }
  .chips .clear:hover { color: var(--hot); border-color: var(--hot); opacity: 1; }

  .list { display: grid; gap: 0.6rem; }

  .empty {
    border: 1px solid var(--line);
    border-radius: var(--r-md);
    background: var(--surface);
    padding: 2.25rem;
  }
  .empty .lead {
    font-size: 1.25rem;
    font-weight: 500;
    letter-spacing: -0.02em;
    margin: 0 0 0.9rem;
  }
  .empty .fix { margin: 0 0 0.75rem; }
  .empty ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.4rem; justify-items: start; }
  .empty ul button {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    border: 1px solid var(--line);
    border-radius: var(--r-pill);
    background: var(--surface-2);
    padding: 0.35rem 0.5rem 0.35rem 0.9rem;
    font-size: 0.72rem;
    color: var(--text-soft);
    transition: border-color 140ms, color 140ms;
  }
  .empty ul button:hover { border-color: var(--cyan); color: var(--text); }
  .empty .n {
    background: var(--cyan-dim);
    color: var(--cyan);
    border-radius: var(--r-pill);
    padding: 0.05rem 0.5rem;
    font-variant-numeric: tabular-nums;
  }
  .empty .reset {
    border: 1px solid var(--line);
    border-radius: var(--r-pill);
    padding: 0.35rem 0.9rem;
    font-size: 0.72rem;
    color: var(--text-soft);
  }

  .sentinel { text-align: center; padding: 2rem; }

  footer { padding: 4rem 1.5rem 3rem; }
  footer p { margin: 0; border-top: 1px solid var(--line-soft); padding-top: 1.25rem; }

  @media (max-width: 900px) {
    .layout { grid-template-columns: minmax(0, 1fr); gap: 1rem; }
    .masthead { padding: 2rem 0 1rem; }
    .rail { display: none; }
    .rail.open { display: block; }
    .rail-inner { position: static; max-height: none; }
    .toggle { display: inline-block; white-space: nowrap; }
  }

  @media (max-width: 560px) {
    /* The sort <select> takes its intrinsic width from the longest option, which
       pushes the filters button off-screen on a phone. Cap it instead. */
    .bar { flex-wrap: wrap; row-gap: 0.6rem; }
    .bar-right { flex: 1; min-width: 0; justify-content: flex-end; }
    .sortsel { min-width: 0; }
    .sortsel select { max-width: 100%; text-overflow: ellipsis; }
  }
</style>
