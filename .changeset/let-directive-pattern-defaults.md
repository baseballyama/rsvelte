---
"@rsvelte/compiler": patch
---

Keep the names bound by a `let:` pattern that carries a default. SSR reinterpreted an assignment as the directive name alone, so `let:row={[h = 1, ...t]}` emitted `[undefined, ...t]` and the slot body's `h` was never bound; the client dropped the whole `$.derived` when a pattern bound no names, and `<svelte:fragment>` rebuilt the pattern from the property keys, losing renames, nesting, rests and computed keys.
