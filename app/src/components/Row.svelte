<script>
  import CourseLadder from './CourseLadder.svelte'
  import ScheduleGrid from './ScheduleGrid.svelte'
  import { priceRange, offerLine, flagLabel, MEAL_ORDER } from '../lib/search.js'

  /**
   * A result ROW, not a card. NN/g lists four cases where cards are the wrong
   * component — search contexts, comparison tasks, homogeneous content, and
   * information density — and a 380-restaurant directory is all four. Rows keep
   * every name on one x-coordinate, which is what produces the layer-cake gaze
   * plot that makes a long list scannable.
   *
   * Three tiers and no more (the anchor / differentiators / price), per the
   * hierarchy every one of OpenTable, Yelp, Zillow and Google Flights uses.
   * Secondary actions live in the expanded panel; moving them off the row is
   * what buys the density.
   */
  let { r } = $props()
  let open = $state(false)

  const panelId = $derived(`menu-${r.id}`)
  const byMeal = (a, b) => MEAL_ORDER.indexOf(a.meal) - MEAL_ORDER.indexOf(b.meal)

  // Tier 2: every differentiator collapsed onto one dot-separated line.
  const meta = $derived([r.cuisines.join(', ') || 'Restaurant', r.tier, r.hood].filter(Boolean).join('  ·  '))
  const offers = $derived([...r.offers].sort(byMeal))
  const menus = $derived([...r.menus].sort(byMeal))

  /** One distinctive dish — the thing the official site buries behind a click. */
  const teaser = $derived.by(() => {
    const m = menus[0]
    const course = m?.courses.find((c) => /entree/i.test(c.name) && c.of) ?? m?.courses.find((c) => c.of)
    return course?.items?.[0] ?? null
  })
</script>

<li class="row" class:open>
  <button class="main" type="button" aria-expanded={open} aria-controls={panelId} onclick={() => (open = !open)}>
    <span class="text">
      <span class="name">{r.name}</span>
      <span class="meta mono">{meta}</span>
      {#if teaser}<span class="teaser">{teaser}</span>{/if}
    </span>
    <span class="side">
      <span class="price mono">{priceRange(r)}</span>
      <span class="when mono">{offers.map(offerLine).join('  ·  ')}</span>
    </span>
    <span class="chev" aria-hidden="true"></span>
  </button>

  {#if open}
    <div class="panel" id={panelId}>
      {#if offers.length}
        <p class="sched-h micro">When it's served</p>
        <ScheduleGrid {offers} />
      {/if}

      <CourseLadder {menus} />

      {#if r.flags.length}
        <p class="flags micro">{r.flags.map(flagLabel).join('  ·  ')}</p>
      {/if}

      <div class="actions">
        {#if r.reserve}
          <a class="cta mono" href={r.reserve} target="_blank" rel="noopener">Book on {r.platform || 'their site'}</a>
        {/if}
        {#if r.maps}<a class="mono" href={r.maps} target="_blank" rel="noopener">Directions</a>{/if}
        <a class="mono" href={r.url} target="_blank" rel="noopener">Details</a>
      </div>
    </div>
  {/if}
</li>

<style>
  .row { border-bottom: 1px solid var(--hair); }

  /* The whole row is the disclosure control, which makes the primary target far
     larger than Apple's 44pt floor instead of a 27px button. */
  .main {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto 20px;
    gap: var(--s6);
    align-items: center;
    width: 100%;
    text-align: left;
    padding: var(--s4) 0;
    min-height: var(--tap);
  }
  .main:hover .name { color: var(--marine); }

  .text { display: block; min-width: 0; }

  .name {
    display: block;
    font-size: var(--t-name);
    font-weight: 600;
    letter-spacing: -0.005em;
    line-height: 1.2;
  }

  .meta {
    display: block;
    font-size: var(--t-meta);
    color: var(--soft);
    margin-top: var(--s1);
    letter-spacing: 0.02em;
  }

  .teaser {
    display: block;
    font-size: var(--t-body);
    color: var(--soft);
    margin-top: 5px;
    font-style: italic;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .side { text-align: right; white-space: nowrap; }

  /* Signage price chip — flamingo fill, hard offset shadow, like a hand-painted
     Deco sign plate. The one saturated object per row (Chanel's "one accessory"). */
  .price {
    display: inline-block;
    font-size: var(--t-body);
    font-weight: 500;
    padding: var(--s1) var(--s3);
    background: var(--flamingo);
    color: var(--card);
    box-shadow: var(--eyebrow);
  }

  .when { display: block; font-size: var(--t-meta); color: var(--soft); margin-top: var(--s1); }

  .chev {
    width: 9px; height: 9px;
    border-right: 1.5px solid var(--rule);
    border-bottom: 1.5px solid var(--rule);
    transform: rotate(45deg);
    justify-self: end;
  }
  .row.open .chev { transform: rotate(225deg); }

  /* Deco eyebrow: a hard offset slab, zero blur. */
  .panel {
    margin: 0 0 var(--s4);
    padding: var(--s5) var(--s5) var(--s4);
    background: var(--card);
    border: 1px solid var(--hair);
    box-shadow: var(--eyebrow);
  }

  .sched-h { margin: 0 0 var(--s3); letter-spacing: 0.14em; }

  .flags { margin: var(--s5) 0 0; letter-spacing: 0.1em; }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--s5);
    align-items: center;
    margin-top: var(--s4);
    padding-top: var(--s3);
    border-top: 1px solid var(--hair);
  }
  .actions a {
    display: inline-flex;
    align-items: center;
    min-height: var(--tap);
    font-family: var(--f-mono);
    font-size: var(--t-body);
    text-decoration: none;
    color: var(--soft);
  }
  .actions a:hover { color: var(--marine); }
  .actions .cta {
    color: var(--card);
    background: var(--marine);
    padding: 0 var(--s5);
    box-shadow: 4px 4px 0 rgba(18, 65, 76, 0.18);
  }

  @media (max-width: 720px) {
    .main { grid-template-columns: minmax(0, 1fr) 20px; gap: var(--s3); align-items: start; }
    .side { grid-column: 1; text-align: left; margin-top: var(--s2); }
    .when { white-space: normal; }
    .panel { padding: var(--s4); }
  }
</style>
