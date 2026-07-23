---
"@rsvelte/compiler": patch
---

fix(css): resolve multi-relative chains in `:global()`/nested-`&` sibling prune

The `+`/`~` unused-CSS prune check resolved only single-relative selectors when
expanding a leading `:global(X)` inner selector or a nested rule's `&` against
its ancestor rules, so a descendant/child chain inside the compound was left
unresolved and the rule was pruned even when the ancestor constraint was
actually satisfied — e.g. `:global(.a .z) + .b` (`.z` really under `.a`) became
`/* (unused) */` and `.grand { .foo > .a { & + & } }` became `/* (empty) */`.
The `&`/`:global(...)` inner is now resolved through the full ancestor chain
with the same structural matcher used for `>` child checks, matching
`svelte/compiler` for both the kept and pruned cases (#1719).
