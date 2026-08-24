---
"@rsvelte/compiler": patch
---

Server: a comment written inside a legacy `$:` statement now flushes at the next located node the reordered output prints, matching the official compiler. A prop lowering (`export let x` → `$.fallback(…)`) and the implicit declaration an undeclared `$: x = …` creates are both flush points upstream — the first because it keeps the source declaration's location, the second because its declarator reuses the assignment target's — and neither was one here, so the comment stayed on the reactive statement the reorder had already moved past.
