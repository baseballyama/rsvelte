---
"@rsvelte/vite-plugin-svelte-native": patch
---

Fix invalid SSR codegen when a `{@const}` (or any awaited expression) sits in
the consequent of a ternary in async mode — e.g.
`{@const x = cond ? await fn({...}) : undefined}`. The server `await <expr>` →
`(await $.save(<expr>))()` rewrite used a hand-rolled byte scanner that forgot
the ternary alternate separator `:`, so `: undefined` leaked into the
`$.save(...)` argument list and produced unparseable JS (issue #1036, bug 2).
The operand is now bounded by its parsed `AwaitExpression` span, so everything
outside it stays untouched.
