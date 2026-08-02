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
  let { r, course = 'all' } = $props()
  let open = $state(false)

  const panelId = $derived(`menu-${r.id}`)
  const byMeal = (a, b) => MEAL_ORDER.indexOf(a.meal) - MEAL_ORDER.indexOf(b.meal)

  // Total dishes on offer — the "how much choice do I get" number the official
  // site buries. Built in the script (not the markup) to dodge Svelte's leading-
  // whitespace trim inside {#if}.
  const choiceCount = $derived((r.menus || []).reduce((n, m) => n + m.courses.reduce((s, c) => s + c.of, 0), 0))

  // Tier 2: every differentiator collapsed onto one dot-separated line.
  const meta = $derived(
    [r.cuisines.join(', ') || 'Restaurant', r.tier, r.hood, choiceCount ? `${choiceCount} dishes` : null]
      .filter(Boolean).join('  ·  '),
  )
  const offers = $derived([...r.offers].sort(byMeal))
  const menus = $derived([...r.menus].sort(byMeal))

  // The course "lens" from the strip re-points the teaser at that course.
  const COURSE_PAT = { starters: /appet|starter/i, mains: /entree|main/i, desserts: /dessert/i }

  /** One or two distinctive dishes — follows the selected course when one is set. */
  const teaser = $derived.by(() => {
    const pat = COURSE_PAT[course]
    for (const m of menus) {
      const c = pat
        ? m.courses.find((x) => pat.test(x.name) && x.of)
        : (m.courses.find((x) => /entree/i.test(x.name) && x.of) ?? m.courses.find((x) => x.of))
      if (c?.items?.length) return c.items.slice(0, 2).join('  ·  ')
    }
    return null
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
