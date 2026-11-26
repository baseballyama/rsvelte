# Divergences

Where `compile` gives a different result from svelte on purpose. Each entry says what svelte does,
what rsvelte does instead, and the code that does it. Behavior rsvelte has not built yet is not
listed here.

## JavaScript syntax errors

Svelte parses JavaScript with acorn and rsvelte with oxc, so the two word and place a syntax error
in their own ways.

- Both raise `js_parse_error` for the same sources. The message and the position are oxc's.
- rsvelte still follows acorn where that decides the outcome: what acorn accepts or rejects, and
  where acorn's expression ends in the template, which decides the next Svelte error. The rest of
  acorn's wording, position and order is not copied.
- The corpus records such a unit as `js-equivalent` rather than `match`
  ([the verdicts](../../../language_independent/corpus/README.md#verdicts)).
- Tests: `tests/compile/official_parity/outcomes.rs` keeps only the code of a `js_parse_error`.

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

## A `.svelte.ts` module that oxc cannot read on

TypeScript reads on past some syntax errors in a `.svelte.ts` module: a reserved word as a name
(`declare let enum: number;`, `interface enum {}`) and a type operator with no operand
(`let v: keyof;`, `function f(this: infer) {}`).

- Svelte 5.59.1 compiles TypeScript 6.0.3's emit of the module. Of the 38 shapes in the report,
  24 compile, as `let v: keyof;` does, since the emit drops the error. The other 14 fail, since
  the emit keeps text that acorn rejects: `declare const v = enum;` fails with "Unexpected token",
  and `interface enum {}` fails with a reserved keyword error at `interface`.
- rsvelte reads the module with oxc, which stops at the error. `compileModule` fails with
  `js_parse_error` at oxc's position and message. Where oxc reads on, rsvelte reports the error
  only in code the emit keeps: `erased_program` in the TypeScript tree crate's
  [`program.rs`](../../typescript/tree/src/builder/program.rs) drops the others, with the spans
  that [`erase.rs`](src/module/erase.rs) removes.
- A bundler reads the module as oxc does. `esbuild` 0.28.2 rejects 36 of the 38 shapes and
  accepts `declare function f({ enum }: any): void;` and `declare namespace A.enum {}`. The oxc
  transform of `rolldown` 1.2.19 rejects all 38.
- A number that oxc's lexer refuses stops it the same way. TypeScript writes `0_8` as `8`, which
  Svelte compiles, and rsvelte fails with "Numeric separator is not allowed in legacy octal
  numeric literals". TypeScript writes `export const a = 08n;` as `export const a = 8, n;`, a
  `const` with no value, which Svelte rejects with "Unexpected token" at the `;`, and rsvelte
  fails with "Invalid number" at the number. `07e1` gives the same pair.
- Test: `a_typescript_module_that_oxc_cannot_read_fails_where_typescript_reads_on` in
  `src/module/tests/erased_errors.rs`.
- The report is [#5347](https://github.com/baseballyama/rsvelte/issues/5347).

## JavaScript layout

Svelte prints its output with esrap, and rsvelte prints with `oxc_codegen`
([`print.rs`](../../typescript/compile/src/print.rs)). Each lays out the same tree in its own way.
The corpus compares JavaScript as a syntax tree
([the verdicts](../../../language_independent/corpus/README.md#verdicts)), as the oracle asks with
`compare: 'js-ast'` in `tools/oracle/tasks/compile-artifacts.ts`.

- esrap 2.4.2 compares an operand's precedence with a member's. Below it, the object of a member,
  the function a call reads and the tag of a template get parentheses. See
  [its precedence table](https://github.com/sveltejs/esrap/blob/f968d9e35b5bf3d3b78c191064476fa69e87fa05/src/languages/ts/index.js#L23-L30)
  and [its member](https://github.com/sveltejs/esrap/blob/f968d9e35b5bf3d3b78c191064476fa69e87fa05/src/languages/ts/index.js#L1616-L1620).
- Svelte 5.59.1 wraps a literal there: `"a".length` prints as `("a").length`. It wraps a
  number, a regular expression, `true` and `null` the same way. In a module it also wraps an
  object, a function or a class there, as in `({}).x` and `(function () {})()`. A template
  literal, an array, a name, a member and a call stay bare.
- rsvelte prints a literal bare, as in `"a".length` and `1 .x`. Both write the parentheses
  JavaScript needs, such as those around an arrow function or a sequence.
- The report is [#5387](https://github.com/baseballyama/rsvelte/issues/5387).
- A plain `.ts` file is not part of this entry. There, TypeScript 6.0.3's emit is the output. It
  keeps each pair of parentheses in the source except those around a type assertion, as in
  `(f)(1)`. The emit that rsvelte writes drops them. No corpus task compares that emit
  ([#5405](https://github.com/baseballyama/rsvelte/issues/5405)). The emit is to match
  TypeScript's text there, as [#5389](https://github.com/baseballyama/rsvelte/issues/5389) tracks.
