<script>
  import Row from './components/Row.svelte'
  import Discover from './components/Discover.svelte'
  import Map from './components/Map.svelte'
  import DayMealGrid from './components/DayMealGrid.svelte'
  import FacetGroup from './components/FacetGroup.svelte'
  import ViceMark from './components/ViceMark.svelte'
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
    return { f, sort: p.get('sort') || 'relevance', picks: nums('picks'), saved: p.get('saved') === '1' }
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
  // Persistent re-entry after the intro is dismissed (critique: no lasting help).
  const reopenIntro = () => {
    introSeen = false
    try { localStorage.removeItem('intro-seen') } catch {}
    window.scrollTo({ top: 0 })
  }
  // Cold start shows the Discover front door (ROADMAP Phase 4). "Browse all" is
  // the escape hatch to the full list without picking anything first.
  let browseAll = $state(!isEmpty(_url.f))
  let view = $state('list')   // 'list' | 'map' — both driven by the same filtered results
  let course = $state('all')  // 'all' | 'starters' | 'mains' | 'desserts' — the teaser lens
  const COURSES = [['all', 'All'], ['starters', 'Starters'], ['mains', 'Mains'], ['desserts', 'Desserts']]

  // Shortlist — the fix for the biggest gap in the UX review: an external place to
  // park candidates (closes Zeigarnik open loops) that doubles as a group-decision
  // primitive via a shareable URL. Client-side only via localStorage. A ?picks=id,id
  // link opens straight into someone else's shortlist.
  function storedShortlist() { try { return JSON.parse(localStorage.getItem('shortlist') || '[]') } catch { return [] } }
  let shortlist = $state(_url.picks.length ? _url.picks : storedShortlist())
  // A link shared FROM the shortlist (saved=1), or one carrying only picks, opens
  // straight to the shortlist — even if filters ride along.
  let showShortlist = $state(_url.saved || (_url.picks.length > 0 && isEmpty(_url.f)))
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
    if (showShortlist) p.set('saved', '1')   // so a shortlist share opens to the list
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

  // Clearing the shortlist is destructive to the group's decision, so it's undoable
  // for a few seconds rather than an instant, silent wipe (critique P2).
  let clearedStash = $state(null)
  let clearTimer
  const clearShortlist = () => {
    if (!shortlist.length) return
    clearedStash = shortlist.slice()
    shortlist = []
    if (clearTimer) clearTimeout(clearTimer)
    clearTimer = setTimeout(() => { clearedStash = null }, 6000)
  }
  const undoClear = () => {
    if (!clearedStash) return
    shortlist = clearedStash
    clearedStash = null
    if (clearTimer) clearTimeout(clearTimer)
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
  let pickIsTonight = $state(true)
  function pickForUs() {
    const openTonight = restaurants.filter((r) => r.serves.includes(`dinner@${TODAY}`))
    const pool = (openTonight.length ? openTonight : restaurants)
      .map((r) => ({ r, s: (r.michelin ? 4 : 0) + (r.flags.includes('michelin') ? 4 : 0) + (r.menus?.length || 0) + (r.prices.includes(65) ? 1 : 0) }))
      .sort((a, b) => b.s - a.s)
      .slice(0, 15)
    pickedId = pool[Math.floor(Math.random() * pool.length)]?.r?.id ?? null
    pickIsTonight = true
    showShortlist = false
  }
  // Opening a restaurant from a map pin reuses the single-restaurant detail view.
  const openFromMap = (id) => { pickedId = id; pickIsTonight = false; showShortlist = false }
  const pickedRow = $derived(pickedId != null ? getById(pickedId) : null)

  // Say WHY, so "Pick for us" reads as a reasoned choice, not a dice roll (critique).
  const pickReason = $derived.by(() => {
    const r = pickedRow
    if (!r) return ''
    const bits = []
    if (r.serves?.includes(`dinner@${TODAY}`)) bits.push('open for dinner tonight')
    if (r.michelin) bits.push('Michelin-recognised')
    const dishes = (r.menus || []).reduce((n, m) => n + m.courses.reduce((s, c) => s + c.of, 0), 0)
    if (dishes) bits.push(`${dishes} dishes to choose from`)
    if (r.max_price === 65) bits.push('a full $65 prix-fixe')
    return bits.join(' · ')
  })

  // Moving to the single-restaurant view should move focus + scroll there, so a
  // screen-reader/keyboard user isn't stranded on the now-unmounted button (critique P3).
  let pickHeading
  $effect(() => {
    if (pickedRow && pickHeading) { pickHeading.focus({ preventScroll: true }); window.scrollTo({ top: 0 }) }
  })

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

  // "Updated…" is stated once, in the intro/promo — not repeated here (critique:
  // three near-duplicate freshness signals crowded the mobile masthead).
  const tagline = [
    `${restaurants.length} restaurants`,
    `${facets.cuisines.length} cuisines`,
    `${facets.hoods.length} neighborhoods`,
  ].join('  ·  ')

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

<!-- DIRECTION: "Apple form · Vice night" (2026-08-02 redesign). Form language is
     Apple HIG — SF system type, continuous rounded corners, soft neutral depth,
     translucent-grade layering, generous rhythm, sentence case, system-tint
     controls. Colour soul stays Miami Vice at night: deep marine field, cyan tint,
     one flamingo for price. All product truth, function, copy and constraints
     preserved; the retired look was Tropical Deco (hard offset "eyebrow" slab,
     Poiret/Jost, uppercase eyebrows). See DESIGN.md. -->

<!-- An iOS-style large title: the wordmark leads, a system-tint action sits to the
     right, and a quiet subtitle carries the facts. Sentence case, soft, no ornament. -->
<header class="masthead">
  <div class="wrap topbar">
    <div class="brand">
      <span class="brandmark" aria-hidden="true"><ViceMark size={42} /></span>
      <h1 class="wordmark"><button type="button" class="wordmark-btn" onclick={goHome} title="Back to start" aria-label="Miami Spice — back to start">Miami Spice</button></h1>
    </div>
    <div class="masthead-tools">
      <button type="button" class="shortlist-btn" aria-pressed={showShortlist}
        onclick={() => (showShortlist = !showShortlist)}>
        Shortlist{#if shortlist.length}<span class="badge mono">{shortlist.length}</span>{/if}
      </button>
    </div>
  </div>
  <div class="wrap subhead">
    <p class="tagline">{tagline}</p>
    <p class="promo">{promo}</p>
  </div>
</header>

{#if !introSeen}
  <div class="wrap">
    <aside class="intro" aria-label="About Miami Spice">
      <p>The honest Miami Spice menu — which nights each spot actually serves it, and the full three-course lineup, filtered instantly. Unofficial · updated weekly.</p>
      <button type="button" class="intro-x" onclick={dismissIntro}>Got it</button>
    </aside>
  </div>
{/if}

<div class="wrap layout">
  <aside class="rail" class:open={filtersOpen}>
    <div class="rail-inner">
      <label class="search">
        <span class="sr-only">Search restaurants, cuisines or dishes</span>
        <input type="search" placeholder="Search a name or dish…" bind:value={f.query} />
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
        <h2 class="sr-only" tabindex="-1" bind:this={pickHeading}>{pickIsTonight ? "Tonight's pick" : 'Selected restaurant'}</h2>
        <div class="bar">
          <p class="count"><span class="micro">{pickIsTonight ? "Tonight's pick" : 'From the map'}</span></p>
          <div class="bar-right">
            {#if pickIsTonight}<button type="button" class="sl-action micro" onclick={pickForUs}>Pick another for us</button>{/if}
            <button type="button" class="sl-action micro" onclick={() => { pickedId = null; browseAll = true }}>Browse all</button>
          </div>
        </div>
        {#if pickReason}<p class="pickwhy micro">Why this one: {pickReason}.</p>{/if}
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
              <button type="button" class="sl-action micro" onclick={clearShortlist}>Clear</button>
            {/if}
            <button type="button" class="sl-action micro" onclick={() => (showShortlist = false)}>Done</button>
          </div>
        </div>
        {#if shareMsg}<p class="share-msg micro" aria-live="polite">{shareMsg}</p>{/if}
        {#if clearedStash}<p class="share-msg micro" aria-live="assertive">Shortlist cleared. <button type="button" class="undo-link" onclick={undoClear}>Undo</button></p>{/if}
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
      <Map {results} onOpen={openFromMap} />
    {:else if results.length === 0}
      <div class="empty">
        <span class="empty-mark" aria-hidden="true"><ViceMark size={52} /></span>
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
  <button type="button" class="about-link micro" onclick={reopenIntro}>About this directory</button>
</footer>

<style>
  .wrap { max-width: 1120px; margin: 0 auto; padding: 0 var(--s6); }

  .masthead { padding: var(--s8) 0 0; }
  .topbar { display: flex; align-items: center; justify-content: space-between; gap: var(--s4); }
  .brand { display: flex; align-items: center; gap: var(--s3); min-width: 0; }
  .brandmark { flex: none; color: var(--marine); }

  /* The large title — SF at full display strength, heavy and tight. This is the
     bolder move: the app's name commands the top of the page. */
  .wordmark {
    font-family: var(--f-display);
    font-weight: 800;
    font-size: var(--t-display);
    letter-spacing: -0.035em;
    line-height: 1;
    margin: 0;
  }
  .wordmark-btn { display: inline-flex; align-items: center; min-height: var(--tap); font: inherit; letter-spacing: inherit; color: inherit; }
  .wordmark-btn:hover { color: var(--marine); }

  .subhead { margin-top: var(--s3); }
  .tagline { margin: 0; font-size: var(--t-body); color: var(--soft); }
  .promo { margin: var(--s1) 0 0; font-size: var(--t-body); color: var(--marine); }

  .intro {
    display: flex;
    gap: var(--s4);
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    margin-top: var(--s5);
    padding: var(--s4) var(--s5);
    background: var(--card);
    border: 1px solid var(--hair);
    border-radius: var(--r-lg);
    box-shadow: var(--eyebrow);
  }
  .intro p { margin: 0; font-size: var(--t-body); color: var(--soft); max-width: 66ch; }
  .intro-x {
    flex: none;
    display: inline-flex;
    align-items: center;
    min-height: var(--tap);
    padding: 0 var(--s5);
    border-radius: var(--r-full);
    background: var(--marine);
    color: var(--card);
    font-weight: 590;
  }
  .intro-x:hover { filter: brightness(1.08); }

  .moodhint { margin: var(--s3) 0 0; color: var(--soft); }
  .pickwhy { margin: var(--s3) 0 0; color: var(--marine); }

  /* The masthead tools row — the shortlist action, right-aligned in the nav. */
  .masthead-tools { display: flex; align-items: center; gap: var(--s3); }
  .shortlist-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--s2);
    min-height: var(--tap);
    padding: 0 var(--s4);
    border-radius: var(--r-full);
    background: var(--sunk);
    color: var(--ink);
    font-size: var(--t-body);
    font-weight: 500;
  }
  .shortlist-btn:hover { background: var(--marine-wash); }
  .shortlist-btn[aria-pressed='true'] { background: var(--marine); color: var(--card); }
  .shortlist-btn .badge { background: var(--flamingo); color: var(--card); border-radius: var(--r-full); padding: 1px 8px; font-size: var(--t-meta); }
  .shortlist-btn[aria-pressed='true'] .badge { background: var(--card); color: var(--marine); }

  .share-btn {
    display: inline-flex;
    align-items: center;
    min-height: var(--tap);
    padding: 0 var(--s4);
    border-radius: var(--r-full);
    background: var(--marine);
    color: var(--card);
    font-weight: 590;
    box-shadow: var(--eyebrow);
  }
  .share-btn:hover { filter: brightness(1.08); }
  .share-msg { margin: var(--s3) 0 0; color: var(--signal); }
  .undo-link { color: var(--marine); text-decoration: underline; }

  .sl-action {
    display: inline-flex;
    align-items: center;
    min-height: var(--tap);
    padding: 0 var(--s4);
    border-radius: var(--r-full);
    background: var(--sunk);
    color: var(--soft);
  }
  .sl-action:hover { color: var(--ink); background: var(--marine-wash); }


  .layout {
    display: grid;
    grid-template-columns: 216px minmax(0, 1fr);
    gap: var(--s7);
    align-items: start;
    padding-top: var(--s7);
  }

  .rail-inner { position: sticky; top: var(--s5); max-height: calc(100vh - var(--s7)); overflow-y: auto; }

  .group { display: grid; gap: var(--s3); margin-bottom: var(--s6); }
  .group h3 { margin: 0; }

  .search { display: block; margin-bottom: var(--s6); }
  .search input {
    width: 100%;
    min-height: var(--tap);
    padding: 0 var(--s4);
    background: var(--sunk);
    border: 1px solid transparent;
    border-radius: var(--r-md);
    font-size: var(--t-body);
  }
  .search input::placeholder { color: var(--soft); }
  .search input:hover { background: var(--marine-wash); }
  .search input:focus { background: var(--card); border-color: var(--marine); }

  .bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--s4);
    padding-bottom: var(--s4);
    border-bottom: 1px solid var(--hair);
  }

  .count { margin: 0; display: flex; align-items: baseline; gap: var(--s2); }
  .count strong { font-size: var(--t-section); font-weight: 800; letter-spacing: -0.03em; }

  .bar-right { display: flex; align-items: center; gap: var(--s2); }

  /* iOS segmented control — a filled track with a soft neutral thumb on the
     selected segment, not a tinted fill. */
  .viewsel { display: inline-flex; gap: 2px; padding: 3px; background: var(--sunk); border-radius: var(--r-md); }
  .viewsel button {
    min-height: var(--tap);
    padding: 0 var(--s4);
    font-size: var(--t-meta);
    font-weight: 590;
    color: var(--soft);
    border-radius: var(--r-sm);
  }
  .viewsel button[aria-pressed='true'] { background: var(--card); color: var(--ink); box-shadow: var(--eyebrow); }

  .bar-share { min-height: var(--tap); padding: 0 var(--s4); border-radius: var(--r-full); background: var(--sunk); color: var(--soft); }
  .bar-share:hover { color: var(--marine); background: var(--marine-wash); }

  .sortsel select {
    min-height: var(--tap);
    padding: 0 var(--s3);
    background: var(--sunk);
    border: 1px solid transparent;
    border-radius: var(--r-md);
    font-size: var(--t-meta);
    color: var(--soft);
  }

  .toggle {
    display: none;
    align-items: center;
    min-height: var(--tap);
    padding: 0 var(--s4);
    background: var(--sunk);
    border-radius: var(--r-full);
    white-space: nowrap;
  }

  .chips { list-style: none; display: flex; flex-wrap: wrap; gap: var(--s2); margin: var(--s4) 0 0; padding: 0; }
  .chips button {
    display: inline-flex;
    align-items: center;
    gap: var(--s2);
    min-height: var(--tap);
    padding: 0 var(--s3) 0 var(--s4);
    border-radius: var(--r-full);
    background: var(--marine);
    color: var(--card);
    font-size: var(--t-meta);
    font-weight: 590;
  }
  .chips .x { font-size: var(--t-body); line-height: 1; opacity: 0.75; }
  .chips .clear { background: var(--sunk); color: var(--soft); }
  .chips .clear:hover { color: var(--flamingo); }

  /* fit-content + max-width keeps the segmented control from pushing the page
     wide at 320px (WCAG 1.4.10); if it can't fit, it scrolls inside itself. */
  .courses {
    display: flex;
    gap: 2px;
    width: fit-content;
    max-width: 100%;
    overflow-x: auto;
    padding: 3px;
    background: var(--sunk);
    border-radius: var(--r-md);
    margin: var(--s5) 0 var(--s2);
  }
  .courses button {
    flex: 0 0 auto;
    min-height: var(--tap);
    padding: 0 var(--s4);
    font-size: var(--t-meta);
    font-weight: 590;
    color: var(--soft);
    border-radius: var(--r-sm);
  }
  .courses button[aria-pressed='true'] { background: var(--card); color: var(--ink); box-shadow: var(--eyebrow); }

  .list { list-style: none; margin: 0; padding: 0; }

  .empty {
    margin-top: var(--s5);
    padding: var(--s7) var(--s6);
    background: var(--card);
    border: 1px solid var(--hair);
    border-radius: var(--r-lg);
    box-shadow: var(--eyebrow);
  }
  .empty-mark { display: block; color: var(--marine); margin-bottom: var(--s4); }
  .empty .lead { font-size: var(--t-title); font-weight: 700; letter-spacing: -0.02em; margin: 0 0 var(--s3); }
  .empty .fix { margin: 0 0 var(--s3); }
  .empty ul { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--s2); justify-items: start; }
  .empty ul button, .empty .reset {
    display: inline-flex;
    align-items: center;
    gap: var(--s3);
    min-height: var(--tap);
    padding: 0 var(--s4);
    background: var(--sunk);
    border-radius: var(--r-full);
    font-size: var(--t-body);
    color: var(--ink);
  }
  .empty ul button:hover, .empty .reset:hover { background: var(--marine-wash); color: var(--ink); }
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
    border: 1px solid var(--hair);
    border-radius: var(--r-full);
    box-shadow: var(--eyebrow);
    font-size: var(--t-body);
    font-weight: 590;
    color: var(--marine);
  }
  .loadmore:hover { background: var(--marine-wash); }
  .loadmore .n { color: var(--soft); font-weight: 400; }

  footer { padding: var(--s7) var(--s6); text-align: center; }
  footer p { margin: 0; }
  .about-link {
    display: inline-flex;
    align-items: center;
    min-height: var(--tap);
    margin-top: var(--s2);
    color: var(--marine);
  }
  .about-link:hover { text-decoration: underline; }

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

    .masthead { padding-top: var(--s5); }
    .intro { margin-top: var(--s4); padding: var(--s4); }
  }
</style>
