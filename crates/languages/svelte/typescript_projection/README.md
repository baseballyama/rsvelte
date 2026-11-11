# Svelte TypeScript projection

`rsvelte_svelte_typescript_projection` turns a Svelte component into TypeScript (a projection)
without a type checker or Node. The output uses `.ts`, so angle-bracket type assertions stay
valid. Template checks need no JSX: elements become typed calls to `svelteHTML.createElement`.

| API                                               | Result                                                                         |
| ------------------------------------------------- | ------------------------------------------------------------------------------ |
| `lower(&Component, source)`                       | An immutable projection AST                                                    |
| `emit(&SyntaxTree, source)`                       | TypeScript text and byte-range source mappings                                 |
| `DECLARATIONS`                                    | Filename and text of the projection helpers' type declarations                 |
| `register(&mut Registry)`                         | `svelte.typescript_projection/default`, plus cached AST and emission artifacts |
| `content_mapper::write_transform(source, output)` | A native TypeScript content mapper transform result                            |

## How it builds the projection

Pass the same source component that built the projection. Source nodes refer by ID to its
immutable JS/TS AST. The printer copies whole source subtrees, which keeps the TypeScript syntax
and comments that the runtime compiler erases. Lowering builds typed AST nodes for generated
statements, branches, loops and assignments. It does the same for component calls, properties,
spreads and strings. Lowering never
emits text, and no transform prints and parses its output again.

Element helpers and attachment keys are ordinary member, call, object and computed-property
nodes. The printer does not choose Svelte helper names or lower Svelte constructs. `lower` and
`emit` run directly, without a task registry. You can also inspect the AST without emitting it,
and share the parser artifacts when you compose tasks.

The design follows the separate AST construction and printing steps of the
[TypeScript compiler API](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API).
Each file has flat node and child vectors with `u32` IDs. A per-node side table records the
TypeScript expression suffixes once, so the lowering does not search all suffixes for every
expression. The projection shares the parser artifact with the compiler and needs no
semantic-analysis crate. Node, child and scratch buffers come from the kernel's bounded
per-thread pool.

## Use it with native TypeScript

A consumer that checks the emitted TypeScript includes `DECLARATIONS` and the Svelte package
types. The standalone `rsvelte-svelte-content-mapper` executable gives native TypeScript 7.1
the same AST lowering. It parses each transform input once and emits UTF-8 span mappings.

1. Install the executable with `cargo install --path crates/languages/svelte/typescript_projection`.
2. Add the package in `content_mapper/package.json` to `node_modules`.
3. Select it with
   `contentMappers: [{ "package": "@rsvelte/svelte-content-mapper", "extensions": [".svelte"] }]`.
4. Include `DECLARATIONS` and `types: ["svelte"]` in the project.
5. Run native TypeScript with `--runExternalCode`.

## What it supports

The projection also handles JavaScript and scriptless components. Unsupported type semantics
return their original source range.

- Template checks cover the `if`, `each` and `key` blocks and the `@const`, `@render`, `@html`
  and `@debug` tags. They cover custom elements and the `svelte:` elements that svelte2tsx
  writes as elements, such as `svelte:head` and `svelte:window`. They also cover Svelte 5 component props
  without children, `class:` and `bind:` on elements and components. A bound variable reads as
  its declared type, as svelte2tsx widens it.
- Public component contracts include annotated props and defaults inferred from object
  destructuring. They also include instance function and constant exports, and `$bindable()`
  keys.
- Instance value exports are members of the component instance; module exports keep their
  module meaning. A component without props rejects arbitrary property names.
- The default export also names the instance's type, as svelte2tsx does, so an import can
  annotate a variable with the component.

Still unsupported:

- Generic component contracts and untyped whole-object `$props()` bindings
- Component children, directives other than `class:` and `bind:`, and the check that a
  component's prop is bindable
- Snippets and await blocks

This is not a complete Svelte type projection.

Type checking and typed lint read this same projection; no task has its own output. Original
expressions keep exact content mappings, and generated helpers do not become source lint nodes.
The [shared type information API](../../../../tools/type-information/README.md) uses one native
Program for both consumers. The Rust CLI checker does not use that API yet.

## Tests and measurements

```sh
cargo test -p rsvelte_svelte_typescript_projection
cargo test -p rsvelte_svelte_typescript_projection --test fixtures
cargo run --profile benchmark -p rsvelte_svelte_typescript_projection --example verify -- corpus/svelte
cargo run --profile benchmark -p rsvelte_svelte_typescript_projection --example benchmark -- corpus/svelte 20
cargo run -p rsvelte_svelte_typescript_projection --example layout
```

The verifier counts all Svelte inputs, parse failures, unsupported projections and invalid
TypeScript outputs. It checks the generated syntax with an independent parser. The benchmark
measures lowering and printing for parsed components with an instance TypeScript script. Its
process CPU counters also include file reads and source parsing. Layout sizes measure payloads;
they do not prove cache residency. See [performance tools](../../../../tools/performance/README.md).

The fixture test runs the compiler's hand-written inputs (`../compile/tests/fixtures`); only the
projection's expected and actual outputs live here. The corpus runs in the `corpus` test of
`rsvelte_command_line`, which parses every emitted projection with an independent TypeScript
parser, including units without oracle snapshots. Hand-written snapshots catch changes in
our own output; they do not show type equivalence with svelte2tsx.

The semantic harness (`tools/oracle/oracle.ts semantic`) compares the source-visible types of
both projections through TS 7.1 content mappers, over the same compiler inputs. It also compares
public props, instance exports and bindable keys. Missing queries and unsupported public
contract shapes stay `UNMEASURED`.
