import { mount } from 'svelte'

// Self-hosted so the app renders identically offline and makes no request to
// Google. Jost is the Futura lineage (1927) — period-correct Deco geometry that
// still reads as contemporary UI type.
import '@fontsource/jost/400.css'
import '@fontsource/jost/500.css'
import '@fontsource/jost/600.css'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
// Poiret One — a geometric Art-Deco display face, used ONLY for the wordmark and
// section heads (the one place a literal Vice quote is safe). Not on any
// design-lint AI-default list. See REVAMP_VISUAL.md §3.
import '@fontsource/poiret-one/400.css'

import './app.css'
import App from './App.svelte'

// Apply the saved AM/PM mood before the app paints, so a PM reload never flashes
// the light field first. localStorage can throw under strict privacy modes.
try {
  if (localStorage.getItem('mood') === 'pm') document.documentElement.dataset.theme = 'pm'
} catch {}

export default mount(App, { target: document.getElementById('app') })
