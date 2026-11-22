---
'@rsvelte/cli': patch
---

`compile` now refuses a `declare` namespace, module or `global` block that holds a value, as svelte does.
