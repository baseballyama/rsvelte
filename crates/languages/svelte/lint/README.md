# Svelte lint

This crate contains rules that need syntax and scopes. It does not register a type
provider or depend on `rsvelte_svelte_lint_typed` or `rsvelte_typescript_check`.
TypeScript core supplies JS/TS parsing and scopes; it does not start tsgo.

| Rule                     | Facts requested           |
| ------------------------ | ------------------------- |
| `svelte/button-has-type` | Surface tree              |
| `svelte/valid-each-key`  | HIR and resolution        |
| `no-unused-vars`         | Resolution and JS parents |

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

`tests/upstream.rs` runs eslint-plugin-svelte's own rule tests, copied unchanged to
[`fixtures/upstream/eslint-plugin-svelte`](../../../../fixtures/upstream/eslint-plugin-svelte),
and this crate's cases in `tests/cases`, which use the same layout:
`<rule>/{valid,invalid}/<name>-input.svelte`, options in `<name>-config.json` or `_config.json`,
the expected reports in `<name>-errors.yaml`. It reads them as upstream's runner does. Every case of
an implemented rule must pass; the others are counted.

```sh
cargo test -p rsvelte_svelte_lint --test upstream
mise exec -- node tools/fixtures/fixtures.ts upstream eslint-plugin-svelte <checkout at the oracle's tag>
mise exec -- node tools/fixtures/fixtures.ts lint-cases   # write errors.yaml for a new case in tests/cases
```

To add a rule, add it to `IMPLEMENTED` in `tests/upstream.rs`. `errors.yaml` is written by ESLint,
never by hand.

See [the performance workload](../../../../tools/performance/workloads/svelte-lint/README.md).
