# rsvelte (experimental)

A native toolchain for Svelte 5 (and Vue), written from scratch in Rust: compile, lint, format
and type check. It reads each file once, keeps immutable trees and a database of facts derived
from them, and computes only what a task needs, one file per thread. The old port on `main` is
only a diff oracle and a performance baseline.

## Layout

| Directory                           | What it holds                                                                 |
| ----------------------------------- | ----------------------------------------------------------------------------- |
| [`crates/`](crates/README.md)       | The Rust toolchain                                                            |
| [`fixtures/`](fixtures/README.md)   | Real files from open-source projects, and the official tools' output for them |
| [`tools/`](tools/README.md)         | TypeScript tools: the fixture runner, the performance gate, …                 |
| [`apps/site/`](apps/site/README.md) | The website, built with SvelteKit                                             |

## How it works

- The **kernel** knows no language. It holds sources and spans, a database of derived
  artifacts (computed once per document and shared), and the scheduler that runs tasks.
- A language's **core** crate parses and analyses, and registers that work as artifacts.
- Each **tool** (compile, lint, format, check) is its own crate. It registers one task, which
  reads the artifacts it needs. Core never depends on a tool, so tools share one parse.
- A **host** (the `rsvelte` command line, the browser build) chooses which tools to register
  and runs them.

## Correctness and speed

Expected output comes from the official tools (`svelte`, `prettier`, `eslint`, `svelte-check`,
…), run over the files in `fixtures/`; rsvelte must match it. Performance is gated by allocation
and instruction counts in `tools/performance/baseline.json`.

## Commands

```sh
cargo test                                      # Rust tests, the fixture tests included
mise run lint                                   # clippy and rustdoc, every lint denies
mise run fmt                                    # rustfmt on the pinned nightly
pnpm install && pnpm run check                  # TypeScript side: oxfmt, oxlint, knip, tsc
node tools/fixtures/fixtures.ts run-all         # rsvelte's output for every fixture unit
node tools/fixtures/fixtures.ts check           # ... compared with the official tools' output
node tools/performance/performance.ts ratchet   # the performance gate
cargo run -p rsvelte_command_line -- run App.svelte --task svelte.compile/client
```

Versions are pinned in `rust-toolchain.toml` and `mise.toml`. Contributor rules are in
[AGENTS.md](AGENTS.md).
