---
"@rsvelte/compiler": patch
---

fix(transform): six near-miss codegen fixes (store-mutate source, each promotion, prop-write shadow, destructure IIFE, SSR scope-class position)

- `$.store_mutate(...)` first arg (the store source) now reads a prop-backed store
  as `store()` and a state-backed store as `$.get(store)` via the store var's own
  transform, instead of emitting the bare name — for both component-prop binds and
  DOM-element binds.
- A `const` collection whose each-item name collides with a `bind:`-reassigned
  outer binding is no longer promoted to `$.mutable_source(...)`; the each-mutation
  check now resolves to the each-item binding (`BindingKind::EachItem`) only.
- A write to a local binding that shadows a same-named prop (`let timeout` inside a
  function vs `export let timeout`) is no longer rewritten to a prop-setter call;
  the AST prop-assign pass now skips locally-shadowed LHS identifiers.
- A destructuring assignment preceded by a `}` (e.g. after an `if {…}` block) is
  recognized as a standalone statement, so its IIFE no longer appends `return $$value`.
- The SSR scoping `class` attribute is appended last (not before a real `style`
  attribute) when the element has `style:` directives but no synthetic `style`.
