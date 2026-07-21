---
"@rsvelte/compiler": patch
---

fix(parse): preserve TypeScript assertion expressions in the parse AST

`parse()` silently dropped TypeScript assertion wrappers — `x as const`,
`x as T`, `x satisfies T`, `x!`, `<T>x`, and `x<T>` — returning only the inner
expression, so consumers that expect the svelte/compiler AST shape (e.g.
svelte-shaker) saw a different tree than the official compiler.

The parser now keeps `TSAsExpression`, `TSSatisfiesExpression`,
`TSNonNullExpression`, `TSTypeAssertion`, and `TSInstantiationExpression` (with
their `typeAnnotation` / `typeArguments`), matching svelte/compiler's `parse()`
output byte-for-byte. Mirroring the official compiler, `remove_typescript_nodes`
unwraps these wrappers before analyze/transform, so compiled client/server
output is unchanged.
