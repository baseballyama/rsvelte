---
"@rsvelte/compiler": patch
---

svelte2tsx: emit the `__sveltets_2_store_get` shim for a store that a `<script context="module">` block declares with `export`. Only bare `const`/`let` declarations were matched, so `export const shared = writable(0)` auto-subscribed from the instance script left `$shared` undeclared in the projected TSX.
