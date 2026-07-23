---
"@rsvelte/compiler": patch
"@rsvelte/vite-plugin-svelte-native": patch
---

fix(parse): improve function-node AST fidelity to match acorn / acorn-typescript

Four parse-AST fixes so the public `parse()` output matches svelte/compiler:

- `FunctionExpression` fields are ordered `id, expression, generator, async` to
  match acorn's uniform `initFunction` key order (#1689).
- Generic function-like nodes emit `typeParameters`
  (`FunctionDeclaration`/`FunctionExpression` between `async` and `params`,
  `ArrowFunctionExpression` after `body`) (#1694).
- TS optional parameters (`b?: T`) round-trip their `optional: true` marker;
  program-context arrow params now route through the TS-aware parameter
  converter so they carry the same `typeAnnotation`/`optional` fidelity as
  declarations (#1692). As a side effect, this also fixes a pure-JS bug where a
  default-valued arrow parameter (`(a = 1) => a`) lost its `AssignmentPattern`
  (default value) in the `parse()` output — `compile()` output was unaffected.
- Object-method values (`{ m<T>(x: T) {} }`) keep their generics on the inner
  `FunctionExpression` but emit `typeParameters` *after* `body` (like arrows),
  not in the declaration/expression slot before `params` (#1711).

The binary NAPI raw-parse envelope (consumed by
`@rsvelte/vite-plugin-svelte-native`'s `parse-envelope.js` decoder) carries the
same fields, so both packages need this release. The envelope `VERSION` is
bumped to 4 alongside the wire-format changes.
