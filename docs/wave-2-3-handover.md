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
| 2    | `svelte-check`                | 🟡 v0.8 — hires source maps + SvelteKit kit-file `addedCode` augmentation (`+page.ts`, hooks, params surface their type errors) | `src/svelte_check/` |
| 3    | `vite-plugin-svelte` NAPI shim | 🟡 v0.2 — NAPI primitives in place | `src/vps/`, `src/napi.rs` |
| 4    | `svelte-language-server`      | ⛔ Deferred upstream of tsgo `tsserver` | — |

`migrate` (Svelte 4→5) is intentionally out of scope.

The shipped totals:

- **Compatibility report:** 3341/3341 in-scope passing — every category at 100%.
- **`cargo test --release --test svelte2tsx_fixtures`** — 245/245.
- **`cargo test --release --lib svelte_check`** — 19/19 (walker, overlay
  emit + incremental cache + prune, manifest round-trip + version
  guard + prune, tsgo parser, watch path filter, filter logic).
- **`cargo test --release --test svelte_check_golden`** — 3/3
  (Svelte-side clean assertions on the upstream `test-success` /
  `test-error` fixtures; full TS-error assertion gated on a TS
  toolchain being available).
- **`cargo test --release --lib vps`** — 8/8 (hmr_diff, resolve_id).

Verified against `cargo clippy --all-targets --all-features -- -D warnings`.

---

## Wave 2 — `svelte-check` (🟡 v0.8)

### What's in `main`

| Module                          | Responsibility |
|---------------------------------|----------------|
| `src/svelte_check/walker.rs`    | Find `.svelte` files (skip `node_modules`, hidden dirs, user `--ignore`). |
| `src/svelte_check/runner.rs`    | Orchestrate compile (parallelised via rayon) + overlay + tsgo + filters. |
| `src/svelte_check/diagnostic.rs`| Canonical `Diagnostic` shape. |
| `src/svelte_check/overlay.rs`   | `materialize_overlay_with()` — emit `.tsx` shadows + `.d.ts` shims + overlay `tsconfig.json` under `<workspace>/.svelte-check/`. Honours the manifest cache when `incremental=true`. |
| `src/svelte_check/manifest.rs`  | Persistent `<cacheDir>/manifest.json` with `(mtime_ms, size)` keying for the incremental cache. |
| `src/svelte_check/tsgo.rs`      | Locate `tsgo` / `tsc`, spawn it, parse `file(L,C): error TSnnn: …` output. Graceful warning if no compiler is found. |
| `src/svelte_check/mapper.rs`    | Map tsgo diagnostics back to `.svelte` positions via the source map svelte2tsx wrote into each `.tsx`. Kit-file diagnostics are reverse-mapped through the `AddedCode` table to the original `.ts` position. |
| `src/svelte_check/kit_file.rs`  | SvelteKit kit-file detection (`+page.ts`, hooks, params) + `addedCode` type-stub injection via oxc parsing. Mirrors `submodules/language-tools/packages/svelte2tsx/src/helpers/sveltekit.ts`. TS path only — JSDoc emission for `.js` kit files is a follow-up. |
| `src/svelte_check/watch.rs`     | `--watch` loop on top of the `notify` crate. Filters to `.svelte` / `.ts` / `.js` / `tsconfig.json` etc, debounces 250ms, skips events under the cache dir. |
| `src/svelte_check/writers.rs`   | `human` / `human-verbose` / `machine` / `machine-verbose` / `github-actions` formatters. |
| `src/bin/svelte_check.rs`       | CLI entry point. |

CLI flags shipped:

- `--workspace <path>`
- `--output {human, human-verbose, machine, machine-verbose, github-actions}`
- `--ignore <comma-list>`
- `--fail-on-warnings`
- `--emit-overlay`
- `--tsconfig <path>`
- `--tsgo`
- `--compiler-warnings <code:error|ignore,…>`
- `--diagnostic-sources <svelte|ts|css,…>`
- `--incremental`
- `--watch`
- `--preserve-watch-output`

### Wave 2 acceptance criteria — current scoring

