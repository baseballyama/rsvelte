---
"@rsvelte/compiler": patch
---

Keep partially unused `:is()` / `:where()` selector-list branches in source
order when emitting their `(unused)` comments.
