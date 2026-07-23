---
"@rsvelte/compiler": patch
---

fix(css): keep nested `& + &` and `:global(.a) + .b` sibling rules

Two unused-CSS prune divergences found by the css-prune differential sweep are
fixed, clearing the sweep ratchet (81 → 0):

- A nested rule whose inner selector uses the parent-selector sibling combinator
  (`.a { & + & { … } }`, i.e. `.a + .a`) was dropped as `/* (empty) */` even with
  a real adjacent `.a` pair, because `&` (NestingSelector) resolved to an empty
  matches-nothing selector during sibling pruning. `&` is now resolved against
  the parent rule's subject compound (#1703).
- `:global(.a) + .b` was pruned as `/* (unused) */` when the sibling pair lived
  inside an `{#await}…{:then}` branch or a `{#snippet}` fragment (both set the
  opaque-elements flag, which suppressed real-sibling matching). The acceptable
  predecessors of the scoped segment are now unioned — a real previous sibling
  matching the inner `:global(...)`, an opaque boundary, or a root-level element
  (#1702).
