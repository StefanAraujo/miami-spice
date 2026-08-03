import { mount } from 'svelte'

// "Midnight Poster" — one committed dark theme on :root. Display type is a system
// geometric (Futura lineage); body is SF. No web fonts to download, so first paint
// is instant. See DESIGN.md for the full world.
import './app.css'
import App from './App.svelte'

export default mount(App, { target: document.getElementById('app') })
