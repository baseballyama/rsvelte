---
'@rsvelte/compiler': patch
---

Match a nested rule whose parent prelude is fully global. A child that writes no
explicit `&` gets one unshifted by upstream's `get_relative_selectors`, and
`is_global` resolves that `&` through the parent prelude — so it matches every
ancestor that is there (scoping each one) and `apply_combinator` still matches
when there is no ancestor at all. rsvelte matched only the child's own subject
against a real ancestor, so a wrapper carrying no selector of its own lost its
scope class and a subject at the root of the template lost it entirely
