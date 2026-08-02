import { mount } from 'svelte'

// The app now renders in the platform's own SF system faces (SF Pro Text/Display,
// SF Mono) via the -apple-system stack in app.css — no web fonts to download, so
// the first paint is instant and matches native Apple apps exactly. See DESIGN.md.
import './app.css'
import App from './App.svelte'

// Night-only — "Ocean Drive After Dark." The app has a single dark theme; set it
// before paint so there is never a flash of anything else.
document.documentElement.dataset.theme = 'pm'

export default mount(App, { target: document.getElementById('app') })
