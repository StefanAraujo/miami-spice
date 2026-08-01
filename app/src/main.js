import { mount } from 'svelte'

// Fonts are self-hosted (bundled, not fetched from Google) so the app stays
// local-first and renders identically offline.
import '@fontsource/space-grotesk/400.css'
import '@fontsource/space-grotesk/500.css'
import '@fontsource/space-grotesk/600.css'
import '@fontsource/space-grotesk/700.css'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'

import './app.css'
import App from './App.svelte'

export default mount(App, { target: document.getElementById('app') })
