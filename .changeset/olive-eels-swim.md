---
'@rsvelte/compiler': patch
---

fix(compiler): apply read transforms inside `bind:` setter assignment targets

A component binding whose expression is a member expression with a plain
(non-state, non-prop) root emitted its setter target untransformed, so an
each-block destructuring thunk used as a computed key was written as `key`
instead of `key()` — the write landed on a property keyed by the thunk
function rather than by its value.
