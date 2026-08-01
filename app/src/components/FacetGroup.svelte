<script>
  let { label, options, selected = $bindable(), format = (v) => v, collapsible = false, limit = 8 } = $props()

  let expanded = $state(false)

  // Collapsed lists still show everything you've picked — otherwise a selection
  // made while expanded silently vanishes when the list collapses again.
  const shown = $derived.by(() => {
    if (!collapsible || expanded) return options
    const head = options.slice(0, limit)
    return [...head, ...options.filter((o) => selected.includes(o) && !head.includes(o))]
  })

  const toggle = (v) => (selected = selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v])
</script>

<div class="group" data-facet={label}>
  <h3 class="mono">{label}{#if selected.length}<span class="count">{selected.length}</span>{/if}</h3>
  <div class="opts">
    {#each shown as o}
      <button type="button" class:on={selected.includes(o)} aria-pressed={selected.includes(o)} onclick={() => toggle(o)}>
        {format(o)}
      </button>
    {/each}
  </div>
  {#if collapsible && options.length > limit}
    <button type="button" class="more mono" onclick={() => (expanded = !expanded)}>
      {expanded ? 'Show fewer' : `Show all ${options.length}`}
    </button>
  {/if}
</div>

<style>
  .group { display: grid; gap: 0.4rem; }

  h3 {
    margin: 0;
    font-size: 0.62rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--ink-faint);
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }

  .count {
    background: var(--seaglass);
    color: var(--paper);
    border-radius: 999px;
    padding: 0 0.35rem;
    font-size: 0.6rem;
    line-height: 1.4;
  }

  .opts { display: flex; flex-wrap: wrap; gap: 3px; }

  .opts button {
    border: var(--rule);
    background: var(--paper-raised);
    color: var(--ink-soft);
    border-radius: var(--radius);
    padding: 0.2rem 0.45rem;
    font-family: var(--font-mono);
    font-size: 0.68rem;
    transition: background 120ms, color 120ms, border-color 120ms;
  }
  .opts button:hover { border-color: var(--seaglass); }
  .opts button.on { background: var(--seaglass); border-color: var(--seaglass); color: var(--paper); }

  .more {
    justify-self: start;
    border: 0;
    background: none;
    padding: 0;
    color: var(--seaglass);
    font-size: 0.66rem;
    text-decoration: underline;
    text-underline-offset: 2px;
  }
</style>