| Criterion | Status | Notes |
|---|---|---|
| Rust `svelte-check` binary in `target/release/svelte_check` | ✅ | Build green. |
| Passes existing JS svelte-check fixture set (golden output comparisons) | 🟡 | `tests/svelte_check_golden.rs` runs against the upstream `test-success` / `test-error` fixtures. Svelte-side assertions always run; the TS path additionally asserts (a) every expected TS error code is produced, (b) no leakage of `.tsx`/overlay paths, and (c) per-file presence of every expected diagnostic. Exact line/column tightening still deferred — see "Still open". |
| ≥ 2× faster than JS svelte-check on a 1000-file project | 🟡 | `scripts/benchmark-svelte-check.mjs` measures rsvelte standalone (cold parse, cold overlay, warm incremental). Pass `--js` to compare against `npx svelte-check`. Local sample: warm `--incremental --emit-overlay` is ~5x faster than a cold overlay emit on a 500-file fixture. JS comparison needs a clean machine. |
| CI-friendly: machine-readable JSON, GH Actions annotation, non-zero exit on errors | ✅ | `machine` / `machine-verbose` formats, exit codes, and `--output github-actions` (workflow-command annotations) all shipped. |
| Incremental rebuilds via on-disk cache | ✅ | `--incremental` reads/writes `<workspace>/.svelte-check/manifest.json`, keyed on `(mtime_ms, size)`. Stale `.tsx` / `.d.ts` shadows are pruned on each pass. |
| Watch mode | ✅ | `--watch` (+ optional `--preserve-watch-output`) wraps `notify` recursive watchers, filtered to `.svelte` / `.ts` / `.js` / `.tsx` / `.jsx` / `.mts` / `.cts` plus `tsconfig.json` / `svelte.config.{js,ts}`. 250ms debounce. |
| Compile step parallelised | ✅ | `runner.rs::compile_files` fans out across rayon's global pool when the `native` feature is on. |

### What to ship next (in priority order)

1. ~~**GitHub Actions annotation output format**~~ — ✅ landed in PR #87.
2. ~~**Watch mode + incremental cache**~~ — ✅ landed (`manifest.rs`,
   `watch.rs`, `--incremental` / `--watch` / `--preserve-watch-output`).
3. ~~**Compile in parallel**~~ — ✅ landed (`runner.rs::compile_files`
   fans out across rayon's global pool).
4. ~~**Golden-output tests against the JS reference**~~ — ✅ landed
   (`tests/svelte_check_golden.rs`). The exact TS-error set is still
   gated on a TS toolchain being installed and on the `svelte2tsx`
   shim issue below.
5. ~~**Performance benchmark**~~ — ✅ landed
   (`scripts/benchmark-svelte-check.mjs`). The acceptance number
   (≥ 2× JS svelte-check on 1000 files) still needs to be measured on
   a clean reference machine.

#### Still open

- **Per-character source-map segments inside edited chunks**
  (medium — 1-2 days). Unedited chunks now emit per-character
  segments (`magic_string.rs::generate_mappings`), so script-region
  diagnostics resolve to exact line/column. Edited chunks still emit
  a single anchor at `chunk.start`, which means diagnostics on
  template wrappers (e.g. `<Component a={1} />` rewritten into a
  helper call) fall back to the wrapper's source-start position
  rather than the specific attribute/expression. Closing this would
  require the template emitter to use `append_left`/`append_right`
  around unchanged source text instead of wholesale `overwrite()`
  calls — a deeper svelte2tsx refactor.

- ~~**SvelteKit "kit file" type augmentation**~~ — ✅ landed in
  `src/svelte_check/kit_file.rs`. Route files (`+page.ts`,
  `+layout.ts`, `+server.ts`), hooks, and params files now get
  module-level type stubs injected via `addedCode` before tsgo / tsc
  sees them. The golden test no longer skips `+*` kit files.
  Open follow-ups: JSDoc augmentation for `.js` kit files (JS path
  parses with oxc but emission needs the `addJsDoc*` shape ported from
  the JS reference); reading user `svelte.config.js` `kit.files`
  overrides (currently we use the defaults from `defaultKitFilesSettings`).

- **Per-file diagnostic warning cache** (small — 0.5 day).
  `manifest.rs` currently caches `(mtime, size, paths)` only. The JS
  reference also caches Svelte compiler warnings + CSS diagnostics
  per file so an incremental run can replay the diagnostic stream
  without re-invoking the compiler. Add a `compiler_warnings`
  field to `ManifestEntry` (need to drop the `&'static str` source on
  `Diagnostic` in favour of a small enum or `Cow` so it round-trips
  through serde).

- **Forward user-listed `.ts` entries / `include` patterns into the
  overlay tsconfig** (small — 0.5 day). We currently set `files: []`
  in the overlay to drop inherited `.svelte` entries; the cleaner
  fix mirrors `buildOverlayTsconfig` in the JS reference — keep
  non-`.svelte` `files` entries verbatim and rebase user
  `include` / `exclude` onto the overlay dir.

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
