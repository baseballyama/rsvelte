---
"@rsvelte/compiler": patch
---

Recognise `$state` / `$derived` declarations in `.svelte.(js|ts)` modules whose variable name contains a `$` (e.g. `const delay$ = $derived(...)`), so their reads are unwrapped to `$.get(delay$)` on the client and `delay$()` on the server instead of leaking the raw signal.
