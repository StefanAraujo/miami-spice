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

// Night-only — "Ocean Drive After Dark." The app has a single dark theme; set it
// before paint so there is never a flash of anything else.
document.documentElement.dataset.theme = 'pm'

export default mount(App, { target: document.getElementById('app') })
