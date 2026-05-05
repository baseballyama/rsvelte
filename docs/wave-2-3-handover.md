# Wave 2 / Wave 3 — handover for the next contributor

This document captures the state of the ecosystem port at the end of the
2026-05-05 autonomous-loop session and what's left for the next worker.

> Read this **with** [`docs/ecosystem-implementation-plan.md`](./ecosystem-implementation-plan.md). The plan defines
> the architecture and acceptance criteria; this doc is a delta of "what's
> implemented vs. what's left".

## Current state at a glance

| Wave | Tool                          | Status | Where to start                   |
|------|-------------------------------|--------|----------------------------------|
| 1    | `svelte2tsx`                  | ✅ 245/245 (100%), in compat report | — |
| 2    | `svelte-check`                | 🟡 v0.4 usable | `src/svelte_check/` |
| 3    | `vite-plugin-svelte` NAPI shim | 🟡 v0.2 — NAPI primitives in place | `src/vps/`, `src/napi.rs` |
| 4    | `svelte-language-server`      | ⛔ Deferred upstream of tsgo `tsserver` | — |

`migrate` (Svelte 4→5) is intentionally out of scope.

The shipped totals:

- **Compatibility report:** 3341/3341 in-scope passing — every category at 100%.
- **`cargo test --release --test svelte2tsx_fixtures`** — 245/245.
- **`cargo test --release --lib svelte_check`** — 8/8 (walker, overlay,
  tsgo parser, filter logic).
- **`cargo test --release --lib vps`** — 8/8 (hmr_diff, resolve_id).

Verified against `cargo clippy --all-targets --all-features -- -D warnings`.

---

## Wave 2 — `svelte-check` (🟡 v0.4)

### What's in `main`

| Module                          | Responsibility |
|---------------------------------|----------------|
| `src/svelte_check/walker.rs`    | Find `.svelte` files (skip `node_modules`, hidden dirs, user `--ignore`). |
| `src/svelte_check/runner.rs`    | Orchestrate compile + overlay + tsgo + filters. |
| `src/svelte_check/diagnostic.rs`| Canonical `Diagnostic` shape. |
| `src/svelte_check/overlay.rs`   | `materialize_overlay()` — emit `.tsx` shadows + `.d.ts` shims + overlay `tsconfig.json` under `<workspace>/.svelte-check/`. |
| `src/svelte_check/tsgo.rs`      | Locate `tsgo` / `tsc`, spawn it, parse `file(L,C): error TSnnn: …` output. Graceful warning if no compiler is found. |
| `src/svelte_check/mapper.rs`    | Map tsgo diagnostics back to `.svelte` positions via the inline source map svelte2tsx wrote into each `.tsx`. |
| `src/svelte_check/writers.rs`   | `human` / `human-verbose` / `machine` / `machine-verbose` formatters. |
| `src/bin/svelte_check.rs`       | CLI entry point. |

CLI flags shipped:

- `--workspace <path>`
- `--output {human, human-verbose, machine, machine-verbose}`
- `--ignore <comma-list>`
- `--fail-on-warnings`
- `--emit-overlay`
- `--tsconfig <path>`
- `--tsgo`
- `--compiler-warnings <code:error|ignore,…>`
- `--diagnostic-sources <svelte|ts|css,…>`

### Wave 2 acceptance criteria — current scoring

| Criterion | Status | Notes |
|---|---|---|
| Rust `svelte-check` binary in `target/release/svelte_check` | ✅ | Build green. |
| Passes existing JS svelte-check fixture set (golden output comparisons) | ❌ | Not wired up — needs a fixture runner that reads `submodules/language-tools/packages/svelte-check/test/`. |
| ≥ 2× faster than JS svelte-check on a 1000-file project | ❌ | No benchmark yet. |
| CI-friendly: machine-readable JSON, GH Actions annotation, non-zero exit on errors | ✅ | `machine` / `machine-verbose` formats, exit codes, and `--output github-actions` (workflow-command annotations) all shipped. |

### What to ship next (in priority order)

1. ~~**GitHub Actions annotation output format**~~ — ✅ landed in PR #87.
   `--output github-actions` (alias `--output github`) emits
   `::error file=…,line=…,col=…::message` (and `::warning` / `::notice`)
   with proper `%25` / `%0A` / `%0D` escaping.

2. **Watch mode + incremental cache** (medium — 1–2 days).
   - The JS reference uses a manifest at `<cacheDir>/manifest.json` keyed by
     source-file `(mtime, size)` to skip unchanged `.svelte` files between
     runs. Port `loadManifest` / `pruneDeletedManifestEntries` /
     `getOutputPaths` from
     `submodules/language-tools/packages/svelte-check/src/incremental.ts:60..390`.
   - Add `--watch` and `--preserve-watch-output` flags. Use the `notify`
     crate for file-system events (watch the workspace + the overlay
     `.svelte-check` dir).
   - When tsgo is the configured backend, pass `--incremental` and let
     tsgo own its `tsbuildinfo.json`.

3. **Golden-output tests against the JS reference** (medium — 1 day).
   - JS test fixtures live under
     `submodules/language-tools/packages/svelte-check/test/`. Each fixture
     has an input project plus an expected JSON / human output snapshot.
   - Run our binary on each fixture, normalise paths
     (workspace-root-relative), and compare against the snapshot. Use
     `relaxed_compare` if absolute-path-noise is unavoidable.

4. **Performance benchmark** (small — 0.5 day).
   - Sample workload: SvelteKit demo app or a 1000-file synthetic project.
   - Compare wall-clock against `npx svelte-check`.

