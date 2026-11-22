---
'@rsvelte/cli': patch
---

`rsvelte typecheck` reads the `generics` attribute of a JavaScript component, as svelte-check does, instead of reporting `Cannot find name` for its type parameters.
