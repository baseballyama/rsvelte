---
"@rsvelte/compiler": patch
---

fix: bind: diagnostic "Possible bindings" enumeration now matches the official
compiler's sorted order and is deterministic

`Possible bindings for <…> are …` was built by iterating an `FxHashMap`, so
the reported order was arbitrary and could diverge between runs, unlike the
official compiler, which sorts the list. `BINDING_PROPERTIES` is now backed
by an ordered const slice in upstream `bindings.js` definition order, the
enumeration is sorted like upstream's `.sort()`, and the related
`check_graph_for_cycles` root visitation and `{@const}` dependency collection
are now insertion-ordered as well.
