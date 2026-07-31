---
"@rsvelte/compiler": patch
---

fix(compiler): wrap awaited expressions in a component's instance script with `$.track_reactivity_loss(...)` in dev, honouring `svelte-ignore await_reactivity_loss`
