# Svelte TypeScript projection

`rsvelte_svelte_typescript_projection` builds a TypeScript projection without a type checker or Node.
The output uses `.ts`, so angle-bracket type assertions remain valid. JSX is not required
for template checks: elements become typed calls to `svelteHTML.createElement`.

| API | Result |
|---|---|
| `lower(&Component, source)` | An immutable projection AST |
| `emit(&SyntaxTree, source)` | TypeScript text and byte-range source mappings |
| `DECLARATIONS` | Filename and text of the projection helpers' type declarations |
| `register(&mut Registry)` | `svelte.typescript_projection/default`, plus cached AST and emission artifacts |
| `content_mapper::write_transform(source, output)` | A native TypeScript content mapper transform result |

The source component must be the one used to build the projection. Source nodes refer
by ID to its immutable JS/TS AST. The printer copies complete source subtrees to keep
TypeScript syntax and comments that the runtime compiler erases. Generated statements,
branches, loops, assignments, component calls, properties, spreads, and strings are typed AST nodes. Lowering
never emits text. No transform prints and reparses its output.
Consumers that check the emitted TypeScript include `DECLARATIONS` and the Svelte package types.
The standalone `rsvelte-svelte-content-mapper` executable exposes the same AST lowering to
native TypeScript 7.1. It parses each transform input once and emits UTF-8 span mappings.
Its package manifest is in `content_mapper/package.json`. Add that package to `node_modules`
and select it with `contentMappers: [{ "package": "@rsvelte/svelte-content-mapper", "extensions": [".svelte"] }]`.
Run native TypeScript with `--runExternalCode`. Include `DECLARATIONS` and `types: ["svelte"]`
in the project. Install the executable with
`cargo install --path crates/languages/svelte/typescript_projection`.
Element helpers and attachment keys are ordinary member, call, object and computed-property
nodes. The printer does not choose Svelte helper names or lower Svelte constructs.
`lower` and `emit` run directly without a task registry. The AST can also be inspected
without emitting it, and parser artifacts can be shared when composing tasks.

This follows the separate AST construction and printing steps of the
[TypeScript compiler API](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API).
It uses flat per-file node and child vectors with `u32` IDs. A per-node side table indexes
TypeScript expression suffixes once, rather than searching all suffixes for every expression.
The parser artifact is shared with the compiler; projection needs no semantic-analysis crate.
Node, child and scratch buffers use the kernel's bounded per-thread pool.

JavaScript and scriptless components can also be projected. Unsupported type semantics
return their original source range. Supported template checks include `if`, `each`,
`@const`, Svelte 5 component props without children, `class:`, and DOM `bind:this`.
Public component contracts include annotated props, defaults inferred from object destructuring,
instance function and constant exports, and `$bindable()` keys. Instance value exports are
component instance members; module exports keep their module meaning. Components without props
reject arbitrary property names. Generic component contracts and untyped whole-object `$props()`
bindings remain unsupported. Component children, other bindings and directives, snippets, and await
blocks remain unsupported. This is not a complete Svelte type projection.

Type checking and typed lint consume this same projection. There is no task-specific output.
Original expressions keep exact content mappings; generated helpers do not become source lint
nodes. The [shared type information API](../../../../docs/type-information.md) uses one native
Program for both consumers. The existing Rust CLI checker has not been connected to that API.

```sh
cargo test -p rsvelte_svelte_typescript_projection
cargo test -p rsvelte_svelte_typescript_projection --test fixtures
cargo run --profile benchmark -p rsvelte_svelte_typescript_projection --example verify -- crates/languages/svelte/compile/tests/fixtures
cargo run --profile benchmark -p rsvelte_svelte_typescript_projection --example benchmark -- crates/languages/svelte/compile/tests/fixtures 20
cargo run -p rsvelte_svelte_typescript_projection --example layout
```

The verifier counts all Svelte inputs, parse failures, unsupported projections, and invalid
TypeScript outputs. It checks generated syntax with an independent parser. The benchmark
measures lowering and printing for parsed components with an instance TypeScript script;
its process CPU counters also include file reads and source parsing. Layout sizes are payload
measurements, not proof of cache residency. See [performance tools](../../../../tools/performance/README.md).
Measured results and limitations are in the [projection report](../../../../docs/svelte-project-performance.md).

The fixture test reads the exact input population from `../compile/tests/fixtures`.
Only projection expectations and actual outputs live here. It checks every emitted file
with an independent TypeScript parser, including external cases without oracle snapshots.
Handwritten snapshots detect changes in our own output; they do not establish type equivalence
with svelte2tsx. The [semantic harness](../../../../docs/typescript-projection-testing.md)
compares source-visible types from both projections through TS 7.1 content mappers over the same compiler inputs.
The harness also compares public props, instance exports, and bindable keys. Missing queries
and unsupported public contract shapes remain `UNMEASURED`.
