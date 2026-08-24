---
"@rsvelte/compiler": patch
---

Resolve `&` inside a functional pseudo-class against the parent rule. `:is(&)` / `:where(&)` / `:has(&)` used to leave the nesting selector unresolved, which the element matcher read as "matches anything" — so `.card { :is(&) { … } }` put the scoping class on every element in the component, while `.card { :is(&) .a { … } }` put it on none of the descendants and emitted a rule that could never match. Upstream's `get_relative_selectors` finds `&` with a walk that descends into a pseudo-class's arguments, so a rule that carries one there is not prefixed with its parent; both phases now agree on that, and the parent chain used to resolve it is the port that was already there rather than a second one. A `:has()` nested inside a `:has()` argument is also resolved against its own subject set instead of being treated as an unconstrained pseudo-class, so `.a:has(:has(.b))` is pruned where official prunes it.
