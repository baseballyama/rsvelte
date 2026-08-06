---
"@rsvelte/compiler": patch
"@rsvelte/svelte2tsx": patch
"@rsvelte/svelte-check": patch
---

Port the compiler to the restructured oxc 0.143 AST

`ExportNamedDeclaration` was split into three nodes — `ExportDeclaration` (`export <decl>`),
a specifier-only `ExportNamedDeclaration` (`export {…}`) and `ExportFromDeclaration`
(`export {…} from`) — and `ArrowFunctionExpression` replaced its `expression` flag and
`FunctionBody` with an `ArrowFunctionBody` enum. Every match over those nodes now names all
three variants explicitly instead of falling through.

Two behaviour fixes fall out of the split. `export type Foo = true` inside a `namespace` was
rejected as a non-type member because oxc now derives the export kind from the declaration
rather than storing it, and a chained member object such as
`(componentOptions()?.events?.onabort)?.apply(…)` lost its required parentheses because oxc
keeps a `ParenthesizedExpression` around the inner chain that the printer was not looking
through.
