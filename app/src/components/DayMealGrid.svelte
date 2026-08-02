<script>
  import { DAYS, DAY_LABEL, MEAL_LABEL, MEAL_ORDER, facets, dayRange, sortMeals } from '../lib/search.js'

  let { days = $bindable(), meals = $bindable(), counts = {} } = $props()

  const DAY_FULL = { MON: 'Monday', TUE: 'Tuesday', WED: 'Wednesday', THU: 'Thursday', FRI: 'Friday', SAT: 'Saturday', SUN: 'Sunday' }
  const mealOptions = MEAL_ORDER.filter((m) => facets.meals.includes(m))

  const toggle = (list, v) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v])

  const summary = $derived.by(() => {
    if (!days.length && !meals.length) return 'Any day, any meal'
    const m = meals.length ? sortMeals(meals).map((x) => MEAL_LABEL[x]).join(' + ') : 'Anything'
    if (!days.length) return `${m}, any day`
    return `${m} on ${dayRange(days)}`
  })
</script>

<div class="grid" role="group" aria-label="Day and meal">
  <div class="days">
    {#each DAYS as d}
      <button
        type="button"
        class="day mono"
        class:on={days.includes(d)}
        aria-pressed={days.includes(d)}
        aria-label={DAY_FULL[d]}
        title="{DAY_FULL[d]}{counts.days?.[d] !== undefined ? ` — ${counts.days[d]} restaurants` : ''}"
        disabled={!days.includes(d) && counts.days?.[d] === 0}
        onclick={() => (days = toggle(days, d))}
      >{DAY_LABEL[d].slice(0, 1)}</button>
    {/each}
  </div>

  <div class="meals">
    {#each mealOptions as m}
      <button
        type="button"
        class="meal"
        class:on={meals.includes(m)}
        aria-pressed={meals.includes(m)}
        disabled={!meals.includes(m) && counts.meals?.[m] === 0}
        onclick={() => (meals = toggle(meals, m))}
      >
        {MEAL_LABEL[m] ?? m}{#if counts.meals?.[m] !== undefined}<span class="n mono">{counts.meals[m]}</span>{/if}
      </button>
    {/each}
  </div>

  <p class="summary mono" class:active={days.length || meals.length}>{summary}</p>
</div>

<style>
  .grid { display: grid; gap: var(--s1); }

  /* 7 x 44px will not fit a 216px rail, so the grid wraps rather than
     shrinking cells below Apple's target floor. */
  .days { display: grid; grid-template-columns: repeat(auto-fit, minmax(44px, 1fr)); gap: 3px; }

  .day {
    min-height: var(--tap);
    min-width: var(--tap);
    font-size: var(--t-meta);
    color: var(--soft);
    background: var(--card);
    border: 1px solid var(--hair);
  }
  .day:hover:not(:disabled) { border-color: var(--rule); color: var(--ink); }
  .day.on { background: var(--marine); border-color: var(--marine); color: var(--card); }
  .day:disabled { opacity: 0.45; cursor: default; }

  .meals { display: flex; flex-wrap: wrap; gap: 3px; margin-top: 3px; }

  .meal {
    display: inline-flex;
    align-items: center;
    min-height: var(--tap);
    padding: 0 var(--s3);
    font-size: var(--t-body);
    color: var(--soft);
    background: var(--card);
    border: 1px solid var(--hair);
  }
  .meal:hover:not(:disabled) { border-color: var(--rule); color: var(--ink); }
  .meal.on { background: var(--marine); border-color: var(--marine); color: var(--card); }
  .meal:disabled { opacity: 0.45; cursor: default; }

  .n { font-size: var(--t-meta); color: var(--soft); margin-left: var(--s2); }
  .meal.on .n { color: var(--card); opacity: 0.75; }

  .summary { margin: var(--s2) 0 0; font-size: var(--t-meta); color: var(--soft); }
  .summary.active { color: var(--marine); }
</style>
