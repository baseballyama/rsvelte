---
'@rsvelte/compiler': patch
---

Scope the component's elements when a `:global(...)` is the whole argument of `:is()` or `:where()`. Upstream truncates trailing globals out of the argument, and an argument that truncates to nothing matches anything; rsvelte instead tested the global's own selectors against the element, so `:where(:global(.x))` scoped nothing and the emitted rule — byte-identical to official's — could never match. A descendant inside `:is()` (`:is(.card .a)`) is now assumed to match rather than pruned, as upstream does.
