# Benchmark corpus

A **pinned, in-repo** set of representative Svelte sources used by the Rust
micro-benchmarks (`crates/rsvelte_core/benches/{parser,compiler}.rs` and
`crates/rsvelte_formatter/benches/formatter.rs`).

## Why this exists

CodSpeed (and Criterion baseline diffing) only produce a meaningful
regression signal when the **workload is identical** between the base commit
and the PR. The benches used to read `.svelte` files out of the
`submodules/svelte` test tree at runtime and pick "smallest / medium /
largest" by size. That made the inputs drift:

- the `svelte` submodule is bumped continuously (`auto-update-svelte`), so the
  chosen files — and the benchmark IDs, which embed the filename — changed,
  and CodSpeed lost the per-benchmark history;
- base and PR branches could pin different submodule SHAs, so CodSpeed was
  comparing two *different* workloads.

These fixtures are committed directly to the repo, so the workload is stable
across submodule bumps and identical on every branch. **Treat each file as an
append-only, stable benchmark identity** — the benchmark IDs are derived from
the filenames (without the `.svelte` extension), so renaming a file resets its
CodSpeed history. Adding a new file is free; editing an existing one changes
what that benchmark measures (which is fine, but expect a one-time step in the
trend).

## What's here

Each fixture is a realistic, self-contained component chosen to exercise a
distinct slice of the compiler's hot paths. Ordered by the leading numeric
prefix so iteration order is deterministic.

| File | Mode | Exercises |
|------|------|-----------|
| `01-runes-counter.svelte`   | runes  | `$state` / `$derived` / `$effect`, basic event handlers — small baseline |
| `02-todo-app.svelte`        | runes  | keyed `{#each}`, `bind:`, derived filtering, array mutation |
| `03-data-table.svelte`      | runes  | markup-heavy table, derived sort, `{#each}`, scoped CSS |
| `04-form-bindings.svelte`   | runes  | two-way `bind:value`/`bind:checked`/`bind:group`, validation deriveds |
| `05-legacy-reactive.svelte` | legacy | `export let` props, `$:` reactive statements, `$store` autosubscription |
| `06-css-heavy.svelte`       | runes  | nested + `:global` CSS, keyframes, `class:`/`style:` directives |
| `07-snippets.svelte`        | runes  | `{#snippet}` / `{@render}`, `{@const}`, snippet props |
| `08-control-flow.svelte`    | runes  | `{#if}`/`{#each}`/`{#await}`/`{#key}` mix, `{@html}` |

Synthetic *scale* inputs (large, deterministic, generated in-code) live in the
bench files themselves, not here — they're pure functions, so they're stable
without needing to commit a huge file.
