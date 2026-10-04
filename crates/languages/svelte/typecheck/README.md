# Svelte type checking

`rsvelte_svelte_typecheck` consumes the cached output of `rsvelte_svelte_typescript_projection` and
runs native TypeScript 7.1 through its content mapper. Projection and type checking share one implementation.
The task name stays `svelte.check/default` to match the existing oracle identifier.

Configure `tsc`, `content_mapper`, the Svelte package types, and an optional tsconfig through
`TypeCheckConfiguration`. As before, JavaScript components are unchecked.
Projection consumers can use the separate crate without any of these dependencies.

The checker supplies original Svelte inputs and cached AST projections to
`rsvelte-typescript-content-mapper`. Native TypeScript consumes the projection and span map,
then reports diagnostics in original coordinates. Svelte is not parsed again. The shared
protocol crate also serves other languages. The CLI finds this executable on `PATH`, or
uses `RSVELTE_TYPESCRIPT_CONTENT_MAPPER` as its path.

```sh
cargo install --path crates/languages/typescript/content_mapper
```

Crate fixture tests build their own thin mapper executable, which uses the same implementation.

`tests/fixtures.rs` reads the exact input population from `../compile/tests/fixtures`.
Only checker expectations and actual outputs live here. External cases without a checker
oracle snapshot report `UNMEASURED`; they cannot count as oracle matches.
The coverage line reports prepared TS inputs, unchecked inputs, unsupported projections,
and parse errors separately. Passing snapshots can still contain unsupported diagnostics.
Different source repositories run as separate checker projects to avoid conflicting globals.

This checker is incomplete. It uses temporary file names and does not preserve the original
project import graph. Projection does not export component contracts yet. Svelte's ambient
`*.svelte` declaration can accept unresolved imports with a broad component type, so empty
findings do not prove that imported component props were checked.

```sh
cargo test -p rsvelte_svelte_typecheck --test fixtures
cargo test -p rsvelte_svelte_typecheck --test fixtures -- rsvelte
```
