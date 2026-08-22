---
"@rsvelte/compiler": patch
---

Stop scoping an ancestor for a selector whose combinator chain does not match. The ancestor walker carried a bypass for sibling combinators — a subject already marked scoped counts as a match, because the chain walker cannot evaluate `+` / `~` — but `scoped` is set by any selector, so a subject scoped by an unrelated rule satisfied the test for a selector the chain had just rejected. `.b > .a` with the `.a` candidate a grandchild no longer adds the hash to `.b`.
