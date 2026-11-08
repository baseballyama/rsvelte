# Svelte lint with types

This optional plugin owns `svelte/@typescript-eslint/no-unnecessary-condition`, its condition
type provider and its type fixtures. The `svelte.lint.typed` declaration requires `svelte.lint`
and `typescript.check` at the workspace version.

`register` turns on only `svelte.lint.typed/default`. Registering its dependencies does not turn
on the normal lint or type check tasks. To run both lint plugins, register both; they share
parsed trees and keep separate configuration facets and reports.

Rules live in `src/rules/<rule>.rs`. `lint.rs` is the library entry point. `configuration.rs`
selects the severity or turns the rule off, and `task.rs` handles registration and output.
`computation.rs` defines the provider contract, and `types/` holds the prototype provider.

`register_with_type_provider` accepts a replacement provider. `TypeFacts` stores one condition
classification per JS/TS node. The first typed rule request computes it, and the crate caches
it per document. A rule that is off never requests it.

The default provider is a limited Rust prototype; it does not connect to tsgo. It assumes strict
null checking. It supports literals, scalar annotations, `as` assertions and immutable aliases.
An unknown type stays unknown. It does not support full flow analysis, unions or imported
types. Nor does it support optional chains, comparisons, predicates or loop options. Five copied
legacy fixtures still differ.

## Fixtures

`tests/rules` owns the type-related MIT fixtures from `eslint-plugin-svelte`, with their
configurations, licenses and oracle snapshots. It also holds native provider cases. Supported
cases compare strictly; the test counts differences in legacy cases.

```sh
cargo test -p rsvelte_svelte_lint_typed
mise exec -- node tools/oracle/oracle.ts import-lint <upstream-checkout>
```

The shared importer regenerates both suites from upstream commit
`437ae4fdab4d38c6c71c689be4cd897b607c4426` and checks positive controls. The oracle versions
and input hashes sit beside the copied cases.

The CLI's `lint-typed` Cargo feature includes and registers this plugin; the feature is off by
default. A normal lint host does not need to link this crate.
