---
"@rsvelte/compiler": patch
"@rsvelte/vite-plugin-svelte-native": patch
"@rsvelte/svelte2tsx": patch
"@rsvelte/svelte-check": patch
---

fix(parser): preserve TS assertion expressions in `parse()` output and fix zero-width arrow-param spans

`parse()` now keeps `TSAsExpression`, `TSSatisfiesExpression`, and
`TSNonNullExpression` wrapper nodes in the public AST — matching
svelte/compiler, which parses TS via acorn-typescript and returns the assertion
nodes. rsvelte previously unwrapped them at parse time, returning the bare inner
expression and diverging from the reference AST shape (it broke downstream
consumers that rely on parser parity). The wrappers are still erased at compile
time by `remove_typescript_nodes` exactly as before, so client/server codegen is
unchanged (`x as const` is stripped from the generated JS). The binary
`parseEnvelope` encoder/decoder gains matching entries for the three node types.

Also fixes a latent bug where untyped arrow-function parameters inside template
expressions (event handlers such as `onclick={(color, e) => …}`) came back with
zero-width spans (`start == end == 0`); the fast-path template arrow parser now
assigns each parameter its real source span, matching svelte/compiler.

In svelte2tsx (`@rsvelte/svelte2tsx` and the svelte-check overlay), a `bind:`
expression carrying a TS assertion (`bind:value={value as never}`) now strips the
assertion from the generated assignment LHS while keeping it on the bound-value
side — mirroring upstream svelte2tsx's `getEnd(attr.expression)`.
