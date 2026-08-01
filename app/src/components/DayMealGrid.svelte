<script>
  import { DAYS, DAY_LABEL, MEAL_LABEL, MEAL_ORDER, facets, dayRange, sortMeals } from '../lib/search.js'

  let { days = $bindable(), meals = $bindable() } = $props()

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
        title={DAY_FULL[d]}
        onclick={() => (days = toggle(days, d))}
      >
        {DAY_LABEL[d].slice(0, 1)}
      </button>
    {/each}
  </div>

  <div class="meals">
    {#each mealOptions as m}
      <button
        type="button"
        class="meal mono"
        class:on={meals.includes(m)}
        aria-pressed={meals.includes(m)}
        onclick={() => (meals = toggle(meals, m))}
      >
        {MEAL_LABEL[m] ?? m}
      </button>
    {/each}
  </div>

  <p class="summary mono" class:active={days.length || meals.length}>{summary}</p>
</div>

<style>
  .grid { display: grid; gap: 0.4rem; }

  .days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.25rem; }

  .day {
    aspect-ratio: 1 / 1;
    min-height: 28px;
    border: 1px solid var(--line);
    border-radius: var(--r-sm);
    background: var(--surface);
    color: var(--text-faint);
    font-size: 0.68rem;
    font-weight: 500;
    transition: border-color 140ms, color 140ms, background 140ms;
  }
  .day:hover { border-color: var(--surface-2); background: var(--surface-2); color: var(--text); }
  .day.on { background: var(--cyan); border-color: var(--cyan); color: var(--void); }

  .meals { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.25rem; margin-top: 0.15rem; }

  .meal {
    border: 1px solid var(--line);
    border-radius: var(--r-sm);
    background: var(--surface);
    color: var(--text-faint);
    padding: 0.3rem 0.2rem;
    font-size: 0.6rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    transition: border-color 140ms, color 140ms, background 140ms;
  }
  .meal:hover { border-color: var(--surface-2); background: var(--surface-2); color: var(--text); }
  .meal.on { background: var(--cyan); border-color: var(--cyan); color: var(--void); font-weight: 500; }

  .summary {
    margin: 0.25rem 0 0;
    font-size: 0.66rem;
    color: var(--text-faint);
    transition: color 140ms;
  }
  .summary.active { color: var(--cyan); }
</style>
