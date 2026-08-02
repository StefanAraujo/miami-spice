<script>
  let {
    label, options, selected = $bindable(), counts = {},
    format = (v) => v, collapsible = false, limit = 8, note = '',
  } = $props()

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
  <h3 class="micro">{label}</h3>
  {#if note}<p class="note">{note}</p>{/if}

  <div class="opts">
    {#each shown as o}
      {@const n = counts[o]}
      {@const on = selected.includes(o)}
      <button
        type="button"
        class:on
        aria-pressed={on}
        disabled={!on && n === 0}
        onclick={() => toggle(o)}
      >
        {format(o)}{#if n !== undefined}<span class="n mono">{n}</span>{/if}
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
  .group { display: grid; gap: var(--s3); margin-bottom: var(--s6); }

  h3 { margin: 0; }

  /* Telegraph the AND logic — dietary flags are requirements, not alternatives. */
  .note { margin: 0; font-size: var(--t-meta); color: var(--soft); }

  .opts { display: flex; flex-wrap: wrap; gap: var(--s2); }

  .opts button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: var(--tap);          /* Apple: at least 44x44 pt */
    padding: 0 var(--s4);
    font-size: var(--t-body);
    font-weight: 500;
    color: var(--ink);
    background: var(--sunk);
    border: 1px solid transparent;
    border-radius: var(--r-full);
  }
  .opts button:hover:not(:disabled) { background: var(--marine-wash); color: var(--marine); }
  .opts button.on { background: var(--marine); color: var(--card); }

  /* Baymard: zero options are disabled and greyed, never removed — removing them
     makes the list jump and destroys the user's spatial memory of it. */
  .opts button:disabled { opacity: 0.4; cursor: default; }

  .n { font-size: var(--t-meta); color: var(--soft); margin-left: var(--s2); }
  .opts button.on .n { color: var(--card); opacity: 0.8; }

  .more {
    justify-self: start;
    display: inline-flex;
    align-items: center;
    min-height: var(--tap);
    color: var(--marine);
  }
</style>
