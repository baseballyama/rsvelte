# Divergences

Where `compile` gives a different result from svelte on purpose. Each entry says what svelte does,
what rsvelte does instead, and the code that does it. Behavior rsvelte has not built yet is not
listed here.

## TypeScript module syntax

TypeScript's module syntax at the top of a script: an import equals (`import A = B.C;`,
`export import A = B.C;`, `import A = require("x");`), an export assignment (`export = foo;`) and
a namespace export (`export as namespace N;`).

- Svelte 5.57.3 and 5.59.1 compile all three. `remove_typescript_nodes` has no visitor for these
  nodes, so the output keeps them as TypeScript, and the module does not parse. An `export import`
  loses its `export` on the way.
- rsvelte refuses an import equals and an export assignment with `unsupported`: "`import name = …`
  is not supported yet" or "`export = …` is not supported yet", at the declaration.
  `port_refuses` in [`validation.rs`](src/lower/validation.rs) lists the two features, and
  `typescript_invalid_feature` there words them.
- rsvelte erases a namespace export, as TypeScript does: `is_type_declaration` in the TypeScript
  crate's `strip.rs` counts it as a type, so the component compiles without it.
- The refusal does not read the import's kind: rsvelte refuses `import type A = require("x");`
  and `export import A = B.C;` like the others. `import type A = B.C;` is a parse error in both,
  with a different message and offset ([#5247](https://github.com/baseballyama/rsvelte/issues/5247)).
- Inside a namespace both refuse the namespace with `typescript_invalid_feature`, so this entry is
  about the top level only.
- Tests: `tests/compile/official_parity/import_equals.rs`, and `namespaces.rs` for the namespace.
- The upstream bug is item 178 of [#4939](https://github.com/baseballyama/rsvelte/issues/4939),
  and the decision is [#5218](https://github.com/baseballyama/rsvelte/issues/5218).
