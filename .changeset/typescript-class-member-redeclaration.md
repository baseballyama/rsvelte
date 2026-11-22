---
'@rsvelte/cli': patch
---

`compile` now raises what svelte raises for a TypeScript class member or block function declared again, instead of oxc's TypeScript errors.
