---
'@rsvelte/cli': patch
---

`compileModule` now rejects `export default name` in a `.svelte.js` module when `name` is derived state or state the module reassigns, as svelte does.
