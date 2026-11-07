# Crate fixture tests

`rsvelte_test_harness` runs a crate's tasks with `cargo test` over two kinds of case, and
compares rsvelte's output with `expected/`. It writes the output to a case's `actual/` (not in
git), so `diff -ru <case>/expected <case>/actual` shows a difference: on every run for a
hand-written case, and only with `FIXTURE_ACTUAL=1` for a corpus unit.

| Kind         | Where                                                                      | `expected/` holds                                     | A difference                 |
| ------------ | -------------------------------------------------------------------------- | ----------------------------------------------------- | ---------------------------- |
| hand-written | the crate's `tests/fixtures/` (`rsvelte/` and others in `compile`)         | rsvelte's own output, accepted with `UPDATE_EXPECT=1` | fails the test               |
| corpus unit  | [`corpus/<family>/`](../../corpus/README.md), with `Fixtures::corpus_only` | the official tool's output                            | fails when its verdict moved |
| copied       | a directory of `tests/fixtures/` with `source.json` (`lint_typed`)         | the official tool's output                            | is counted, not failed       |

Snapshots show what changed. Only the official output shows what is correct. Against it, each
task and variant of a unit gets one verdict, its worst file: `match`, `unexpected` (only rsvelte
wrote the file), `missing` (only the official tool did), `mismatch`, or `unparseable` (rsvelte's
JavaScript does not parse). JavaScript is compared as a syntax tree, with the meaning of
`tools/oracle/canonical.ts` (layout, comments and literal spelling are ignored; `@__PURE__` on
calls is not), `lint.json` by the rules rsvelte ran, other JSON as values, and the rest as bytes.
A unit where the official tool reported an error is compared only on its `error.json`. A unit
where rsvelte wrote only diagnostics and the official tool wrote output is refused.

Every corpus verdict except a refusal is recorded in `corpus/_registry/parity.json`. The ratchet
is two-sided: a verdict that moved fails, an improvement included, until `UPDATE_EXPECT=1` records
it. A run limited to some cases compares and records only theirs.

## A case

```
crates/languages/svelte/compile/tests/fixtures/
└── rsvelte/each-keyed/          a hand-written case; nested directories are allowed
    ├── input.svelte             the input; exactly one `input.<ext>` per case
    ├── expected/
    │   ├── client.js            the `client` snapshot
    │   ├── server.js            the `server` snapshot
    │   └── client.diagnostics.txt   only when the task reports diagnostics
    └── actual/                  the same names, written by every run

corpus/svelte/bits-ui/src/lib/button.svelte/   a corpus unit; the directory is the file's path
├── input.svelte
├── expected/svelte.compile/     client.js, server.js, client.css, client.warnings.json, ...
└── actual/svelte.compile/       client.js, ..., client.diagnostics.json, as `rsvelte corpus` writes
```

- A hand-written document is named `<case>.<ext>` (here `rsvelte/each-keyed.svelte`). A corpus
  document is named by its path in the repository (here `src/lib/button.svelte`), the file name
  the official tool was given. Component names and style hashes come from that name.
- A hand-written snapshot is `<name>.<file>`: `<name>` is set by the crate's test, `<file>` by the
  task's output (`js`, `css`, `lint.json`, ...). Its diagnostics are one line each:
  `severity code line:column-line:column message`, with lines and columns counted from 1 and
  columns in UTF-16 code units.
- A corpus unit's files are `<task>/<variant>.<file>`. The harness changes only the files of its
  own tasks in `actual/`. A task with no official output for the unit, or one its `fixture.toml`
  skips, is not measured on it.
