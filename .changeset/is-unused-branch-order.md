---
"@rsvelte/compiler": patch
---

Keep partially unused `:is()` / `:where()` selector-list branches in source
order when emitting their `(unused)` comments.

Preserve selector specificity by applying the complex selector's scope bump to
functional pseudo-class arguments even when their scoped sibling appears later
in source order.
