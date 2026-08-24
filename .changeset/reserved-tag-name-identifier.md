---
'@rsvelte/compiler': patch
---

Client: an element whose tag name is a reserved word no longer emits `var var =`

`Scope.unique` advances past a candidate generated name while any of four tests
hold, and `Memoizer::generate_id` had the first three: the scope's references,
its declarations and the root conflict set, but not `is_reserved`. So the first
`<var>` in a component took the free-name fast path and produced
`var var = root();` — output no JS parser accepts, from a `compile()` that
returned successfully. Two of the 48 affected names are standard elements:
HTML's `<var>` and SVG's `<switch>`.