5. **Compile in parallel** (small — 0.5 day, depends on `rayon`).
   - Today `runner.rs::run` walks files sequentially. The compile step is
     pure CPU and trivially parallel; `files.par_iter().flat_map(…)`
     should give a near-linear speedup on multi-core. Already a transitive
     dep behind the `native` feature.

---

## Wave 3 — vite-plugin-svelte NAPI shim (🟡 v0.2)

### What's in `main`

| Item                 | Status | Notes |
|----------------------|--------|-------|
| `napi_compile`       | ✅      | Pre-existing. |
| `napi_compile_module`| ✅      | Pre-existing. |
| `napi_svelte2tsx`    | ✅      | Pre-existing. |
| `napi_hmr_diff`      | ✅ new  | `src/vps/hmr.rs` — lexical script-tag-body diff returning `unchanged` / `hot-update` / `full-reload`. |
| `napi_resolve_id`    | ✅ new  | `src/vps/resolver.rs` — relative-specifier resolution with implicit extensions and `dir/index.<ext>` lookup. |
| `napi_preprocess`    | 🟡 stub | Pass-through; doesn't run preprocessors. The JS shim should keep handling JS preprocessor callbacks until the bridge below lands. |

### Wave 3 acceptance criteria — current scoring

| Criterion | Status | Notes |
|---|---|---|
| `npm i @sveltejs/vite-plugin-svelte` transparently uses the Rust shim | ❌ | The JS shim isn't forked yet. |
| HMR latency drops by ≥ 30% on a SvelteKit demo | ❌ | No benchmark. |
| Clear opt-out (`experimental.napi = false`) | ❌ | JS shim work needed. |

### What to ship next (in priority order)

1. **Preprocessor `ThreadsafeFunction` bridge** (medium — 2–3 days).
   - Replace the `napi_preprocess` pass-through with a real binding that
     accepts an array of `{ markup?, script?, style? }` JS callbacks.
   - Each callback is wrapped in a `napi::threadsafe_function::ThreadsafeFunction<…>`
     and invoked via `tokio::task::spawn_blocking` from the Rust side
     (the runtime is already brought in by the existing async preprocess).
   - Map JS exceptions back to `napi::Error::from_reason(String)`.
   - JS-side input shape mirrors `svelte`: `{ markup, script, style }` of
     `(content: string, filename: string) => Promise<{ code, map?, dependencies? }>`.

2. **JS shim package fork** (medium — 2–3 days).
   - Create `packages/vite-plugin-svelte-rsvelte/` (new top-level package).
   - Mirror the structure of
     `submodules/vite-plugin-svelte/packages/vite-plugin-svelte/src/index.js`
     but route the hot paths through `require('@rsvelte/native')` (or the
     existing `package.json::main` entry).
   - Lifecycle hooks the shim must keep:
     - `configResolved`, `transform`, `handleHotUpdate`, `resolveId`.
   - Use `napi_compile` for `.svelte` transforms, `napi_hmr_diff` inside
     `handleHotUpdate`, and `napi_resolve_id` inside `resolveId`.

3. **E2E smoke test** (small — 1 day, depends on the shim above).
   - Wire the new package into one of the
     `submodules/vite-plugin-svelte/packages/e2e-tests/` fixtures and
     verify it boots, hot-updates a template-only change, and full-reloads
     a script change.

---

## Open PRs at the time of handover

| PR | Title | State | Action |
|----|-------|-------|--------|
| [#45](https://github.com/baseballyama/rsvelte/pull/45) | `chore: add Nix flake for reproducible dev environment` | OPEN, all CI failing | **Don't merge as-is.** The `flake.lock` was never generated, so every CI job fails at the dependency-resolution step. The first contributor with Nix on their machine should run `nix develop` locally to materialise `flake.lock`, commit it, push, and re-run CI. Only merge once CI is green. |

All Wave 1 / Wave 2 / Wave 3 work above is already on `main`. PRs #65–#85
are merged; nothing else is in flight from the autonomous loop.

---

## Useful one-liners

```bash
# Run the full ecosystem test suite
cargo test --release --test svelte2tsx_fixtures
cargo test --release --lib svelte_check
cargo test --release --lib vps
cargo test --release --test compatibility_report

# Build the svelte-check CLI
cargo build --release --bin svelte_check

# Smoke-test svelte-check against an arbitrary workspace
./target/release/svelte_check --workspace path/to/project

# Smoke-test svelte-check + tsgo (requires tsgo / tsc on PATH)
./target/release/svelte_check --workspace path/to/project --tsgo --tsconfig path/to/tsconfig.json

# Refresh the compatibility report and update docs
pnpm run test-and-update
```

## Working tips for the next contributor

- **Read the JS reference first.** Every Rust module under
  `src/svelte_check/` and `src/vps/` has a doc-comment pointing at the
  matching file in `submodules/language-tools/` or
  `submodules/vite-plugin-svelte/`. When you find a behavioural gap,
  start by re-reading those exact files.
- **Don't break the existing passing fixtures.** A regression in any of
  the four test runners listed above (`svelte2tsx_fixtures`, `svelte_check`
  lib tests, `vps` lib tests, `compatibility_report`) is a red flag —
  bisect before pushing.
- **The relaxed-comparison fallback chain in `tests/common/svelte2tsx.rs`
  is permissive on purpose**, but it's not magic. If a fixture only
  passes after `strip_all_whitespace` runs, that's a hint that real-output
  divergence is being hidden — record it in the next iteration's notes.
- **Submodules are reference repos.** Don't push commits into them. If
  you need to "fork" the JS shim, create a new top-level package in the
  rsvelte repo (e.g. `packages/vite-plugin-svelte-rsvelte/`) rather than
  modifying `submodules/vite-plugin-svelte/`.
