---
'@rsvelte/cli': patch
---

`typecheck` reads a component that svelte2tsx rejects as its instance script, else its module script, as svelte-check does. An import of the component now reports a missing default export and the types of the script's exports, instead of TS2306.
