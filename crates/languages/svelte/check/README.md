# Svelte type checking

`rsvelte_svelte_check` reads the cached output of `rsvelte_svelte_typescript_projection` and
runs native TypeScript 7.1 through its content mapper. Projection and type checking share one
implementation. The task name stays `svelte.check/default` to match the existing oracle
identifier.

Configure the type checker, `content_mapper` and the Svelte package types through
`TypeCheckConfiguration`, or through the options that `EXTENSION` reads. JavaScript components
stay unchecked. Projection consumers can use the separate projection crate without any of these
dependencies.

The checker gives the original Svelte inputs and the cached AST projections to
`rsvelte-typescript-content-mapper`. Native TypeScript reads the projection and the span map,
then reports diagnostics in original coordinates. Nothing parses Svelte again. The shared
protocol crate also serves other languages. The `contentMapper` option names this executable;
the default is `rsvelte-typescript-content-mapper` in `node_modules/.bin` or on `PATH`.

```sh
cargo install --path crates/languages/typescript/content_mapper
```

The crate's fixture tests build their own thin mapper executable on the same implementation.

`tests/fixtures.rs` runs the compiler's hand-written inputs (`../compile/tests/fixtures`); only
the checker's expected and actual outputs live here. The corpus runs in the `corpus` test of
`rsvelte_command_line`. There, a unit without a checker oracle snapshot reports `UNMEASURED` and
never counts as a match. The coverage line reports these apart: prepared TS inputs, unchecked
inputs, unsupported projections and parse errors. A passing snapshot can still hold
`check_unsupported` diagnostics. Each source repository runs as its own checker project,
because their globals can conflict.

The checker reads each document at its own path through its file layer; a relative path is
beside `tsconfig.json`. Imports between the documents of one run resolve as on the disk. Like
svelte-check, the checker blanks the svelte package's `declare module '*.svelte'`, so an import
of a missing component fails. An unchecked component, written in JavaScript or with a refused
projection, still resolves: the checker reads it as `any`, with the exports of its module
script. Without `allowJs`, svelte-check reports TS7016 for an import of a component in JavaScript: it
resolves that module with a `.js` extension. A content mapper sets only the text's extension, so
rsvelte reports no TS7016 there. Empty findings do not prove that the checker checked its props or its instance. A
component that does not parse is not checked: as in svelte-check, its one finding is the
parser's error, with the code `-1`.

```sh
cargo test -p rsvelte_svelte_check --test fixtures
cargo test -p rsvelte_svelte_check --test fixtures -- rsvelte
```
