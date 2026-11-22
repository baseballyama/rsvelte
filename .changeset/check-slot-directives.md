---
'@rsvelte/cli': patch
---

`rsvelte check` no longer skips a component that has a directive on a `<slot>`. The compiler rejects them, and `rsvelte check` now types them as svelte2tsx does. `use:`, transition and `animate:` take the slot as their element, `on:` and an unfilled `let:` are properties of the slot, and `bind:this` reads the slot as `Record<string, any>`.
