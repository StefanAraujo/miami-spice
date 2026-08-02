<script>
  import L from 'leaflet'
  import 'leaflet/dist/leaflet.css'
  import { priceRange } from '../lib/search.js'

  /**
   * The map (README Phase 2), synced to the SAME filtered result set as the list —
   * change a filter and the pins change with it. circleMarkers (SVG, no image
   * assets) sidestep Leaflet's bundler icon-path problem and read as Deco dots.
   * Basemap is CARTO Positron (light) / Dark Matter (night) so it tracks the theme.
   * Tiles are the only network call in the whole app and only load on this view.
   */
  let { results = [], onOpen } = $props()

  let el
  let map
  let layer

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
  const cssVar = (name, fallback) =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback

  $effect(() => {
    if (!el) return
    if (!map) {
      const dark = document.documentElement.dataset.theme === 'pm'
      map = L.map(el, { scrollWheelZoom: true, attributionControl: true }).setView([25.79, -80.2], 11)
      L.tileLayer(
        dark
          ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
          : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        { subdomains: 'abcd', maxZoom: 19, attribution: '© OpenStreetMap contributors © CARTO' },
      ).addTo(map)
      layer = L.layerGroup().addTo(map)
      // Make a pin a decision surface, not just a locator (UX review): its popup
      // carries a button that opens the restaurant's full detail in the app.
      map.on('popupopen', (e) => {
        const btn = e.popup.getElement()?.querySelector('.mp-open')
        if (btn) btn.onclick = () => { onOpen?.(Number(btn.dataset.id)); map.closePopup() }
      })
    }

    // Re-sync markers whenever the filtered results change.
    const marine = cssVar('--marine', '#12414c')
    const flamingo = cssVar('--flamingo', '#9c1e45')
    layer.clearLayers()
    const pts = results.filter((r) => r.lat != null && r.lng != null)
    for (const r of pts) {
      L.circleMarker([r.lat, r.lng], { radius: 6, color: marine, weight: 1, fillColor: marine, fillOpacity: 0.75 })
        .bindPopup(
          `<strong>${esc(r.name)}</strong><br>${esc(r.cuisines.join(', '))} · ` +
          `<span style="color:${flamingo}">${esc(priceRange(r))}</span><br>` +
          `<button type="button" class="mp-open" data-id="${r.id}">See menu &amp; availability</button>`,
        )
        .addTo(layer)
    }
    if (pts.length) {
      try { map.fitBounds(pts.map((r) => [r.lat, r.lng]), { padding: [32, 32], maxZoom: 14 }) } catch {}
    }
  })

  // Tear the map down when the view switches away, so re-entering rebuilds cleanly.
  $effect(() => () => { if (map) { map.remove(); map = null } })
</script>

<div class="map" bind:this={el}></div>

<style>
  .map {
    height: 70vh;
    min-height: 460px;
    margin-top: var(--s5);
    border: 1px solid var(--hair);
    border-radius: var(--r-lg);
    overflow: hidden;
    box-shadow: var(--eyebrow);
  }
  /* Leaflet paints its own controls; keep them on-palette. */
  .map :global(.leaflet-bar a) { color: var(--marine); }
  .map :global(.mp-open) {
    display: inline-flex;
    align-items: center;
    min-height: 40px;
    margin-top: var(--s2);
    padding: 0 var(--s4);
    border-radius: var(--r-full);
    background: var(--marine);
    color: var(--card);
    border: none;
    font-family: var(--f-body);
    font-weight: 590;
    font-size: var(--t-meta);
    cursor: pointer;
  }
</style>
