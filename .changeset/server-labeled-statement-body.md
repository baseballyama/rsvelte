---
"@rsvelte/compiler": patch
---

Lower the runes inside a labeled statement during server compilation, following `sveltejs/svelte#18617`: `outer: { let r = $state(5); }` now emits `let r = 5;` instead of leaving the rune call in the output
