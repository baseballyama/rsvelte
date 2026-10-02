# Crate fixture tests

Each crate keeps cases for its own tasks in `tests/fixtures/`. `rsvelte_fixture_test` runs them with
`cargo test`, writes rsvelte's output to each case's `actual/` (not in git), and compares it with
`expected/`. Compare the two directories to see a difference (`diff -ru <case>/expected <case>/actual`).

A case has one of two kinds of `expected/`:

| Kind | Where | `expected/` holds | A difference |
|---|---|---|---|
| hand-written | any directory without `source.json` above it (`rsvelte/` in the compile crate) | rsvelte's own output, accepted with `UPDATE_EXPECT=1` | fails the test |
| copied from the corpus | `tests/fixtures/<source>/`, which holds `source.json` | the official tool's output | is counted, not failed |

Snapshots show what changed. Only copied cases show what is correct. A snapshot registered with
`javascript_snapshot` compares its `.js` file with the official one as a syntax tree, with the
meaning of `tools/fixtures/src/canonical.ts` (layout, comments and literal spelling are ignored;
`@__PURE__` on calls is not). Other files are compared as bytes. `[[adjust]]` entries apply only to
the full check over [`fixtures/`](../../fixtures/README.md).

## A case

```
crates/languages/svelte/compile/tests/fixtures/
├── rsvelte/each-keyed/          a hand-written case; nested directories are allowed
│   ├── input.svelte             the input; exactly one `input.<ext>` per case
│   ├── expected/
│   │   ├── client.js            the `client` snapshot
│   │   ├── server.js            the `server` snapshot
│   │   └── client.diagnostics.txt   only when the task reports diagnostics
│   └── actual/                  the same names, written by every run
└── bits-ui/                     copied from the corpus by `fixtures crate`
    ├── source.json              repository, commit, license and oracle versions
    ├── licenses/
    └── src/lib/button.svelte/   one unit; the directory is the file's path in the repository
        ├── input.svelte
        └── expected/            client.js, server.js, client.css, client.diagnostics.txt, ...
```

- A hand-written document is named `<case>.<ext>` (here `rsvelte/each-keyed.svelte`). A copied
  document is named by its path in the repository (here `src/lib/button.svelte`), the file name
  the official tool was given. Component names and style hashes come from that name.
- A snapshot is `<name>.<file>`: `<name>` is set by the crate's test, `<file>` by the task's
  output (`js`, `css`, `lint.json`, ...).
- Diagnostics are one line each: `severity code line:column-line:column message`. Lines and
  columns count from 1, and columns are in UTF-16 code units. The official warnings and errors are
  written in the same format.
- Other files in the case are not read by the harness (for example `behaviour.toml`, read by the
  behaviour oracle's tests in `tools/fixtures`).

## Add a case

```sh
mkdir crates/languages/svelte/compile/tests/fixtures/rsvelte/my-case
$EDITOR crates/languages/svelte/compile/tests/fixtures/rsvelte/my-case/input.svelte
UPDATE_EXPECT=1 cargo test -p rsvelte_svelte_compile --test fixtures -- my-case
git diff -- crates/languages/svelte/compile/tests/fixtures   # read every snapshot you accept
```

## Copy the corpus into a crate

Run this again after the corpus changes (`fixtures import` or `regen`). It replaces each
`tests/fixtures/<source>/` and never touches hand-written cases.

```sh
F=tools/fixtures/bin/fixtures.ts
mise exec -- node $F crate --family svelte --task svelte.compile,svelte.compileModule \
  --to crates/languages/svelte/compile/tests/fixtures
```

## Run

```sh
cargo test -p rsvelte_svelte_compile --test fixtures                 # every case
cargo test -p rsvelte_svelte_compile --test fixtures -- bits-ui       # cases whose name contains `bits-ui`
cargo test -p rsvelte_svelte_compile --test fixtures -- --exact rsvelte/each-keyed
UPDATE_EXPECT=1 cargo test -p rsvelte_svelte_compile --test fixtures  # write changed snapshots, remove stale ones
```

The test fails when a hand-written snapshot differs, is missing, or is no longer produced, when a
task panics on any case, and when no case exists. For copied cases it prints how many match the
official output byte for byte, how many match it only as JavaScript syntax trees, how many differ,
how many have JavaScript that does not parse, and how many no task ran on (for example
`.svelte.ts` modules, which rsvelte does not compile yet).

## Add fixture tests to a crate

```toml
# Cargo.toml
[dev-dependencies]
rsvelte_fixture_test.workspace = true

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
    rsvelte_fixture_test::Fixtures::new(env!("CARGO_MANIFEST_DIR"), registry)
        .javascript_snapshot("svelte.compile/client", "client")
        .javascript_snapshot("svelte.compile/server", "server")
        .run()
}
```

Type-check tasks need TypeScript 7's native `tsc` and the framework packages.
`NodePackages::locate()` finds them in `tools/fixtures/node_modules`; install them with
`(cd tools/fixtures && pnpm install --frozen-lockfile)`.

## Where the cases are

| Crate | Tasks | Snapshot names |
|---|---|---|
| `languages/svelte/compile` | `svelte.compile/client`, `/server` | `client`, `server` |
| `languages/svelte/format` | `svelte.format/default` | `formatted` |
| `languages/svelte/lint` | `svelte.lint/default` | `findings` |
| `languages/svelte/check` | `svelte.check/default` | `findings` |
| `languages/svelte/compile_vue` | `vuelte.compile/client`, `/server` | `client`, `server` |
| `languages/vue/compile` | `vue.compile/default` | `compiled` |
| `languages/vue/format` | `vue.format/default` | `formatted` |
| `languages/vue/lint` | `vue.lint/default` | `findings` |
| `languages/vue/check` | `vue.check/default` | `findings` |
| `languages/vue/compile_svelte` | `svue.compile/client`, `/server` | `client`, `server` |
| `hosts/command_line` | `ts.check/default` (registered by the host) | `ts-check` |
