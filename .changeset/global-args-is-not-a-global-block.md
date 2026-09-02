---
'@rsvelte/compiler': patch
---

A rule nested under `:global(.foo) { … }` no longer counts an unused child toward
its parent's non-emptiness. Upstream reads "am I inside a global block" off
`metadata.is_global_block`, and `is_global_block_selector` sets that only for a
bare `:global` — `args === null` — so `:global(.foo)` is an ordinary rule there
and `is_empty`'s `(is_used(child) || is_in_global_block)` test does not fire.
rsvelte carries that single upstream concept as two separate flags, one of which
never looks at `args`, and the empty check read that one: a parent whose only
child is an unused rule survived with the child commented out, where official
comments the whole parent as `(empty)`.
