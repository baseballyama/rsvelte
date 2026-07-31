---
"@rsvelte/svelte2tsx": patch
"@rsvelte/compiler": patch
---

fix(svelte2tsx): source-map segments now advance the generated column (previously every segment claimed column 0, collapsing position lookups onto the line's last segment); the NAPI `svelte2tsx` binding now returns the actual `map` instead of `null`
