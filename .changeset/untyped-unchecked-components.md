---
'@rsvelte/cli': patch
---

`typecheck` now reports TS7016 for an import of a JavaScript component it does not check, such as one with a legacy `export let`, as svelte-check does for any JavaScript component.
