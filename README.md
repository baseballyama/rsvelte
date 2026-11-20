# rsvelte (experimental)

A native toolchain for Svelte 5 (and Vue), written in Rust: compile, lint, format
and type check. It reads each file once and keeps immutable trees and a database of facts derived
from them. A task computes only what it needs, one file per thread. The old port (revision
`202af6f2aa`, the last before this rewrite replaced `main`) is only a diff oracle and a
performance baseline.

![ESLint, then `rsvelte lint` with the same rules, on a large open-source Svelte project](.github/assets/lint.gif)

## Use

```sh
npx @rsvelte/cli lint
npx @rsvelte/cli format --check
npx @rsvelte/cli typecheck
```

[The package's README](tools/release/npm-readme.md) is the user guide.

rsvelte supports Svelte 5 components in runes mode only. It does not support Svelte 4 projects
or components in legacy mode, such as those that use `export let` or `$:`. On them, `typecheck`
gives wrong results. The compiler rejects legacy syntax, as the official compiler does with
`runes: true`, and refuses `<svelte:options runes={false} />` as unsupported. The user guide lists what each command does with
legacy components. For Svelte 4, use the official tools.

## Layout

| Directory                           | What it holds                                                                 |
| ----------------------------------- | ----------------------------------------------------------------------------- |
| [`crates/`](crates/README.md)       | The Rust toolchain                                                            |
| [`examples/`](examples/)            | Code the site's guides quote; it builds and is tested with the workspace      |
| [`corpus/`](corpus/README.md)       | Real files from open-source projects, and the official tools' output for them |
| [`tools/`](tools/README.md)         | TypeScript tools: the fixture runner, the performance gate, …                 |
| [`apps/site/`](apps/site/README.md) | The project site, built with SvelteKit                                        |

## How it works

- The **kernel** knows no language. It holds sources and spans, a database of derived
  artifacts (computed once per document and shared), and the scheduler that runs tasks.
- Next to it, the **plugin interface** is how a host installs a plugin. The lint runner and the
  document printer are parts that lint and format tasks may use; any other task needs neither.
- A language's **syntax** crate holds its trees and parser; its **semantic** crate analyses those
  trees. Each registers its work as artifacts.
- Each **tool** (compile, lint, format, check) is its own crate. It registers one task, which
  reads the artifacts it needs. Syntax and semantic never depend on a tool, so tools share one
  parse.
- A **host** (the `rsvelte` and `rsvelte-dev` command lines, the browser build) chooses which
  tools to register and runs them.

## Correctness and speed

The expected output for the files in `corpus/` comes from the official tools, such as `svelte`,
`prettier`, `eslint` and `svelte-check`. rsvelte must match it. The performance gate compares
allocation and instruction counts with `tools/performance/baseline.json`.

## Commands

```sh
cargo test                                        # Rust tests, the fixture tests included
mise run lint                                     # clippy and rustdoc, every lint denies
mise run fmt                                      # rustfmt on the pinned nightly
pnpm install && pnpm run check                    # TypeScript side: oxfmt, oxlint, knip, tsc, the English prose lint
node tools/oracle/oracle.ts run-all               # rsvelte's output for every corpus unit
cargo test -p rsvelte_command_line --test corpus  # compare it with the official tools' output
node tools/performance/performance.ts ratchet     # the performance gate
cargo run -p rsvelte_command_line --bin rsvelte-dev -- run App.svelte --task svelte.compile/client
```

`rust-toolchain.toml` and `mise.toml` pin the versions. Contributor rules are in
[AGENTS.md](AGENTS.md).
