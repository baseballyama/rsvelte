---
"@rsvelte/compiler": patch
---

Declare the `binding_group` array for a `bind:group` that sits inside `<svelte:boundary>` or `<svelte:fragment>`. The walk that registers group bindings lists the containers it descends into and had neither, so the generated `$.bind_group(...)` call referenced an array that was never emitted. Same shape as the scoping walks: one hand-maintained container list, one container missing from it.
