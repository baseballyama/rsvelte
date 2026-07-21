---
"@rsvelte/compiler": patch
---

fix(client): emit `svelte:element` `on:` events bare in after_update (no `$.effect` wrap with `use:`), and emit a plain prop init for a function-valued `{@const}` shadowed by an outer same-named binding
