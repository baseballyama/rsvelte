---
"@rsvelte/compiler": patch
"@rsvelte/svelte2tsx": patch
"@rsvelte/svelte-check": patch
"@rsvelte/language-server": patch
"@rsvelte/lint": patch
---

parse: omit `CallExpression.optional` where acorn-typescript omits it

acorn-typescript writes `optional` on a call carrying type arguments only when
the subscript chain was already optional at that point — `_optionalChained` in
`parseSubscript`, threaded left to right — so `f<T>(x)` has no `optional` key at
all while `o?.m<T>(x)` has `optional: false`. rsvelte wrote the key
unconditionally, which is the largest single field in the `parse()` AST parity
ratchet: 1,876 corpus files, 16.6% of all field divergences.

The predicate is local to the call's own callee chain, so a `?.` that comes
after the call (`f<T>(x)?.g(y)`) or one cut off by parentheses
(`(a?.b)<T>(x)`) does not reach it — being inside a `ChainExpression` is not the
rule. Generated code is unchanged: only the parse path can set type arguments.
