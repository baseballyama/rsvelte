# Svelte lint with types

This optional plugin owns `svelte/@typescript-eslint/no-unnecessary-condition`, its
condition type provider and type fixtures. The `svelte.lint.typed` declaration
requires `svelte.lint` and `typescript.check` at the workspace version.

`register` enables only `svelte.lint.typed/default`. Dependency registration does
not enable normal lint or typecheck tasks. Register both lint plugins to run both;
they share parsed trees and keep separate configuration facets and reports.

Rules live in `src/rules/<rule>.rs`. `lint.rs` is the library entry point,
`configuration.rs` selects severity or disables the rule, and `task.rs` handles
registration and output. `computation.rs` defines the provider contract;
`types/` contains the current prototype provider.

`register_with_type_provider` accepts a replacement provider. `TypeFacts` stores
one condition classification per JS/TS node. It is computed on the first typed
rule request and cached per document. A disabled rule never requests it.

The default provider is still a limited Rust prototype, not a tsgo connection. It
assumes strict null checking and supports literals, scalar annotations, `as`
assertions and immutable aliases. Unknown types remain unknown. Full flow analysis,
unions, imported types, optional chains, comparisons, predicates and loop options
are not implemented. Five copied legacy fixtures still differ.

## Fixtures

`tests/rules` owns the type-related MIT fixtures, configurations, licenses and
oracle snapshots from `eslint-plugin-svelte`, plus native provider cases.
Supported cases have strict comparisons. Differences in legacy cases are counted.

```sh
cargo test -p rsvelte_svelte_lint_typed
mise exec -- node tools/fixtures/lint/import-svelte.ts <upstream-checkout>
```

The shared importer regenerates both suites with upstream commit
`437ae4fdab4d38c6c71c689be4cd897b607c4426` and checks positive controls.
Oracle versions and input hashes are recorded beside the copied cases.

The CLI's `lint-typed` Cargo feature includes and registers this plugin. It is off
by default. A normal lint host does not need to link this crate.
