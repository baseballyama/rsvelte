# Svelte lint

This crate has every rule of the Svelte lint. TypeScript core supplies JS/TS parsing and scopes; the
crate does not depend on `rsvelte_typescript_check` and does not start tsgo.

| Rule                                                 | Facts requested           |
| ---------------------------------------------------- | ------------------------- |
| `svelte/@typescript-eslint/no-unnecessary-condition` | Condition types           |
| `svelte/button-has-type`                             | Surface tree              |
| `svelte/first-attribute-linebreak`                   | Surface tree              |
| `svelte/html-closing-bracket-new-line`               | Surface tree              |
| `svelte/html-closing-bracket-spacing`                | Surface tree              |
| `svelte/html-quotes`                                 | Surface tree              |
| `svelte/html-self-closing`                           | Surface tree              |
| `svelte/max-attributes-per-line`                     | Surface tree              |
| `svelte/mustache-spacing`                            | Surface tree              |
| `svelte/no-spaces-around-equal-signs-in-attribute`   | Surface tree              |
| `svelte/no-trailing-spaces`                          | Surface tree              |
| `svelte/sort-attributes`                             | Surface tree              |
| `svelte/spaced-html-comment`                         | Surface tree              |
| `svelte/valid-each-key`                              | HIR and resolution        |
| `no-unused-vars`                                     | Resolution and JS parents |

Rules live in `src/rules/<rule>.rs`. `lint.rs` is the library entry point. `configuration.rs`
selects rules, severity and options, and `task.rs` adapts the library to the registry and JSON
output. The crate caches facts once per document.

`Configuration::new` rejects duplicate rules, and a rule it does not list is off. The default
turns on `no-unused-vars` and `svelte/button-has-type`. Findings keep source order, and
configuration order breaks ties.

`register` turns on `svelte.lint/default`. `register_artifacts` registers the plugin and the
shared facts without turning on its task.

Known gap: `svelte/no-unused-class-name` and `svelte/consistent-selector-style` read selectors from
rsvelte's CSS parser, so they say nothing on a sheet that `PostCSS` accepts and that parser
rejects. No corpus component has such a sheet: 0 of the 2,190 whose `<style>` has the language
`css` or `scss`, and none the other way. The same count reports a hand-made sheet with `.a-#{$b}`.

Not supported: `<style>` that needs a CSS language other than plain CSS. For `scss`, `sass`,
`less` or `stylus`, `svelte/valid-compile` and `svelte/no-unused-svelte-ignore` compile the
component without that `<style>`. The upstream plugin does the same when the package is
missing. The two rules miss compiler warnings inside such a sheet. Upstream loads the
package from the user's project, and rsvelte never starts Node. The upstream cases that need it
wait in `tests/upstream_preprocessor.json` with their reasons. In the corpus, 213 of the 2,232
components with a `<style>` use `scss`, `sass` or `less`.

A later version could take a configured function, as `cssHash` does. It would read the language,
filename and content and return the code with its source map. `svelte.compile` would use it too.

## Types

A type-aware rule reads `File::condition_types`: one condition type per JS/TS node
(`types::TypeFacts`). The first request computes it, once per document; a rule that is off never
requests it. A host can call `register_type_provider` to supply them. Without one, a built-in
prototype supplies them. It does not connect to tsgo and assumes strict null checking. It
supports literals, scalar annotations, `as` assertions and immutable aliases; an unknown type
stays unknown. Flow analysis, unions and imported types are not supported. Nor are optional
chains, comparisons, predicates or loop options. So upstream's cases of `no-unnecessary-condition` may
differ; `tests/upstream.rs` counts them without failing. This crate's own cases of it must pass.

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

It reads them as the upstream runner does. Every case of an implemented rule must pass, except
upstream's cases of a type-aware rule; the test counts the others. `lint-cases` gives a
type-aware rule (`@typescript-eslint/…`) a strict TypeScript project.

```sh
cargo test -p rsvelte_svelte_lint --test upstream
mise exec -- node tools/oracle/oracle.ts upstream eslint-plugin-svelte <checkout at the oracle's tag>
mise exec -- node tools/oracle/oracle.ts lint-cases   # write errors.yaml and output for a new case
```

To add a rule, add it to `IMPLEMENTED` in `tests/upstream.rs`. ESLint writes `errors.yaml` and
the output; never write them by hand.

See [the performance workload](../../../../tools/performance/workloads/svelte-lint/README.md).
