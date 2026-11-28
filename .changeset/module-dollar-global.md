---
'@rsvelte/cli': patch
---

`compileModule` now leaves an undeclared `$name` in a `.svelte.js` or `.svelte.ts` module alone, as svelte does, instead of reading it as a store subscription. `promise.then($DONE)` no longer becomes `promise.then($DONE())`.
