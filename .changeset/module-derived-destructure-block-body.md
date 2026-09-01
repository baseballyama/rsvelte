---
'@rsvelte/compiler': patch
---

A destructured `$derived.by()` in a `.svelte.js` / `.svelte.ts` module now reads as a call on the
server even when its callback has a block body. The pass that decides `$.get(x)` → `x()` located a
comma-continued declarator by walking back to the nearest `;`, which a block body puts inside the
previous declarator, so the second name was dropped and every later read came out bare — output
that parses and runs with the wrong value. The client target and component instance scripts were
unaffected.
