<script>
  import { DAYS, DAY_LABEL, MEAL_LABEL, MEAL_ORDER } from '../lib/search.js'

  /**
   * Per-restaurant availability matrix: meal (row) × day (column), a filled cell
   * where that meal is served that day. Worth building because 123/380
   * restaurants serve a DIFFERENT day-set per meal (e.g. dinner nightly but
   * lunch weekdays only), which the "Lunch $40 · Mon–Sat" summary line can't show
   * at a glance. Reads r.offers, which the spice_schedule fix made accurate.
   *
   * A real <table> so it announces correctly to screen readers; the visual cell
   * carries an aria-label, not a glyph, so nothing depends on colour alone.
   */
  let { offers = [] } = $props()

  const byMeal = (a, b) => MEAL_ORDER.indexOf(a.meal) - MEAL_ORDER.indexOf(b.meal)
  const rows = $derived([...offers].sort(byMeal))
</script>

<table class="sched">
  <caption class="sr-only">Which meals are served on which days</caption>
  <thead>
    <tr>
      <td class="corner"></td>
      {#each DAYS as d}<th scope="col" class="day micro">{DAY_LABEL[d].slice(0, 2)}</th>{/each}
    </tr>
  </thead>
  <tbody>
    {#each rows as o}
      <tr>
        <th scope="row" class="rowh">
          <span class="ml">{MEAL_LABEL[o.meal] ?? o.meal}</span>
          {#if o.price}<span class="pr mono">${o.price}</span>{/if}
        </th>
        {#each DAYS as d}
          {@const on = o.days.includes(d)}
          <td class="cell" class:on aria-label="{MEAL_LABEL[o.meal] ?? o.meal}, {DAY_LABEL[d]}: {on ? 'served' : 'not served'}"></td>
        {/each}
      </tr>
    {/each}
  </tbody>
</table>

<p class="legend">
  <span><i class="sw on" aria-hidden="true"></i> served</span>
  <span><i class="sw" aria-hidden="true"></i> not served</span>
</p>

<style>
  .sched { border-collapse: separate; border-spacing: 3px; margin: 0 -3px var(--s5); }

  .corner { width: 1%; }

  .day {
    text-align: center;
    font-weight: 400;
    color: var(--soft);
    letter-spacing: 0;
    padding: 0 0 var(--s2);
  }

  .rowh {
    text-align: left;
    white-space: nowrap;
    font-weight: 400;
    padding: var(--s1) var(--s4) var(--s1) 0;
  }
  .rowh .ml { font-size: var(--t-body); color: var(--ink); }
  .rowh .pr { font-size: var(--t-meta); color: var(--flamingo); margin-left: var(--s2); }

  /* Filled = served, empty = not. The system tint fills a served cell; soft
     rounded cells, no glow. */
  .cell {
    width: 30px;
    height: 26px;
    background: var(--sunk);
    border-radius: var(--r-sm);
  }
  .cell.on { background: var(--marine); }

  /* Legend so "filled = served" is explicit, not inferred (UX review Help gap). */
  .legend { display: flex; gap: var(--s4); margin: var(--s3) 0 0; font-size: var(--t-meta); color: var(--soft); }
  .legend .sw { display: inline-block; width: 12px; height: 12px; background: var(--sunk); border-radius: 3px; vertical-align: -1px; margin-right: 4px; }
  .legend .sw.on { background: var(--marine); }

  @media (max-width: 560px) {
    .cell { width: 26px; }
    .rowh .pr { display: none; }
  }
</style>
