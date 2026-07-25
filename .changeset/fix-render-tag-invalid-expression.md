---
"@rsvelte/compiler": patch
---

fix(parse): reject non-call expressions in `{@render}` like the official compiler

`{@render new foo()}` compiled instead of erroring: the `CallExpression` /
`ChainExpression` check that `svelte/compiler` performs at parse time was
missing, and the phase-2 fallback only looked for a `callee` — which a
`NewExpression` also has. The parser now raises
`render_tag_invalid_expression` with the same message and span as the official
compiler, while `{@render foo()}`, `{@render foo?.()}` and
`{@render (cond ? a : b)()}` keep compiling.
