# Svelte lint

This crate contains rules that need syntax and scopes. It does not register a type
provider or depend on `rsvelte_svelte_lint_typed` or `rsvelte_typescript_check`.
TypeScript core supplies JS/TS parsing and scopes; it does not start tsgo.

| Rule | Facts requested |
|---|---|
| `svelte/button-has-type` | Surface tree |
| `svelte/valid-each-key` | HIR and resolution |
| `no-unused-vars` | Resolution and JS parents |

Rules live in `src/rules/<rule>.rs`. `lint.rs` is the library entry point;
`configuration.rs` selects rules, severity and options; `task.rs` adapts the library
to the registry and JSON output. Facts are cached once per document.

`Configuration::new` rejects duplicate rules. Omitted rules are disabled. The
default enables `no-unused-vars` and `svelte/button-has-type`. Findings keep source
order, with configuration order for ties.

`register` enables `svelte.lint/default`. `register_artifacts` registers the plugin
and shared facts without enabling its task. Use
[`lint_typed`](../lint_typed/README.md) for rules that require type information.

## Fixtures

The shared suite reads inputs directly from `../compile/tests/fixtures`. Only lint
snapshots live here. Hand-written cases fail on differences. Copied corpus cases
without a lint oracle remain UNMEASURED. Non-component inputs are not run.

`tests/rules` contains MIT inputs and configurations from `eslint-plugin-svelte`,
including every button option combination. Provenance, licenses and hashes live
beside the copied cases. Supported cases have strict comparisons.

```sh
cargo test -p rsvelte_svelte_lint
mise exec -- node tools/fixtures/lint/import-svelte.ts <upstream-checkout>
```

The importer regenerates both lint suites through ESLint. Use upstream commit
`437ae4fdab4d38c6c71c689be4cd897b607c4426`; oracle versions are recorded in each
suite. Expected output is generated, never edited by hand.

See [the performance workload](../../../../tools/performance/workloads/svelte-lint/README.md).
