---
'@rsvelte/cli': patch
---

Under `declaration` or `composite`, `typecheck` now reports the errors TypeScript finds while it builds the declarations, such as TS4094. It reports them in modules and in components, as `tsc` and svelte-check do.
