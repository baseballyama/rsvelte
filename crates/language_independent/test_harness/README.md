# Crate fixture tests

`rsvelte_test_harness` runs a crate's tasks with `cargo test` over the cases in its
`tests/fixtures/` and compares rsvelte's output byte for byte with each case's `expected/`. It
writes the output to the case's `actual/`, which Git does not track, so
`diff -ru <case>/expected <case>/actual` shows the difference. The shared
[corpus](../../../corpus/README.md) has its own test, [`rsvelte_corpus`](../corpus/).

| Kind         | Where                                                              | `expected/` holds                                          |
| ------------ | ------------------------------------------------------------------ | ---------------------------------------------------------- |
| hand-written | the crate's `tests/fixtures/` (`rsvelte/` and others in `compile`) | rsvelte's own output, accepted with `UPDATE_EXPECT=1`      |
| copied       | below a directory of `tests/fixtures/` with `source.json`          | the official tool's output, which the harness never writes |

Snapshots show what changed, not what is correct; a copied case's official output shows that.
`differs.txt` next to `source.json` lists each copied case that rsvelte does not match yet
(one case path per line, sorted, `#` for comments). A listed case fails once it matches, and an
unlisted one fails while it differs.

## A case

```
crates/languages/svelte/compile/tests/fixtures/
└── rsvelte/each-keyed/          a case; nested directories are allowed
    ├── input.svelte             the input; exactly one `input.<ext>` per case
    ├── expected/
    │   ├── client.js            the `client` snapshot
    │   ├── server.js            the `server` snapshot
    │   └── client.diagnostics.txt   only when the task reports diagnostics
    └── actual/                  the same names, written by every run
```

- A hand-written document's name is `<case>.<ext>` (here `rsvelte/each-keyed.svelte`). A copied
  document's name is its path below the directory with `source.json`, the filename the official
  tool got. Component names and style hashes come from that name.
- A snapshot is `<name>.<file>`. The crate's test sets `<name>`, and the task's output sets
  `<file>`, such as `js` or `lint.json`. Its diagnostics are one line each:
  `severity code line:column-line:column message`. Lines and columns count from 1, and columns
  count UTF-16 code units.
- The harness does not read other files in the case.

## Add a case

```sh
mkdir crates/languages/svelte/compile/tests/fixtures/rsvelte/my-case
$EDITOR crates/languages/svelte/compile/tests/fixtures/rsvelte/my-case/input.svelte
UPDATE_EXPECT=1 cargo test -p rsvelte_svelte_compile --test fixtures -- my-case
git diff -- crates/languages/svelte/compile/tests/fixtures   # read every snapshot you accept
```

## Run

```sh
cargo test -p rsvelte_svelte_compile --test fixtures                 # every case
cargo test -p rsvelte_svelte_compile --test fixtures -- --exact rsvelte/each-keyed
UPDATE_EXPECT=1 cargo test -p rsvelte_svelte_compile --test fixtures  # write changed snapshots, remove stale ones
```

The test fails in these cases:

- A snapshot differs, is missing, or is no longer produced. `UPDATE_EXPECT=1` accepts this only
  for a hand-written case.
- A copied case in `differs.txt` matches, or `differs.txt` names no case.
- A task panics or does not run on a case.
- No case exists.

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

Type-check tasks need native TypeScript 7.1 and the framework packages.
`NodePackages::locate()` finds them in `tools/oracle/node_modules`; install them with
`pnpm install --frozen-lockfile` at the repository root. `NodePackages::type_checker()` returns
that `tsc` with `--singleThreaded`, because the tests check more than one project at once. With
`FIXTURE_TYPE_CHECKER`, it returns that command instead. It prints the checker and its
version:

```sh
FIXTURE_TYPE_CHECKER="tsrs --fast" cargo test -p rsvelte_svelte_check --test fixtures
```

## Where the cases are

| Crate                                    | Tasks                                       | Snapshot names     |
| ---------------------------------------- | ------------------------------------------- | ------------------ |
| `languages/svelte/compile`               | `svelte.compile/client`, `/server`          | `client`, `server` |
| `languages/svelte/format`                | `svelte.format/default`                     | `formatted`        |
| `languages/svelte/lint`                  | `svelte.lint/default`                       | `findings`         |
| `languages/svelte/check`                 | `svelte.check/default`                      | `findings`         |
| `languages/svelte/typescript_projection` | `svelte.typescript_projection/default`      | `projection`       |
| `languages/svelte/compile_vapor`         | `vuelte.compile/client`, `/server`          | `client`, `server` |
| `languages/vue/compile`                  | `vue.compile/default`                       | `compiled`         |
| `languages/vue/format`                   | `vue.format/default`                        | `formatted`        |
| `languages/vue/lint`                     | `vue.lint/default`                          | `findings`         |
| `languages/vue/check`                    | `vue.check/default`                         | `findings`         |
| `languages/vue/compile_svelte`           | `svue.compile/client`, `/server`            | `client`, `server` |
| `hosts/command_line`                     | `ts.check/default` (registered by the host) | `ts-check`         |

Lint, type checking and TypeScript projection read the compiler's inputs with
`Fixtures::inputs_from`, and keep their own snapshots of them. Type checking runs each project
(the cases with the same first directory) on its own with `Fixtures::per_project`, because
unrelated projects can declare conflicting global types. It runs them again with
`Fixtures::each_alone`, one case per batch, against the same snapshots.
