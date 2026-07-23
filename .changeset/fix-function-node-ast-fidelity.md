---
"@rsvelte/compiler": patch
"@rsvelte/vite-plugin-svelte-native": patch
---

fix(parse): improve function-node AST fidelity to match acorn / acorn-typescript

Three parse-AST fixes so the public `parse()` output matches svelte/compiler:

- `FunctionExpression` fields are ordered `id, expression, generator, async` to
  match acorn's uniform `initFunction` key order (#1689).
- Generic function-like nodes emit `typeParameters`
  (`FunctionDeclaration`/`FunctionExpression` between `async` and `params`,
  `ArrowFunctionExpression` after `body`) (#1694).
- TS optional parameters (`b?: T`) round-trip their `optional: true` marker;
  program-context arrow params now route through the TS-aware parameter
  converter so they carry the same `typeAnnotation`/`optional` fidelity as
  declarations (#1692).

The binary NAPI raw-parse envelope (consumed by
`@rsvelte/vite-plugin-svelte-native`'s `parse-envelope.js` decoder) carries the
same fields, so both packages need this release. The envelope `VERSION` is
bumped to 3 alongside the wire-format change.
