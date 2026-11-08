---
'@rsvelte/compiler': patch
'@rsvelte/vite-plugin-svelte-native': patch
---

Pass a `$props()` / `export let` default eagerly whenever upstream does, deciding on the parsed expression rather than its text. Defaults such as `2_000.5` (a numeric separator with a fraction), `(1.5)`, `1.5 + 1`, `true ? 2_000.5 : 1` or `1.5 || 0` were wrapped in a lazy thunk.
