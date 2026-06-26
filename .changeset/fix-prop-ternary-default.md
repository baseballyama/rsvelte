---
"@rsvelte/compiler": patch
---

fix(compiler): treat a prop default that is a conditional/binary/logical expression containing a reactive-binding read as non-simple

A prop whose default is e.g. `fill = solid ? 'currentColor' : 'none'` (with `solid` a prop) was mis-classified as a static default and emitted as `$.prop($$props, "fill", 8, solid() ? …)` — missing `PROPS_IS_LAZY_INITIAL` and the default thunk — instead of the official `$.prop($$props, "fill", 24, () => (solid() ? …))`. The simplicity check now defers to an exact OXC-AST predicate mirroring upstream `is_simple_expression`, recursing into operands and treating a reactive-binding identifier (rewritten to a getter call in legacy mode) as non-simple.
