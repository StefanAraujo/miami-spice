<script>
  import { facets, runQuery, emptyFilters, DAYS, MOODS } from '../lib/search.js'

  /**
   * The front door (ROADMAP Phase 4). NN/g frames the homepage as a "safe harbor"
   * that must convey purpose immediately; an empty filter rail says "you already
   * know what to filter." So on a cold start we offer the four ways people actually
   * arrive — a cuisine, a neighborhood, a time, or the occasion — each a tile that
   * resolves to a {filters, sort} pushed into the SAME runQuery (no parallel path),
   * so chips, facet counts and relaxations all keep working.
   */
  let { onPick, onBrowseAll } = $props()

  // Every count is a real query over the 380 rows (~1ms each) — the number on a
  // tile is exactly what you'll get if you tap it. Never a stale or invented count.
  const n = (filters) => runQuery({ ...emptyFilters(), ...filters }).length

  const DAY_FULL = { MON: 'Monday', TUE: 'Tuesday', WED: 'Wednesday', THU: 'Thursday', FRI: 'Friday', SAT: 'Saturday', SUN: 'Sunday' }
  const TODAY = DAYS[(new Date().getDay() + 6) % 7]   // getDay 0=Sun; our DAYS start Mon

  const rank = (list, key) => list.map((v) => ({ v, c: n({ [key]: [v] }) })).sort((a, b) => b.c - a.c)
  const cuisines = rank(facets.cuisines, 'cuisines').slice(0, 10)
  const cities = rank(facets.cities || [], 'cities').slice(0, 8)
  const hoods = rank(facets.hoods, 'hoods').slice(0, 8)

  const timing = [
    { label: 'Open tonight', sub: DAY_FULL[TODAY], filters: { meals: ['dinner'], days: [TODAY] } },
    { label: 'Weekend brunch', filters: { meals: ['brunch'], days: ['SAT', 'SUN'] } },
    { label: 'Lunch under $40', filters: { meals: ['lunch'], prices: [40] } },
  ]
  const occasions = [
    { label: 'Date night', filters: { flags: ['outdoor'], meals: ['dinner'], prices: [50, 65] }, sort: 'price_desc' },
    { label: 'Celebration', filters: { prices: [65], meals: ['dinner'] }, sort: 'price_desc' },
    { label: 'Solo & value', filters: { prices: [40] }, sort: 'price_asc' },
    { label: 'Al-fresco', filters: { flags: ['outdoor'] } },
  ]
  const moods = Object.entries(MOODS).map(([id, m]) => ({ id, label: m.label, c: n({ mood: id }) }))
  const total = n({})
</script>

<section class="discover">
  <h2>What are you in the mood for?</h2>
  <p class="sub">Start from a cuisine, a neighborhood, a time, or the occasion — or browse all {total}.</p>

  <div class="lane">
    <span class="micro">By cuisine</span>
    <div class="tiles">
      {#each cuisines as { v, c }}
        <button class="tile" type="button" onclick={() => onPick({ cuisines: [v] })}>{v}<span class="n mono">{c}</span></button>
      {/each}
    </div>
  </div>

  <div class="lane">
    <span class="micro">By city</span>
    <div class="tiles">
      {#each cities as { v, c }}
        <button class="tile" type="button" onclick={() => onPick({ cities: [v] })}>{v}<span class="n mono">{c}</span></button>
      {/each}
    </div>
  </div>

  <div class="lane">
    <span class="micro">By neighborhood</span>
    <div class="tiles">
      {#each hoods as { v, c }}
        <button class="tile" type="button" onclick={() => onPick({ hoods: [v] })}>{v}<span class="n mono">{c}</span></button>
      {/each}
    </div>
  </div>

  <div class="lane">
    <span class="micro">By mood</span>
    <div class="tiles">
      {#each moods as m}
        <button class="tile" type="button" onclick={() => onPick({ mood: m.id })}>{m.label}<span class="n mono">{m.c}</span></button>
      {/each}
    </div>
  </div>

  <div class="lane">
    <span class="micro">When you're going</span>
    <div class="tiles">
      {#each timing as t}
        <button class="tile" type="button" onclick={() => onPick(t.filters, t.sort)}>
          {t.label}{#if t.sub}<span class="tsub">{t.sub}</span>{/if}<span class="n mono">{n(t.filters)}</span>
        </button>
      {/each}
    </div>
  </div>

  <div class="lane">
    <span class="micro">The occasion</span>
    <div class="tiles">
      {#each occasions as o}
        <button class="tile" type="button" onclick={() => onPick(o.filters, o.sort)}>{o.label}<span class="n mono">{n(o.filters)}</span></button>
      {/each}
    </div>
  </div>

  <button class="browse" type="button" onclick={onBrowseAll}>Browse all {total} restaurants</button>
</section>

<style>
  .discover { padding: var(--s5) 0 var(--s7); }

  h2 {
    font-family: var(--f-deco);
    font-weight: 400;
    font-size: var(--t-section);
    letter-spacing: 0.02em;
    margin: 0 0 var(--s2);
  }
  .sub { margin: 0 0 var(--s6); color: var(--soft); }

  .lane { margin-bottom: var(--s6); }
  .lane > .micro { display: block; margin-bottom: var(--s3); }

  .tiles { display: flex; flex-wrap: wrap; gap: var(--s2); }

  .tile {
    display: inline-flex;
    align-items: baseline;
    gap: var(--s2);
    min-height: var(--tap);
    padding: 0 var(--s4);
    background: var(--card);
    border: 1px solid var(--hair);
    color: var(--ink);
    font-size: var(--t-body);
  }
  .tile:hover { border-color: var(--marine); color: var(--marine); }
  .tile .n { font-size: var(--t-meta); color: var(--soft); }
  .tile .tsub { font-size: var(--t-meta); color: var(--soft); font-style: italic; }

  .browse {
    display: inline-flex;
    align-items: center;
    min-height: var(--tap);
    padding: 0 var(--s5);
    margin-top: var(--s2);
    background: var(--marine);
    color: var(--card);
    box-shadow: var(--eyebrow);
    font-family: var(--f-mono);
    font-size: var(--t-body);
  }
</style>
