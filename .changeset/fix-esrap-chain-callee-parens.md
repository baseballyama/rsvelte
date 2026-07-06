---
"@rsvelte/compiler": patch
---

fix(esrap): parenthesize an optional-chain callee of a non-optional call

`rsvelte_esrap` printed a `CallExpression` whose callee is a `ChainExpression`
(an optional member) without wrapping parentheses, so a NON-optional call on an
optional-chain callee — e.g. a dynamic `<svelte:component this={instruct?.dataComponent} />`
lowering to `(instruct?.dataComponent)($$renderer, …)` — was mis-printed as
`instruct?.dataComponent($$renderer, …)`. Those differ semantically (the latter
short-circuits when `instruct` is nullish) and are not AST-equivalent.

The callee-precedence check (`< 19`) could not catch it because a
`ChainExpression` has the same precedence (19) as a call. Add esrap's explicit
`callee.type === 'ChainExpression'` wrap rule so the callee is parenthesized.
Removes `powertable/app/src/lib/components/PowerTable.svelte` from
known-failures.server.json.
