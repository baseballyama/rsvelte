---
'@rsvelte/cli': patch
---

The `typecheck` command reports TS7016 at an import of a JavaScript component, as svelte-check does, also through a package or from a `.ts` file. It no longer reports the findings of a JavaScript component that only such an import reaches.
