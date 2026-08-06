---
'@rsvelte/compiler': patch
---

Wrap an awaited `for…of` loop's iterable in `$.for_await_track_reactivity_loss(...)` in dev mode under `experimental.async`, matching the official compiler's `ForOfStatement` visitor. Applies to runes and legacy instance scripts, `<script module>` and `.svelte.(js|ts)` modules, and is suppressed by `svelte-ignore await_reactivity_loss`.
