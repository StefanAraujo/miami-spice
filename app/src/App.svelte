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
    void f, sort
    shown = 60
  })

  const clearAll = () => (f = emptyFilters())

  const drop = (facet) => {
    if (facet === 'availability') f = { ...f, days: [], meals: [] }
    else f = { ...f, [facet]: [] }
  }

  const FACET_NAME = {
    availability: 'the day and meal',
    cuisines: 'the cuisine',
    hoods: 'the neighborhood',
    prices: 'the price',
    flags: 'the dietary and amenity',
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
    stamp && `data from ${stamp}`,
  ].filter(Boolean).join(' · ')

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
    <h1>Miami Spice</h1>
    <p class="tagline mono">{tagline}</p>
  </div>
</header>

<div class="wrap layout">
  <!-- ------------------------------------------------------------- rail -->
  <aside class="rail" class:open={filtersOpen}>
    <div class="rail-inner">
      <label class="search">
        <span class="sr-only">Search restaurants, cuisines or dishes</span>
        <input type="search" placeholder="Search a name, cuisine or dish…" bind:value={f.query} />
      </label>

      <div class="avail">
        <h3 class="mono">When you want to go</h3>
        <DayMealGrid bind:days={f.days} bind:meals={f.meals} />
      </div>

      <FacetGroup label="Price" options={facets.prices} bind:selected={f.prices} format={(p) => `$${p}`} />
      <FacetGroup label="Cuisine" options={facets.cuisines} bind:selected={f.cuisines} collapsible limit={10} />
      <FacetGroup label="Neighborhood" options={facets.hoods} bind:selected={f.hoods} collapsible limit={10} />
      <FacetGroup label="Dietary & amenities" options={facets.flags} bind:selected={f.flags} format={flagLabel} collapsible limit={12} />
    </div>
  </aside>

  <!-- ---------------------------------------------------------- results -->
  <main>
    <div class="bar">
      <p class="count mono" aria-live="polite">
        <strong>{results.length}</strong> {results.length === 1 ? 'restaurant' : 'restaurants'}
      </p>

      <div class="bar-right">
        <label class="sortsel mono">
          <span class="sr-only">Sort results</span>
          <select bind:value={sort}>
            {#each Object.entries(SORTS) as [k, v]}<option value={k}>{v.label}</option>{/each}
          </select>
        </label>
        <button type="button" class="toggle mono" onclick={() => (filtersOpen = !filtersOpen)}>
          {filtersOpen ? 'Hide filters' : 'Filters'}{#if chips.length} ({chips.length}){/if}
        </button>
      </div>
    </div>

    {#if chips.length}
      <ul class="chips">
        {#each chips as c}
          <li>
            <button type="button" class="mono" onclick={c.remove}>
              {c.label}<span aria-hidden="true">×</span><span class="sr-only">, remove filter</span>
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
          <p class="fix">Loosening one filter brings results back:</p>
          <ul>
            {#each relax as r}
              <li>
                <button type="button" class="mono" onclick={() => drop(r.facet)}>
                  Drop {FACET_NAME[r.facet]} filter → {r.count} {r.count === 1 ? 'match' : 'matches'}
                </button>
              </li>
            {/each}
          </ul>
        {:else}
          <p class="fix">Try clearing a filter or two.</p>
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
        <div class="sentinel mono" use:sentinel>Loading more…</div>
      {/if}
    {/if}
  </main>
</div>

<footer class="wrap">
  <p class="mono">
    Unofficial. Menus and prices come from miamiandbeaches.com and can change mid-season — confirm with the restaurant before you go.
  </p>
</footer>

<style>
  .wrap { max-width: 1180px; margin: 0 auto; padding: 0 1.25rem; }

  .masthead { border-bottom: 3px solid var(--seaglass); background: var(--paper); padding: 1.4rem 0 1rem; }

  h1 {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: clamp(1.9rem, 5vw, 2.9rem);
    letter-spacing: -0.03em;
    margin: 0;
    line-height: 1;
  }

  .tagline {
    margin: 0.4rem 0 0;
    font-size: 0.68rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--ink-faint);
  }

  .layout {
    display: grid;
    grid-template-columns: 244px minmax(0, 1fr);
    gap: 1.75rem;
    align-items: start;
    padding-top: 1.25rem;
  }

  .rail-inner {
    position: sticky;
    top: 1rem;
    display: grid;
    gap: 1rem;
    max-height: calc(100vh - 2rem);
    overflow-y: auto;
    padding-right: 0.4rem;
  }

  .search input {
    width: 100%;
    border: var(--rule);
    border-radius: var(--radius);
    background: var(--paper-raised);
    padding: 0.45rem 0.55rem;
    font-family: var(--font-mono);
    font-size: 0.78rem;
  }
  .search input::placeholder { color: var(--ink-faint); }

  .avail { display: grid; gap: 0.4rem; }
  .avail h3 {
    margin: 0;
    font-size: 0.62rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--ink-faint);
  }

  .bar {
    position: sticky;
    top: 0;
    z-index: 5;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.55rem 0;
    background: var(--paper);
    border-bottom: var(--rule);
    margin-bottom: 0.75rem;
  }

  .count { margin: 0; font-size: 0.72rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink-faint); }
  .count strong { color: var(--ink); font-size: 0.95rem; }

  .bar-right { display: flex; align-items: center; gap: 0.5rem; }

  .sortsel select {
    border: var(--rule);
    border-radius: var(--radius);
    background: var(--paper-raised);
    padding: 0.22rem 0.4rem;
    font-family: var(--font-mono);
    font-size: 0.7rem;
  }

  .toggle { display: none; border: var(--rule); background: var(--paper-raised); border-radius: var(--radius); padding: 0.24rem 0.5rem; font-size: 0.7rem; }

  .chips { list-style: none; display: flex; flex-wrap: wrap; gap: 0.3rem; margin: 0 0 0.9rem; padding: 0; }
  .chips button {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    border: 1px solid var(--seaglass);
    background: var(--seaglass);
    color: var(--paper);
    border-radius: var(--radius);
    padding: 0.14rem 0.4rem;
    font-size: 0.68rem;
  }
  .chips .clear { background: none; color: var(--ink-faint); border-color: var(--sand); }
  .chips .clear:hover { color: var(--program-red); border-color: var(--program-red); }

  .list { display: grid; gap: 0.7rem; }

  .empty { border: 1px dashed var(--sand); border-radius: var(--radius); padding: 1.5rem; background: var(--paper-raised); }
  .empty .lead { font-size: 1.1rem; margin: 0 0 0.35rem; }
  .empty .fix { font-size: 0.9rem; color: var(--ink-soft); margin: 0 0 0.6rem; }
  .empty ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.35rem; justify-items: start; }
  .empty button {
    border: var(--rule);
    background: var(--paper);
    border-radius: var(--radius);
    padding: 0.28rem 0.55rem;
    font-size: 0.72rem;
  }
  .empty button:hover { border-color: var(--seaglass); color: var(--seaglass); }

  .sentinel { text-align: center; padding: 1.25rem; font-size: 0.7rem; color: var(--ink-faint); }

  footer { padding: 2rem 1.25rem 3rem; }
  footer p { font-size: 0.66rem; color: var(--ink-faint); margin: 0; border-top: var(--rule); padding-top: 0.8rem; }

  @media (max-width: 820px) {
    .layout { grid-template-columns: minmax(0, 1fr); gap: 0.75rem; }
    .rail { display: none; }
    .rail.open { display: block; }
    .rail-inner { position: static; max-height: none; }
    .toggle { display: inline-block; }
  }
</style>
