---
'@rsvelte/compiler': patch
---

Stop constant-folding a legacy-mode `$derived(...)` into the SSR template. Under an explicit
`runes: false` (compile option or `<svelte:options runes={false} />`) `$derived` is a store
subscription, so the declared value is the call's result rather than its argument — the server
was inlining the argument and rendering a frozen constant.
