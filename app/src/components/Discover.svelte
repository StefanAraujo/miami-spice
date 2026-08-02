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
  let { onPick, onBrowseAll, onSurprise } = $props()

  // Every count is a real query over the 380 rows (~1ms each) — the number on a
  // tile is exactly what you'll get if you tap it. Never a stale or invented count.
  const n = (filters) => runQuery({ ...emptyFilters(), ...filters }).length

  const DAY_FULL = { MON: 'Monday', TUE: 'Tuesday', WED: 'Wednesday', THU: 'Thursday', FRI: 'Friday', SAT: 'Saturday', SUN: 'Sunday' }
  const TODAY = DAYS[(new Date().getDay() + 6) % 7]   // getDay 0=Sun; our DAYS start Mon

  const rank = (list, key) => list.map((v) => ({ v, c: n({ [key]: [v] }) })).sort((a, b) => b.c - a.c)
  const cuisines = rank(facets.cuisines, 'cuisines')
  const cities = rank(facets.cities || [], 'cities')
  const hoods = rank(facets.hoods, 'hoods')

  // Progressive disclosure (UX review P2): the front door was ~40 tiles at once
  // for a group that's already struggling to decide. Cap each long lane; expand
  // on demand. And the decisive "pick for us" moves to the TOP (see markup).
  const CAP = 6
  let expanded = $state({})
  const shown = (list, key) => (expanded[key] ? list : list.slice(0, CAP))
  const toggle = (key) => (expanded = { ...expanded, [key]: !expanded[key] })

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
  <p class="sub">Can't decide? Let us pick — or start from a craving, a place, a time, or the occasion.</p>

  <div class="decide decide-lead">
    <button class="pick-btn mono" type="button" onclick={onSurprise}>Pick one for us</button>
    <button class="browse mono" type="button" onclick={() => onPick(timing[0].filters, timing[0].sort)}>Open tonight<span class="tsub">{DAY_FULL[TODAY]}</span></button>
    <button class="browse mono" type="button" onclick={onBrowseAll}>Browse all {total}</button>
  </div>

  <div class="lane">
    <span class="micro">By cuisine</span>
    <div class="tiles">
      {#each shown(cuisines, 'cuisines') as { v, c }}
        <button class="tile" type="button" onclick={() => onPick({ cuisines: [v] })}>{v}<span class="n mono">{c}</span></button>
      {/each}
      {#if cuisines.length > CAP}<button class="more-tiles micro" type="button" onclick={() => toggle('cuisines')}>{expanded.cuisines ? 'Show fewer' : `+${cuisines.length - CAP} more`}</button>{/if}
    </div>
  </div>

  <div class="lane">
    <span class="micro">By city</span>
    <div class="tiles">
      {#each shown(cities, 'cities') as { v, c }}
        <button class="tile" type="button" onclick={() => onPick({ cities: [v] })}>{v}<span class="n mono">{c}</span></button>
      {/each}
      {#if cities.length > CAP}<button class="more-tiles micro" type="button" onclick={() => toggle('cities')}>{expanded.cities ? 'Show fewer' : `+${cities.length - CAP} more`}</button>{/if}
    </div>
  </div>

  <div class="lane">
    <span class="micro">By neighborhood</span>
    <div class="tiles">
      {#each shown(hoods, 'hoods') as { v, c }}
        <button class="tile" type="button" onclick={() => onPick({ hoods: [v] })}>{v}<span class="n mono">{c}</span></button>
      {/each}
      {#if hoods.length > CAP}<button class="more-tiles micro" type="button" onclick={() => toggle('hoods')}>{expanded.hoods ? 'Show fewer' : `+${hoods.length - CAP} more`}</button>{/if}
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

</section>

<style>
  .discover { padding: var(--s5) 0 var(--s7); }

  h2 {
    font-family: var(--f-display);
    font-weight: 700;
    font-size: var(--t-section);
    letter-spacing: -0.02em;
    line-height: 1.1;
    margin: 0 0 var(--s2);
  }
  .sub { margin: 0 0 var(--s6); color: var(--soft); font-size: var(--t-name); }

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
    border-radius: var(--r-full);
    color: var(--ink);
    font-size: var(--t-body);
    font-weight: 500;
  }
  .tile:hover { background: var(--marine-wash); border-color: transparent; color: var(--marine); }
  .tile .n { font-size: var(--t-meta); color: var(--soft); }
  .tile .tsub { font-size: var(--t-meta); color: var(--soft); }

  .decide { display: flex; flex-wrap: wrap; gap: var(--s3); align-items: center; margin-top: var(--s2); }
  .pick-btn, .browse {
    display: inline-flex;
    align-items: center;
    min-height: var(--tap);
    padding: 0 var(--s5);
    border-radius: var(--r-full);
    font-size: var(--t-body);
    font-weight: 590;
  }
  .pick-btn { background: var(--marine); color: var(--card); box-shadow: var(--eyebrow); }
  .pick-btn:hover { filter: brightness(1.08); }
  .browse { background: var(--sunk); color: var(--ink); }
  .browse:hover { background: var(--marine-wash); color: var(--marine); }
  .decide-lead { margin: 0 0 var(--s6); }
  .decide .tsub { margin-left: var(--s2); opacity: 0.8; }
  .more-tiles { min-height: var(--tap); padding: 0 var(--s3); color: var(--marine); }
</style>