- Other files in the case are not read by the harness (for example `behaviour.toml`, read by the
  behaviour oracle's tests in `tools/oracle`).

## Add a case

```sh
mkdir crates/languages/svelte/compile/tests/fixtures/rsvelte/my-case
$EDITOR crates/languages/svelte/compile/tests/fixtures/rsvelte/my-case/input.svelte
UPDATE_EXPECT=1 cargo test -p rsvelte_svelte_compile --test fixtures -- my-case
git diff -- crates/languages/svelte/compile/tests/fixtures   # read every snapshot you accept
```

## Run

The Svelte corpus runs in one test, `rsvelte_command_line`'s `corpus`: compile, lint, projection
and type check together, so each unit is found, read and parsed once. Each crate's `fixtures` test
runs its hand-written cases.

```sh
cargo test -p rsvelte_svelte_compile --test fixtures                 # the hand-written cases
cargo test -p rsvelte_svelte_compile --test fixtures -- --exact rsvelte/each-keyed
UPDATE_EXPECT=1 cargo test -p rsvelte_svelte_compile --test fixtures  # write changed snapshots, remove stale ones
cargo test -p rsvelte_command_line --test corpus                     # every corpus unit
cargo test -p rsvelte_command_line --test corpus -- svelte/bits-ui    # units whose name contains it
UPDATE_EXPECT=1 cargo test -p rsvelte_command_line --test corpus     # record moved verdicts
FIXTURE_ACTUAL=1 cargo test -p rsvelte_command_line --test corpus -- svelte/bits-ui  # also write the units' actual/
```

The test fails when a hand-written snapshot differs, is missing, or is no longer produced, when a
corpus verdict moved, when a task panics on any case, and when no case exists. It prints each
task's verdicts and refusals. `FIXTURE_VERDICTS=<file>` writes every file's verdict there, one
`verdict case file` line each.

## Add fixture tests to a crate

```toml
# Cargo.toml
[dev-dependencies]
rsvelte_test_harness.workspace = true

[[test]]
name = "fixtures"
harness = false
```

```rust
// tests/fixtures.rs
use std::process::ExitCode;

use rsvelte_kernel::computation::pipeline::Registry;

fn main() -> ExitCode {
    let mut registry = Registry::new();
    rsvelte_svelte_compile::register(&mut registry);
    rsvelte_test_harness::Fixtures::new(env!("CARGO_MANIFEST_DIR"), registry)
        .snapshot("svelte.compile/client", "client")
        .snapshot("svelte.compile/server", "server")
        .run()
}
```

A new task for Svelte files joins the corpus by a `snapshot` in
[`command_line/tests/corpus.rs`](../hosts/command_line/tests/corpus.rs); a task of the official tool
that rsvelte does not implement yet is a `not_implemented`, so its units stay in the ratchet as
`missing`.

Type-check tasks need native TypeScript 7.1 and the framework packages.
`NodePackages::locate()` finds them in `tools/oracle/node_modules`; install them with
`pnpm install --frozen-lockfile` at the repository root. `NodePackages::type_checker()` returns
that `tsc` with `--singleThreaded` (the tests check several projects at once), or the command in
`FIXTURE_TYPE_CHECKER`, and prints the checker and its version:

```sh
FIXTURE_TYPE_CHECKER="tsrs --fast" cargo test -p rsvelte_svelte_typecheck --test fixtures
```

## Where the cases are

| Crate                                    | Tasks                                       | Snapshot names     |
| ---------------------------------------- | ------------------------------------------- | ------------------ |
| `languages/svelte/compile`               | `svelte.compile/client`, `/server`          | `client`, `server` |
| `languages/svelte/format`                | `svelte.format/default`                     | `formatted`        |
| `languages/svelte/lint`                  | `svelte.lint/default`                       | `findings`         |
| `languages/svelte/typecheck`             | `svelte.check/default`                      | `findings`         |
| `languages/svelte/typescript_projection` | `svelte.typescript_projection/default`      | `projection`       |
| `languages/svelte/compile_vapor`         | `vuelte.compile/client`, `/server`          | `client`, `server` |
| `languages/vue/compile`                  | `vue.compile/default`                       | `compiled`         |
| `languages/vue/format`                   | `vue.format/default`                        | `formatted`        |
| `languages/vue/lint`                     | `vue.lint/default`                          | `findings`         |
| `languages/vue/check`                    | `vue.check/default`                         | `findings`         |
| `languages/vue/compile_svelte`           | `svue.compile/client`, `/server`            | `client`, `server` |
| `hosts/command_line`                     | `ts.check/default` (registered by the host) | `ts-check`         |

The Svelte crates in the table run the corpus too. Lint, type checking and TypeScript projection
use `Fixtures::inputs_from` to read the compiler's hand-written inputs, and keep their own
snapshots of them. Type checking runs each source on its own (`Fixtures::per_project`). A unit
without an official output reports `UNMEASURED`, not a match.
