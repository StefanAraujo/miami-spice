<script>
  import { DAYS, DAY_LABEL, MEAL_LABEL, MEAL_ORDER, facets, dayRange, sortMeals } from '../lib/search.js'

  let { days = $bindable(), meals = $bindable() } = $props()

  const mealOptions = MEAL_ORDER.filter((m) => facets.meals.includes(m))

  const DAY_FULL = { MON: 'Monday', TUE: 'Tuesday', WED: 'Wednesday', THU: 'Thursday', FRI: 'Friday', SAT: 'Saturday', SUN: 'Sunday' }

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
        class="meal"
        class:on={meals.includes(m)}
        aria-pressed={meals.includes(m)}
        onclick={() => (meals = toggle(meals, m))}
      >
        {MEAL_LABEL[m] ?? m}
      </button>
    {/each}
  </div>

  <p class="summary mono">{summary}</p>
</div>

<style>
  .grid { display: grid; gap: 0.5rem; }

  .days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 3px; }

  .day {
    aspect-ratio: 1 / 1;
    min-height: 30px;
    border: var(--rule);
    background: var(--paper-raised);
    color: var(--ink-soft);
    border-radius: var(--radius);
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    transition: background 120ms, color 120ms, border-color 120ms;
  }
  .day:hover { border-color: var(--seaglass); }
  .day.on { background: var(--seaglass); border-color: var(--seaglass); color: var(--paper); }

  .meals { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3px; }

  .meal {
    border: var(--rule);
    background: var(--paper-raised);
    color: var(--ink-soft);
    border-radius: var(--radius);
    padding: 0.3rem 0.2rem;
    font-family: var(--font-mono);
    font-size: 0.68rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    transition: background 120ms, color 120ms, border-color 120ms;
  }
  .meal:hover { border-color: var(--seaglass); }
  .meal.on { background: var(--seaglass); border-color: var(--seaglass); color: var(--paper); }

  .summary {
    margin: 0;
    font-size: 0.68rem;
    color: var(--ink-faint);
    letter-spacing: 0.02em;
  }
</style>
