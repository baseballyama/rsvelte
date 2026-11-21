---
'@rsvelte/cli': patch
---

typecheck: a JavaScript component imported through a package, or from a `.ts` file, gives TS7016 at the import as svelte-check does, and its own findings are not reported when only that import reaches it.
