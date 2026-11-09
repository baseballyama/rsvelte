# Svelte lint

This crate has the rules that need syntax and scopes. It does not register a type provider, and
it does not depend on `rsvelte_svelte_lint_typed` or `rsvelte_typescript_check`. TypeScript core
supplies JS/TS parsing and scopes; it does not start tsgo.

| Rule                                               | Facts requested           |
| -------------------------------------------------- | ------------------------- |
| `svelte/button-has-type`                           | Surface tree              |
| `svelte/first-attribute-linebreak`                 | Surface tree              |
| `svelte/html-closing-bracket-new-line`             | Surface tree              |
| `svelte/html-closing-bracket-spacing`              | Surface tree              |
| `svelte/html-quotes`                               | Surface tree              |
| `svelte/html-self-closing`                         | Surface tree              |
| `svelte/max-attributes-per-line`                   | Surface tree              |
| `svelte/mustache-spacing`                          | Surface tree              |
| `svelte/no-spaces-around-equal-signs-in-attribute` | Surface tree              |
| `svelte/no-trailing-spaces`                        | Surface tree              |
| `svelte/sort-attributes`                           | Surface tree              |
| `svelte/spaced-html-comment`                       | Surface tree              |
| `svelte/valid-each-key`                            | HIR and resolution        |
| `no-unused-vars`                                   | Resolution and JS parents |

Rules live in `src/rules/<rule>.rs`. `lint.rs` is the library entry point. `configuration.rs`
selects rules, severity and options, and `task.rs` adapts the library to the registry and JSON
output. The crate caches facts once per document.

`Configuration::new` rejects duplicate rules, and a rule it does not list is off. The default
turns on `no-unused-vars` and `svelte/button-has-type`. Findings keep source order, and
configuration order breaks ties.

`register` turns on `svelte.lint/default`. `register_artifacts` registers the plugin and the
shared facts without turning on its task. For rules that need type information, use
[`lint_typed`](../lint_typed/README.md).

## Fixtures

`tests/fixtures.rs` runs the compiler's hand-written inputs (`../compile/tests/fixtures`); only
their lint snapshots live here. A difference in a hand-written case fails. The corpus runs in
the `corpus` test of `rsvelte_command_line`, where a unit without a lint oracle stays
UNMEASURED. Inputs that are not components do not run.

`tests/upstream.rs` runs the rule tests of eslint-plugin-svelte, copied unchanged to
[`tests/upstream/eslint-plugin-svelte`](tests/upstream/eslint-plugin-svelte). It also runs this
crate's cases in `tests/cases`, which use the same layout:

- `<rule>/{valid,invalid}/<name>-input.svelte` is the input.
- `<name>-config.json` or `_config.json` holds the options.
- `<name>-errors.yaml` holds the expected reports.
- `<name>-output.svelte` holds the code after one pass of fixes, when a fix applies.

It reads them as the upstream runner does. Every case of an implemented rule must pass; the
test counts the others.

```sh
cargo test -p rsvelte_svelte_lint --test upstream
mise exec -- node tools/oracle/oracle.ts upstream eslint-plugin-svelte <checkout at the oracle's tag>
mise exec -- node tools/oracle/oracle.ts lint-cases   # write errors.yaml and output for a new case
```

To add a rule, add it to `IMPLEMENTED` in `tests/upstream.rs`. ESLint writes `errors.yaml` and
the output; never write them by hand.

See [the performance workload](../../../../tools/performance/workloads/svelte-lint/README.md).
