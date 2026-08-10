# Benchmark corpus

A **pinned, in-repo** set of representative Svelte sources used by the Rust
micro-benchmarks for parsing, compilation, Svelte projection, low-level and
public-session formatting, and linting. All benchmark crates load the corpus
through `benches/common/corpus.rs`, so file selection and stable IDs cannot
drift between product surfaces.

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
CodSpeed history. Editing an existing one changes what that benchmark measures
(which is fine, but expect a one-time step in the trend).

Adding a new file is free for the **per-file** benchmark IDs, but not for
`parallel_parse::corpus`, which parses the whole corpus in one iteration. Its
cost is proportional to the corpus, so adding a fixture raises it by
construction and CodSpeed reports it as a regression. That alert has to be
acknowledged once, in the PR that adds the file — it is a workload change, not
a slowdown.

The low-level formatter benchmark and `FormatSession` benchmark are deliberate
siblings: the former isolates formatter internals, while the latter covers the
config-derived option and extension-dispatch path used by embedders. Lint runs
the recommended production rules per component and has a separate stable
Svelte-module case. Compiler end-to-end coverage includes CSR, SSR, and dev CSR;
phase benchmarks exclude setup from the measured phase.

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
| `09-typescript-generics.svelte` | runes + TS | generic `$props`, typed snippets/callbacks, type assertions |
| `10-legacy-typescript-props.svelte` | legacy + TS | `export let` with type annotations, `$:` chains, `$store` reads, typed `createEventDispatcher` |
| `11-store-heavy-legacy.svelte` | legacy + TS | `$store` autosubscription throughout script *and* markup, `$store` assignment, `getContext` stores, `$:` over store reads |

Synthetic *scale* inputs (large, deterministic, generated in-code) live in the
bench files themselves, not here — they're pure functions, so they're stable
without needing to commit a huge file.

## Distribution, not just coverage

Fixtures 01–09 were picked to *cover features* — one distinct compiler slice
each. That makes them a poor proxy for the *mix* of shipped Svelte code, and
the benchmarks aggregate over them, so the mix is what the numbers report.
Measured over 3,509 `.svelte` files from four shipped projects (huly/plugins,
open-webui, carbon-components-svelte, SMUI):

| axis | shipped | fixtures 01–09 |
|------|---------|----------------|
| uses `$state` / `$derived` | 8.0% | 88.9% |
| uses `$:` | 0–60% by project | 11% |
| uses `export let` | 0–90% by project | 11% |
| `lang="ts"` | 0–99% by project | 11% |
| p90 source size | 4.9–15.7 KB | 2.6 KB |

An optimization that only pays off on legacy, TypeScript, or store-heavy
components — which is most of the shipped population — reads as 0% here.
Fixtures 10–11 exist to close that gap; keep the distribution in mind when
adding more.
