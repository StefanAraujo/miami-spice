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

<section class="group" data-facet={label}>
  <h3 class="micro">
    {label}{#if selected.length}<span class="count mono">{selected.length}</span>{/if}
  </h3>

  <div class="opts">
    {#each shown as o}
      <button type="button" class:on={selected.includes(o)} aria-pressed={selected.includes(o)} onclick={() => toggle(o)}>
        {format(o)}
      </button>
    {/each}
  </div>

  {#if collapsible && options.length > limit}
    <button type="button" class="more micro" onclick={() => (expanded = !expanded)}>
      {expanded ? 'Show fewer' : `Show all ${options.length}`}
    </button>
  {/if}
</section>

<style>
  .group { display: grid; gap: 0.65rem; }

  h3 { margin: 0; display: flex; align-items: center; gap: 0.45rem; }

  .count {
    color: var(--cyan);
    background: var(--cyan-dim);
    border-radius: var(--r-pill);
    padding: 0 0.4rem;
    font-size: 0.6rem;
    letter-spacing: 0;
  }

  .opts { display: flex; flex-wrap: wrap; gap: 0.3rem; }

  .opts button {
    border: 1px solid var(--line);
    border-radius: var(--r-pill);
    background: var(--surface);
    color: var(--text-soft);
    padding: 0.24rem 0.65rem;
    font-family: var(--font-mono);
    font-size: 0.68rem;
    transition: border-color 140ms, color 140ms, background 140ms;
  }
  .opts button:hover { border-color: var(--surface-2); background: var(--surface-2); color: var(--text); }
  .opts button.on {
    background: var(--cyan);
    border-color: var(--cyan);
    color: var(--void);
    font-weight: 500;
  }

  .more {
    justify-self: start;
    color: var(--text-faint);
    letter-spacing: 0.1em;
    transition: color 140ms;
  }
  .more:hover { color: var(--cyan); }
</style>
