<script>
  import Row from './components/Row.svelte'
  import Discover from './components/Discover.svelte'
  import Map from './components/Map.svelte'
  import DayMealGrid from './components/DayMealGrid.svelte'
  import FacetGroup from './components/FacetGroup.svelte'
  import {
    facets, generatedAt, restaurants,
    emptyFilters, isEmpty, runQuery, relaxations, facetCounts,
    SORTS, DAY_LABEL, MEAL_LABEL, flagLabel, MOODS, getById, DAYS,
  } from './lib/search.js'

  // The full filter state lives in the URL so any view is bookmarkable and
  // shareable — "Italian, Saturday dinner, Brickell" is a link, not just a shortlist
  // (UX review). Parsed once on load; kept in sync by the effect below.
  function parseUrl() {
    const p = new URLSearchParams(location.search)
    const list = (k) => (p.get(k) || '').split(',').filter(Boolean)
    const nums = (k) => list(k).map(Number).filter((x) => !Number.isNaN(x))
    const f = {
      ...emptyFilters(),
      query: p.get('q') || '',
      days: list('days'), meals: list('meals'),
      cuisines: list('cuisines'), hoods: list('hoods'), cities: list('cities'),
      prices: nums('prices'), flags: list('flags'), mood: p.get('mood') || null,
    }
    return { f, sort: p.get('sort') || 'relevance', picks: nums('picks') }
  }
  const _url = parseUrl()

  let f = $state(_url.f)
  let sort = $state(_url.sort)
  let shown = $state(40)
  let filtersOpen = $state(false)
  // First-run orientation — light and dismissible (UX review: Help & Docs gap).
  // Shown until "Got it," then remembered; the honest edge, stated once for a
  // friend who opens a shared link cold.
  function introSeenInit() { try { return localStorage.getItem('intro-seen') === '1' } catch { return false } }
  let introSeen = $state(introSeenInit())
  const dismissIntro = () => { introSeen = true; try { localStorage.setItem('intro-seen', '1') } catch {} }
  // Cold start shows the Discover front door (ROADMAP Phase 4). "Browse all" is
  // the escape hatch to the full list without picking anything first.
  let browseAll = $state(!isEmpty(_url.f))
  let view = $state('list')   // 'list' | 'map' — both driven by the same filtered results
  let course = $state('all')  // 'all' | 'starters' | 'mains' | 'desserts' — the teaser lens
  const COURSES = [['all', 'All'], ['starters', 'Starters'], ['mains', 'Mains'], ['desserts', 'Desserts']]

  // Shortlist — the fix for the biggest gap in the UX review: an external place to
  // park candidates (closes Zeigarnik open loops) that doubles as a group-decision
  // primitive via a shareable URL. Client-side only, same localStorage mechanism as
  // the AM/PM mood. A ?picks=id,id link opens straight into someone else's shortlist.
  function storedShortlist() { try { return JSON.parse(localStorage.getItem('shortlist') || '[]') } catch { return [] } }
  let shortlist = $state(_url.picks.length ? _url.picks : storedShortlist())
  // A link carrying only picks (no filters) is a shared shortlist — open to it.
  let showShortlist = $state(_url.picks.length > 0 && isEmpty(_url.f))
  let shareMsg = $state('')

  // Keep the URL in sync with the full state (filters + sort + shortlist), so the
  // address bar is always a shareable, bookmarkable link. replaceState, not push —
  // no history spam per keystroke.
  $effect(() => {
    try { localStorage.setItem('shortlist', JSON.stringify(shortlist)) } catch {}
    const p = new URLSearchParams()
    if (f.query.trim()) p.set('q', f.query.trim())
    for (const k of ['days', 'meals', 'cuisines', 'hoods', 'cities', 'flags']) if (f[k].length) p.set(k, f[k].join(','))
    if (f.prices.length) p.set('prices', f.prices.join(','))
    if (f.mood) p.set('mood', f.mood)
    if (sort !== 'relevance') p.set('sort', sort)
    if (shortlist.length) p.set('picks', shortlist.join(','))
    const qs = p.toString()
    try { history.replaceState(null, '', qs ? `${location.pathname}?${qs}` : location.pathname) } catch {}
  })
  const savedSet = $derived(new Set(shortlist))
  const shortlistRows = $derived(shortlist.map(getById).filter(Boolean))
  const togglePin = (id) => {
    shortlist = shortlist.includes(id) ? shortlist.filter((x) => x !== id) : [...shortlist, id]
    shareMsg = ''
  }
  // The live URL already encodes the full state, so sharing is just copying it.
  async function share() {
    try {
      await navigator.clipboard.writeText(location.href)
      shareMsg = "Link copied — send it to whoever you're going with."
    } catch {
      shareMsg = location.href
    }
  }

  // AM/PM colour mood — the one idea kept from the client's Vice reference. PM is
  // a restrained Deco-at-night override (see VICE_DIRECTION.md), not neon synthwave.
  let mood = $state(document.documentElement.dataset.theme === 'pm' ? 'pm' : 'am')
  const setMood = (m) => {
    mood = m
    document.documentElement.dataset.theme = m
    try { localStorage.setItem('mood', m) } catch {}
  }

  const results = $derived(runQuery(f, sort))
  const counts = $derived(facetCounts(f))
  const relax = $derived(results.length === 0 && !isEmpty(f) ? relaxations(f) : [])
  const visible = $derived(results.slice(0, shown))
  const discovering = $derived(isEmpty(f) && !f.query.trim() && !browseAll)

  const applyPreset = (filters, s) => {
    f = { ...emptyFilters(), ...filters }
    if (s) sort = s
    browseAll = false
  }

  // Confident default (UX review gaps 4 & 7): "Pick for us" surfaces ONE strong
  // choice open tonight — for the tired, deferral-prone group who don't want a
  // 380-row list. Scored from data we already have; a peak + a place to stop.
  const TODAY = DAYS[(new Date().getDay() + 6) % 7]
  let pickedId = $state(null)
  function pickForUs() {
    const openTonight = restaurants.filter((r) => r.serves.includes(`dinner@${TODAY}`))
    const pool = (openTonight.length ? openTonight : restaurants)
      .map((r) => ({ r, s: (r.michelin ? 4 : 0) + (r.flags.includes('michelin') ? 4 : 0) + (r.menus?.length || 0) + (r.prices.includes(65) ? 1 : 0) }))
      .sort((a, b) => b.s - a.s)
      .slice(0, 15)
    pickedId = pool[Math.floor(Math.random() * pool.length)]?.r?.id ?? null
    showShortlist = false
  }
  const pickedRow = $derived(pickedId != null ? getById(pickedId) : null)

  $effect(() => {
    void f
    void sort
    shown = 40
  })

  const clearAll = () => { f = emptyFilters(); browseAll = false }
  // The wordmark is the persistent way back to the front door (UX review: no Home).
  const goHome = () => {
    f = emptyFilters(); sort = 'relevance'; course = 'all'
    browseAll = false; showShortlist = false; pickedId = null
  }

  const drop = (facet) => {
    if (facet === 'availability') f = { ...f, days: [], meals: [] }
    else f = { ...f, [facet]: [] }
  }

  const FACET_NAME = {
    availability: 'day and meal',
    cuisines: 'cuisine',
    hoods: 'neighborhood',
    cities: 'city',
    prices: 'price',
    flags: 'dietary and amenity',
  }

  const chips = $derived.by(() => {
    const out = []
    if (f.query.trim()) out.push({ label: `“${f.query.trim()}”`, remove: () => (f = { ...f, query: '' }) })
    if (f.mood) out.push({ label: `Mood: ${MOODS[f.mood].label}`, remove: () => (f = { ...f, mood: null }) })
    for (const d of f.days) out.push({ label: DAY_LABEL[d], remove: () => (f = { ...f, days: f.days.filter((x) => x !== d) }) })
    for (const m of f.meals) out.push({ label: MEAL_LABEL[m] ?? m, remove: () => (f = { ...f, meals: f.meals.filter((x) => x !== m) }) })
    for (const c of f.cuisines) out.push({ label: c, remove: () => (f = { ...f, cuisines: f.cuisines.filter((x) => x !== c) }) })
    for (const h of f.hoods) out.push({ label: h, remove: () => (f = { ...f, hoods: f.hoods.filter((x) => x !== h) }) })
    for (const c of f.cities) out.push({ label: c, remove: () => (f = { ...f, cities: f.cities.filter((x) => x !== c) }) })
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

  // Value + honest scarcity (UX review gaps 6 & 8): frame the fixed price as a
  // 3-course *deal*, and state the season deadline as motivation, not metadata.
  const SEASON_END = new Date(2026, 8, 30)   // Sep 30 2026 (month index 8 = September)
  const daysLeft = Math.max(0, Math.ceil((SEASON_END.getTime() - Date.now()) / 86400000))
  const promo = daysLeft > 0
    ? `3-course prix fixe · $40 / $50 / $65 · Restaurant Week ends in ${daysLeft} days`
    : '3-course prix fixe · $40 / $50 / $65'

  /**
   * Baymard/NN/g: render a batch, lazy-load one more, then hand over to an
   * explicit button. Infinite scroll makes people scan superficially and is the
   * wrong pattern when the task is finding something specific.
   */
  function sentinel(node) {
    const io = new IntersectionObserver((es) => {
      if (es[0].isIntersecting && shown < results.length && shown < 80) shown += 40
    })
    io.observe(node)
    return { destroy: () => io.disconnect() }
  }
</script>

<!-- Symmetry in the frame, freedom in the contents — the Deco rule. -->
<header class="masthead">
  <div class="wrap">
    <p class="eyebrow micro">Miami Beach · August – September</p>
    <h1 class="wordmark"><button type="button" class="wordmark-btn" onclick={goHome}>Miami Spice</button></h1>
    <div class="racing" aria-hidden="true"><i></i><i></i><i></i></div>
    <p class="tagline micro">{tagline}</p>
    <p class="promo micro">{promo}</p>
    <div class="masthead-tools">
      <div class="mood" role="group" aria-label="Theme" title="Switch between the daytime and after-dark theme">
        <button type="button" class="mono" aria-label="Daytime theme" aria-pressed={mood === 'am'} onclick={() => setMood('am')}>AM</button>
        <button type="button" class="mono" aria-label="After-dark theme" aria-pressed={mood === 'pm'} onclick={() => setMood('pm')}>PM</button>
      </div>
      <button type="button" class="shortlist-btn micro" aria-pressed={showShortlist}
        onclick={() => (showShortlist = !showShortlist)}>
        Shortlist{#if shortlist.length}<span class="badge mono">{shortlist.length}</span>{/if}
      </button>
    </div>
  </div>
</header>

<!-- The horizon eyebrow: one hard, full-bleed Deco sunshade line (marine over a
     signal-teal offset, zero blur). Hard sun, the opposite of the aurora-blob hero. -->
<div class="horizon" aria-hidden="true"></div>

{#if !introSeen}
  <div class="wrap">
    <aside class="intro" aria-label="About Miami Spice">
      <p>The honest Miami Spice menu — which nights each spot actually serves it, and the full three-course lineup, filtered instantly. Unofficial · updated weekly.</p>
      <button type="button" class="intro-x mono" onclick={dismissIntro}>Got it</button>
    </aside>
  </div>
{/if}

<div class="wrap layout">
  <aside class="rail" class:open={filtersOpen}>
    <div class="rail-inner">
      <label class="search">
        <span class="sr-only">Search restaurants, cuisines or dishes</span>
        <input type="search" placeholder="Search a name, cuisine, dish…" bind:value={f.query} />
      </label>

      <section class="group">
        <h3 class="micro">When you want to go</h3>
        <DayMealGrid bind:days={f.days} bind:meals={f.meals} {counts} />
      </section>

      <FacetGroup label="Price" options={facets.prices} bind:selected={f.prices}
        counts={counts.prices} format={(p) => `$${p}`} />
      <FacetGroup label="Cuisine" options={facets.cuisines} bind:selected={f.cuisines}
        counts={counts.cuisines} collapsible limit={10} />
      <FacetGroup label="Neighborhood" options={facets.hoods} bind:selected={f.hoods}
        counts={counts.hoods} collapsible limit={10} />
      <FacetGroup label="City" options={facets.cities} bind:selected={f.cities}
        counts={counts.cities} collapsible limit={8} />
      <FacetGroup label="Dietary & amenities" options={facets.flags} bind:selected={f.flags}
        counts={counts.flags} format={flagLabel} collapsible limit={12}
        note="All selected are required" />
    </div>
  </aside>

  <main>
    {#if pickedRow}
      <section class="pick-view">
        <h2 class="sr-only">Tonight's pick</h2>
        <div class="bar">
          <p class="count"><span class="micro">Tonight's pick</span></p>
          <div class="bar-right">
            <button type="button" class="sl-action micro" onclick={pickForUs}>Pick another</button>
            <button type="button" class="sl-action micro" onclick={() => { pickedId = null; browseAll = true }}>Browse all</button>
          </div>
        </div>
        <ul class="list">
          <Row r={pickedRow} initialOpen={true} saved={savedSet.has(pickedRow.id)} onTogglePin={togglePin} />
        </ul>
      </section>
    {:else if showShortlist}
      <section class="shortlist-view">
        <h2 class="sr-only">Your shortlist</h2>
        <div class="bar">
          <p class="count"><strong class="mono">{shortlist.length}</strong><span class="micro">saved</span></p>
          <div class="bar-right">
            {#if shortlist.length}
              <button type="button" class="share-btn micro" onclick={share}>Share list</button>
              <button type="button" class="sl-action micro" onclick={() => (shortlist = [])}>Clear</button>
            {/if}
            <button type="button" class="sl-action micro" onclick={() => (showShortlist = false)}>Done</button>
          </div>
        </div>
        {#if shareMsg}<p class="share-msg micro" aria-live="polite">{shareMsg}</p>{/if}
        {#if shortlistRows.length}
          <ul class="list">
            {#each shortlistRows as r (r.id)}
              <Row {r} saved={true} onTogglePin={togglePin} />
            {/each}
          </ul>
        {:else}
          <div class="empty">
            <p class="lead">Your shortlist is empty.</p>
            <p class="fix micro">Tap the bookmark on any restaurant to save it here — then share the list with whoever you're deciding with.</p>
          </div>
        {/if}
      </section>
    {:else if discovering}
      <Discover onPick={applyPreset} onBrowseAll={() => (browseAll = true)} onSurprise={pickForUs} />
    {:else}
    <h2 class="sr-only">Results</h2>
    <div class="bar">
      <p class="count" aria-live="polite">
        <strong class="mono">{results.length}</strong>
        <span class="micro">{results.length === 1 ? 'restaurant' : 'restaurants'}</span>
      </p>

      <div class="bar-right">
        <div class="viewsel" role="group" aria-label="View">
          <button type="button" class="micro" aria-pressed={view === 'list'} onclick={() => (view = 'list')}>List</button>
          <button type="button" class="micro" aria-pressed={view === 'map'} onclick={() => (view = 'map')}>Map</button>
        </div>
        {#if !isEmpty(f)}<button type="button" class="bar-share micro" onclick={share} title="Copy a link to this search">Share</button>{/if}
        <label class="sortsel">
          <span class="sr-only">Sort results</span>
          <select class="mono" bind:value={sort}>
            {#each Object.entries(SORTS) as [k, v]}<option value={k}>{v.label}</option>{/each}
          </select>
        </label>
        <button type="button" class="toggle micro" onclick={() => (filtersOpen = !filtersOpen)}>
          {filtersOpen ? 'Close' : chips.length ? `Filters · ${chips.length}` : 'Filters'}
        </button>
      </div>
    </div>

    {#if shareMsg}<p class="share-msg micro" aria-live="polite">{shareMsg}</p>{/if}
    {#if f.mood}<p class="moodhint micro">Ranked by how well each menu fits “{MOODS[f.mood].label}” — cuisine, dietary flags, and dish names.</p>{/if}

    {#if chips.length}
      <ul class="chips">
        {#each chips as c}
          <li>
            <button type="button" onclick={c.remove}>
              {c.label}<span class="x" aria-hidden="true">×</span><span class="sr-only">, remove filter</span>
            </button>
          </li>
        {/each}
        <li><button type="button" class="clear" onclick={clearAll}>Clear all</button></li>
      </ul>
    {/if}

    {#if view === 'map'}
      <Map {results} />
    {:else if results.length === 0}
      <div class="empty">
        <p class="lead">Nothing matches all of those at once.</p>
        {#if relax.length}
          <p class="fix micro">Loosen one and results come back</p>
          <ul>
            {#each relax as r}
              <li>
                <button type="button" onclick={() => drop(r.facet)}>
                  <span>Drop {FACET_NAME[r.facet]}</span>
                  <span class="n mono">{r.count}</span>
                </button>
              </li>
            {/each}
          </ul>
        {:else}
          <p class="fix micro">Try clearing a filter or two</p>
          <button type="button" class="reset" onclick={clearAll}>Start over</button>
        {/if}
      </div>
    {:else}
      <div class="courses" role="group" aria-label="Course lens">
        {#each COURSES as [k, label]}
          <button type="button" class="micro" aria-pressed={course === k} onclick={() => (course = k)}>{label}</button>
        {/each}
      </div>

      <ul class="list">
        {#each visible as r (r.id)}
          <Row {r} {course} saved={savedSet.has(r.id)} onTogglePin={togglePin} />
        {/each}
      </ul>

      {#if shown < results.length}
        {#if shown < 80}
          <div class="sentinel micro" use:sentinel>Loading more</div>
        {:else}
          <button type="button" class="loadmore" onclick={() => (shown += 60)}>
            Load more<span class="n mono">{results.length - shown} left</span>
          </button>
        {/if}
      {/if}
    {/if}
    {/if}
  </main>
</div>

<footer class="wrap">
  <p class="micro">Unofficial · menus shift mid-season · confirm before you go</p>
</footer>

<style>
  .wrap { max-width: 1120px; margin: 0 auto; padding: 0 var(--s6); }

  .masthead { padding: var(--s7) 0 0; text-align: center; }

  .eyebrow { margin: 0 0 var(--s3); letter-spacing: 0.18em; }

  .wordmark {
    font-family: var(--f-deco);
    font-weight: 400;
    font-size: var(--t-display);
    letter-spacing: 0.16em;
    text-transform: uppercase;
    line-height: 1;
    margin: 0;
  }

  .wordmark-btn { font: inherit; letter-spacing: inherit; text-transform: inherit; color: inherit; }
  .wordmark-btn:hover { color: var(--marine); }

  /* Full-bleed hard horizon line — the app's one signature graphic. */
  .horizon {
    height: 6px;
    background: var(--marine);
    box-shadow: 0 6px 0 0 var(--signal);
    margin-top: var(--s7);
  }

  /* Rule of three. The whole 1930s reference, in three hairlines. */
  .racing { display: flex; flex-direction: column; gap: 3px; margin: var(--s5) auto 0; max-width: 340px; }
  .racing i { height: 2px; background: var(--marine); }
  .racing i:nth-child(2) { background: var(--flamingo); }

  .tagline { margin: var(--s4) 0 0; letter-spacing: 0.08em; }
  .promo { margin: var(--s2) 0 0; letter-spacing: 0.08em; color: var(--marine); }

  .intro {
    display: flex;
    gap: var(--s4);
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    margin-top: var(--s5);
    padding: var(--s3) var(--s4);
    background: var(--card);
    border: 1px solid var(--hair);
  }
  .intro p { margin: 0; font-size: var(--t-body); color: var(--soft); max-width: 66ch; }
  .intro-x {
    flex: none;
    display: inline-flex;
    align-items: center;
    min-height: var(--tap);
    padding: 0 var(--s4);
    border: 1px solid var(--rule);
    color: var(--marine);
  }
  .intro-x:hover { border-color: var(--marine); }

  .moodhint { margin: var(--s3) 0 0; color: var(--soft); letter-spacing: 0.06em; }

  /* Two moods, one system — the reference's framing, our restraint. A hard-edged
     segmented control, not a glowing pill. Each half clears Apple's 44pt target. */
  .masthead-tools {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: var(--s3);
    margin-top: var(--s5);
  }
  .shortlist-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--s2);
    min-height: var(--tap);
    padding: 0 var(--s4);
    border: 1px solid var(--rule);
    color: var(--soft);
  }
  .shortlist-btn:hover { color: var(--ink); border-color: var(--ink); }
  .shortlist-btn[aria-pressed='true'] { background: var(--marine); border-color: var(--marine); color: var(--card); }
  .shortlist-btn .badge { background: var(--flamingo); color: var(--card); padding: 1px 7px; }
  .shortlist-btn[aria-pressed='true'] .badge { background: var(--card); color: var(--marine); }

  .share-btn {
    display: inline-flex;
    align-items: center;
    min-height: var(--tap);
    padding: 0 var(--s4);
    background: var(--marine);
    color: var(--card);
    box-shadow: var(--eyebrow);
  }
  .share-msg { margin: var(--s3) 0 0; color: var(--signal); letter-spacing: 0.08em; }

  .sl-action {
    display: inline-flex;
    align-items: center;
    min-height: var(--tap);
    padding: 0 var(--s3);
    border: 1px solid var(--hair);
    color: var(--soft);
  }
  .sl-action:hover { border-color: var(--rule); color: var(--ink); }

  .mood {
    display: inline-flex;
    border: 1px solid var(--rule);
  }
  .mood button {
    min-height: var(--tap);
    min-width: 52px;
    padding: 0 var(--s3);
    font-size: var(--t-meta);
    letter-spacing: 0.14em;
    color: var(--soft);
  }
  .mood button + button { border-left: 1px solid var(--rule); }
  .mood button[aria-pressed='true'] { background: var(--marine); color: var(--card); }

  .layout {
    display: grid;
    grid-template-columns: 216px minmax(0, 1fr);
    gap: var(--s7);
    align-items: start;
    padding-top: var(--s7);
  }

  .rail-inner { position: sticky; top: var(--s5); max-height: calc(100vh - var(--s7)); overflow-y: auto; }

  .group { display: grid; gap: var(--s3); margin-bottom: var(--s6); }
  .group h3 { margin: 0; padding-bottom: var(--s2); border-bottom: 1px solid var(--rule); }

  .search { display: block; margin-bottom: var(--s6); }
  .search input {
    width: 100%;
    min-height: var(--tap);
    padding: 0 var(--s3);
    background: var(--card);
    border: 1px solid var(--hair);
    font-family: var(--f-mono);
    font-size: var(--t-body);
  }
  .search input::placeholder { color: var(--soft); opacity: 0.75; }
  .search input:hover, .search input:focus { border-color: var(--rule); }

  .bar {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--s4);
    padding-bottom: var(--s3);
    border-bottom: 2px solid var(--ink);
  }

  .count { margin: 0; display: flex; align-items: baseline; gap: var(--s2); }
  .count strong { font-size: var(--t-name); font-weight: 500; }

  .bar-right { display: flex; align-items: center; gap: var(--s2); }

  .viewsel { display: inline-flex; border: 1px solid var(--hair); }
  .viewsel button {
    min-height: var(--tap);
    padding: 0 var(--s3);
    font-size: var(--t-meta);
    letter-spacing: 0.14em;
    color: var(--soft);
    background: var(--card);
  }
  .viewsel button + button { border-left: 1px solid var(--hair); }
  .viewsel button[aria-pressed='true'] { background: var(--marine); color: var(--card); }

  .bar-share { min-height: var(--tap); padding: 0 var(--s3); border: 1px solid var(--hair); color: var(--soft); }
  .bar-share:hover { color: var(--marine); border-color: var(--marine); }

  .sortsel select {
    min-height: var(--tap);
    padding: 0 var(--s2);
    background: var(--card);
    border: 1px solid var(--hair);
    font-size: var(--t-meta);
    color: var(--soft);
  }

  .toggle {
    display: none;
    align-items: center;
    min-height: var(--tap);
    padding: 0 var(--s3);
    background: var(--card);
    border: 1px solid var(--hair);
    white-space: nowrap;
  }

  .chips { list-style: none; display: flex; flex-wrap: wrap; gap: var(--s1); margin: var(--s4) 0 0; padding: 0; }
  .chips button {
    display: inline-flex;
    align-items: center;
    gap: var(--s2);
    min-height: var(--tap);
    padding: 0 var(--s3);
    background: var(--marine);
    color: var(--card);
    font-size: var(--t-body);
  }
  .chips .x { font-size: var(--t-body); line-height: 1; opacity: 0.75; }
  .chips .clear { background: none; color: var(--soft); border: 1px solid var(--hair); }
  .chips .clear:hover { color: var(--flamingo); border-color: var(--flamingo); }

  /* fit-content + max-width keeps the segmented control from pushing the page
     wide at 320px (WCAG 1.4.10); if it can't fit, it scrolls inside itself. */
  .courses {
    display: flex;
    width: fit-content;
    max-width: 100%;
    overflow-x: auto;
    border: 1px solid var(--hair);
    margin: var(--s4) 0 var(--s2);
  }
  .courses button {
    flex: 0 0 auto;
    min-height: var(--tap);
    padding: 0 var(--s4);
    font-size: var(--t-meta);
    letter-spacing: 0.14em;
    color: var(--soft);
    background: var(--card);
  }
  .courses button + button { border-left: 1px solid var(--hair); }
  .courses button[aria-pressed='true'] { background: var(--marine); color: var(--card); }

  .list { list-style: none; margin: 0; padding: 0; }

  .empty {
    margin-top: var(--s5);
    padding: var(--s7) var(--s6);
    background: var(--card);
    border: 1px solid var(--hair);
    box-shadow: var(--eyebrow);
  }
  .empty .lead { font-size: var(--t-name); font-weight: 500; margin: 0 0 var(--s3); }
  .empty .fix { margin: 0 0 var(--s3); }
  .empty ul { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--s1); justify-items: start; }
  .empty ul button, .empty .reset {
    display: inline-flex;
    align-items: center;
    gap: var(--s3);
    min-height: var(--tap);
    padding: 0 var(--s4);
    background: var(--paper);
    border: 1px solid var(--hair);
    font-size: var(--t-body);
    color: var(--soft);
  }
  .empty ul button:hover, .empty .reset:hover { border-color: var(--marine); color: var(--ink); }
  .empty .n { color: var(--marine); font-size: var(--t-body); }

  .sentinel { text-align: center; padding: var(--s6); }

  .loadmore {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--s3);
    width: 100%;
    min-height: var(--tap);
    margin-top: var(--s5);
    background: var(--card);
    border: 1px solid var(--rule);
    box-shadow: var(--eyebrow);
    font-family: var(--f-mono);
    font-size: var(--t-body);
    color: var(--marine);
  }
  .loadmore .n { color: var(--soft); }

  footer { padding: var(--s7) var(--s6); text-align: center; }
  footer p { margin: 0; letter-spacing: 0.08em; }

  @media (max-width: 860px) {
    .wrap { padding: 0 var(--s5); }
    .masthead { padding-top: var(--s6); }
    .layout { grid-template-columns: minmax(0, 1fr); gap: var(--s4); padding-top: var(--s5); }
    .rail { display: none; }
    .rail.open { display: block; }
    .rail-inner { position: static; max-height: none; }
    .toggle { display: inline-flex; }
  }

  @media (max-width: 560px) {
    /* The sort <select> takes its intrinsic width from the longest option
       ("Price low to high"), which pushes the filters button off-screen. */
    .bar { flex-wrap: wrap; row-gap: var(--s2); }
    .bar-right { flex: 1; min-width: 0; justify-content: flex-end; }
    .sortsel { min-width: 0; }
    .sortsel select { max-width: 100%; text-overflow: ellipsis; }

    /* The masthead was eating ~43% of the first mobile screen (critique). Tighten
       its rhythm so the actionable content sits closer to the fold. */
    .masthead { padding-top: var(--s5); }
    .eyebrow { margin-bottom: var(--s2); }
    .racing { margin-top: var(--s3); }
    .tagline { margin-top: var(--s2); }
    .promo { margin-top: var(--s1); }
    .masthead-tools { margin-top: var(--s3); }
    .horizon { margin-top: var(--s5); }
    .intro { margin-top: var(--s4); padding: var(--s3); }
  }
</style>
