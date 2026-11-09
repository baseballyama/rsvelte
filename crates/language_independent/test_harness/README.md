# Crate fixture tests

`rsvelte_test_harness` runs a crate's tasks with `cargo test` over its cases and compares
rsvelte's output with `expected/`. It writes the output to the case's `actual/`, which Git does
not track. Then `diff -ru <case>/expected <case>/actual` shows the difference. A hand-written
case gets `actual/` on every run; a corpus unit gets it only with `FIXTURE_ACTUAL=1`.

| Kind         | Where                                                                      | `expected/` holds                                     | A difference                 |
| ------------ | -------------------------------------------------------------------------- | ----------------------------------------------------- | ---------------------------- |
| hand-written | the crate's `tests/fixtures/` (`rsvelte/` and others in `compile`)         | rsvelte's own output, accepted with `UPDATE_EXPECT=1` | fails the test               |
| corpus unit  | [`corpus/<family>/`](../../corpus/README.md), with `Fixtures::corpus_only` | the official tool's output                            | fails when its verdict moved |

Snapshots show what changed, not what is correct; the official output shows that. Each task and
variant (such as `client`) of a corpus unit gets one verdict, the worst of its files:

| Verdict       | Meaning                                |
| ------------- | -------------------------------------- |
| `match`       | rsvelte's file equals the official one |
| `unexpected`  | only rsvelte wrote the file            |
| `missing`     | only the official tool wrote the file  |
| `mismatch`    | both wrote the file, and it differs    |
| `unparseable` | rsvelte's JavaScript does not parse    |

How files compare:

- JavaScript compares as a syntax tree, with the meaning of `tools/oracle/canonical.ts`. Layout,
  comments and literal spelling do not count, but `@__PURE__` on calls does.
- `lint.json` compares by the rules rsvelte ran, other JSON as values, and the rest as bytes.
- When the official tool reported an error, only the unit's `error.json` counts.
- When rsvelte wrote only diagnostics and the official tool wrote output, the harness refuses
  the unit: it prints the refusal and records no verdict.

`corpus/_registry/parity.json` records every corpus verdict except a refusal. The ratchet works
in both directions: any verdict that moved fails the test, an improvement too, until
`UPDATE_EXPECT=1` records it. A run limited to some cases compares and records only those.

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

- A hand-written document's name is `<case>.<ext>` (here `rsvelte/each-keyed.svelte`). A corpus
  document's name is its path in the source repository (here `src/lib/button.svelte`), the
  filename the official tool got. Component names and style hashes come from that name.
- A hand-written snapshot is `<name>.<file>`. The crate's test sets `<name>`, and the task's
  output sets `<file>`, such as `js` or `lint.json`. Its diagnostics are one line each:
  `severity code line:column-line:column message`. Lines and columns count from 1, and columns
  count UTF-16 code units.
- A corpus unit's files are `<task>/<variant>.<file>`. The harness changes only the files of its
  own tasks in `actual/`. A task does not measure a unit when the unit has no official output
  for it or its `fixture.toml` skips it.
- The harness does not read other files in the case. For example, the behavior oracle's tests
  in `tools/oracle` read `behaviour.toml`.

## Add a case

```sh
mkdir crates/languages/svelte/compile/tests/fixtures/rsvelte/my-case
$EDITOR crates/languages/svelte/compile/tests/fixtures/rsvelte/my-case/input.svelte
UPDATE_EXPECT=1 cargo test -p rsvelte_svelte_compile --test fixtures -- my-case
git diff -- crates/languages/svelte/compile/tests/fixtures   # read every snapshot you accept
```

## Run

The Svelte corpus runs in one test, the `corpus` test of `rsvelte_command_line`. It runs
compile, lint, projection and type check together. That way it finds, reads and parses each
unit once.
Each crate's `fixtures` test runs its hand-written cases.

```sh
cargo test -p rsvelte_svelte_compile --test fixtures                 # the hand-written cases
cargo test -p rsvelte_svelte_compile --test fixtures -- --exact rsvelte/each-keyed
UPDATE_EXPECT=1 cargo test -p rsvelte_svelte_compile --test fixtures  # write changed snapshots, remove stale ones
cargo test -p rsvelte_command_line --test corpus                     # every corpus unit
cargo test -p rsvelte_command_line --test corpus -- svelte/bits-ui    # units whose name contains it
UPDATE_EXPECT=1 cargo test -p rsvelte_command_line --test corpus     # record moved verdicts
FIXTURE_ACTUAL=1 cargo test -p rsvelte_command_line --test corpus -- svelte/bits-ui  # also write the units' actual/
```

The test fails in these cases:

- A hand-written snapshot differs, is missing, or is no longer produced.
- A corpus verdict moved.
- A task panics on any case.
- No case exists.

It prints each task's verdicts and refusals. `FIXTURE_VERDICTS=<file>` writes every file's
verdict to that file, one `verdict case file` line each.

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

use rsvelte_kernel::computation::registry::Registry;

fn main() -> ExitCode {
    let mut registry = Registry::new();
    rsvelte_svelte_compile::register(&mut registry);
    rsvelte_test_harness::Fixtures::new(env!("CARGO_MANIFEST_DIR"), registry)
        .snapshot("svelte.compile/client", "client")
        .snapshot("svelte.compile/server", "server")
        .run()
}
```

To add a task for Svelte files to the corpus, add a `snapshot` in
[`command_line/tests/corpus.rs`](../hosts/command_line/tests/corpus.rs). For a task of the
official tool that rsvelte does not have yet, add a `not_implemented`. Its units then stay in the
ratchet as `missing`.

Type-check tasks need native TypeScript 7.1 and the framework packages.
`NodePackages::locate()` finds them in `tools/oracle/node_modules`; install them with
`pnpm install --frozen-lockfile` at the repository root. `NodePackages::type_checker()` returns
that `tsc` with `--singleThreaded`, because the tests check more than one project at once. With
`FIXTURE_TYPE_CHECKER`, it returns that command instead. It prints the checker and its
version:

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

Lint, type checking and TypeScript projection read the compiler's hand-written inputs with
`Fixtures::inputs_from`, and keep their own snapshots of them. Type checking runs each project on
its own (`Fixtures::per_project`). A unit without an official output reports `UNMEASURED`, not a
match.
