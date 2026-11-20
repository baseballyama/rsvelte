---
'@rsvelte/cli': patch
---

Read `{let$: 1}`, `{constñ: 1}` and `{typeñ: 1}` as declaration tags of the wrong type, as Svelte does: a declaration keyword ends where an ASCII word ends.
