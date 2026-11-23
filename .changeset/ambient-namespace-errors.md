---
'@rsvelte/cli': patch
---

In a component's script, `compile` now refuses a namespace that holds a statement in an ambient context, as svelte does. It reports an implementation there only for a function declaration, at its start.
