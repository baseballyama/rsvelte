# Svelte Ecosystem — Rust Port Implementation Plan

This document is the canonical implementation plan for porting Svelte
ecosystem tooling to Rust. It complements the rsvelte compiler port (which
already passes 3096/3096 official compatibility tests) and turns rsvelte
from "just a compiler" into a Rust-native replacement for the hot path of
every common Svelte workflow.

## Reference layout

All upstream reference code is consolidated under `submodules/`:

```
submodules/
├── svelte/                  # Svelte 5 compiler (already ported by rsvelte)
├── language-tools/          # svelte2tsx, svelte-language-server, svelte-check, typescript-plugin, svelte-vscode
├── vite-plugin-svelte/      # Vite integration
└── typescript-go/           # Microsoft's tsgo (TypeScript native port, our type-check backend)
```

When you read `submodules/<repo>/...` paths in this document, those are the
upstream sources you can grep / read while implementing the Rust side.
`git submodule update --init --recursive --depth 1 submodules/typescript-go`
keeps the tsgo clone shallow.

## Wave structure

The work is sequenced into four waves so each wave delivers user-visible value
on its own (no half-finished tools sitting in `main`).

| Wave | Tool | Status | Estimated effort |
|---|---|---|---|
| 1 | svelte2tsx (complete remaining 18.4%) | ✅ 245/245 (100%) | — |
| 2 | svelte-check (Rust + tsgo backend) | ✅ v1.0 (structured attribute bake) | — |
| 3 | vite-plugin-svelte (NAPI shim) | 🟢 v1.0 — NAPI primitives + forked JS shim + 15-assertion smoke suite | bench pending |
| 4 | svelte-language-server | ⛔ blocked on tsgo tsserver — CLI checking covered by Wave 2 | (deferred) |

Out of scope: SvelteKit, eslint-plugin-svelte (route to oxlint),
prettier-plugin-svelte (route to dprint/biome), svelte-preprocess (delegates
to other JS tools), mdsvex (markdown ecosystem dependencies).

---

## Wave 1 — Finish svelte2tsx

### Goal

`rsvelte::svelte2tsx::svelte2tsx(source, options) -> Output` produces TSX
output byte-identical (after `normalize`) to the JS svelte2tsx for every
official fixture in `submodules/language-tools/packages/svelte2tsx/test/svelte2tsx/samples/` (245 fixtures).

### Current state

- `src/svelte2tsx/` contains ~9K LoC of Rust port:
  - `magic_string.rs` — Rust `MagicString` clone with sourcemap
  - `script/mod.rs` — instance + module script processing
  - `template/mod.rs` — htmlx → JSX transform
  - `svelte2tsx.rs` — top-level orchestration
- NAPI binding `napi_svelte2tsx` already shipped (`src/napi.rs`).
- Test runner `tests/svelte2tsx_fixtures.rs` (`cargo test --no-default-features --test svelte2tsx_fixtures -- --nocapture`).
- **Pass rate: 200/245 (81.6%)** as of 2026-05-04.

### Categorisation of remaining 45 failures

Run the test once and group failures by failure mode (the runner already
prints the first differing line). Expected clusters:

1. **`<svelte:self>` recursion** (low: ~5 fixtures) — naming convention for
   the synthetic component constructor (see `language-tools/packages/svelte2tsx/src/svelte2tsx/createRenderFunction.ts` for the
   `$$_tnenopmoc_etlevs0` reversed-name trick).
2. **Slot let-forwarding** (medium: ~10 fixtures) — `{#snippet}` and slot
   `let:` destructuring patterns. The test diff in this conversation shows a
   missing `$$_svelteself0.$$slot_def.default` block; that's the JS shape
   we need to emit.
3. **Generic component parameters** (medium: ~10 fixtures) — `<Comp
   generic="T">{ ... }</Comp>`. Should already be parsed but the type-arg
   threading through `createRenderFunction` is incomplete.
4. **TypeScript-specific syntax** (medium: ~10 fixtures) — `satisfies`,
   `const` type parameters, type-only imports inside `<script>`, `lang="ts"`
   modules with re-exports.
5. **DTS emit edge cases** (low: ~5 fixtures, only `*-dts` samples) — JSDoc
   ↔ TS interface synthesis.
6. **Sourcemap-only diffs** (~5 fixtures) — output text matches but the
   sourcemap mappings drift. These are gated by separate fixture files
   (`expected_map.json`).

### Implementation steps

1. **Triage script** — add `cargo test --release --no-default-features --test svelte2tsx_fixtures -- --nocapture | scripts/group-svelte2tsx-failures.mjs`
   that reads the runner's `FAIL: …` lines and bucket-counts by name pattern. Lets us track wave progress objectively.
2. **Cluster 2 (slot let)** — port the `addComponentExport` + `createRenderFunction` slot-def emission from `submodules/language-tools/packages/svelte2tsx/src/svelte2tsx/createRenderFunction.ts:200..400`.
3. **Cluster 1 (`svelte:self`)** — implement the reversed-name pattern in `src/svelte2tsx/template/mod.rs` (search for the `$$_tnenopmoc_etlevs0` constant in the JS reference).
4. **Cluster 3 (generics)** — thread `generic` attr through to the synthesised `function render<T>(...)` signature in `script/mod.rs`.
5. **Cluster 4 (TS syntax)** — extend `processInstanceScriptContent.ts`-equivalent in Rust to recognise `satisfies` / `const T` / type-only imports. Most of this is OXC parser already supporting them; we just need to keep them through the rewrite.
6. **Cluster 5 (DTS)** — implement `emitDts` (`submodules/language-tools/packages/svelte2tsx/src/emitDts.ts`) in Rust. Needs `tsc --emitDeclarationOnly` capability — defer by shelling out to tsgo (see Wave 2).
7. **Cluster 6 (sourcemaps)** — fix in `src/svelte2tsx/magic_string.rs`. Tighten the sourcemap segment ordering to match `magic-string`'s exact output.

### Acceptance criteria

- [ ] `cargo test --release --no-default-features --test svelte2tsx_fixtures` reports `Pass rate: 100.0% (245/245)`.
- [ ] `napi_svelte2tsx` exposed via the existing NAPI bindings is unchanged in shape (so external consumers don't break).
- [ ] Wire `svelte2tsx` into the compatibility report (similar to `print` / `preprocess` waves) so the dashboard shows the new category at 245/245.

### Risk register

| Risk | Mitigation |
|---|---|
| TS-specific syntax keeps growing as upstream evolves | Pin svelte2tsx submodule to a tagged release; bump explicitly. |
| Sourcemap fixtures drift between magic-string versions | Adopt magic-string's encoder behaviour exactly; don't try to "improve" it. |

---

## Wave 2 — svelte-check (Rust + tsgo)

### Goal

`svelte-check` is a CLI that walks a Svelte project, reports compile-time errors (rsvelte) **and** TypeScript type errors (tsgo) in a single run, with diagnostics mapped back to `.svelte` source positions.

### Architecture

```
                 ┌───────────────┐
                 │  CLI args     │
                 └───────┬───────┘
                         │
          ┌──────────────▼──────────────┐
          │  Rust: project walker       │
          │  (find .svelte / .ts / .js) │
          └──────────────┬──────────────┘
                         │
   ┌────────────────────┼────────────────────────┐
   │                    │                        │
   ▼                    ▼                        ▼
┌──────────┐   ┌───────────────────┐   ┌─────────────────────┐
│ rsvelte  │   │ rsvelte           │   │ tsgo subprocess     │
│ compile  │   │ svelte2tsx        │   │  (--noEmit          │
│ -> ast   │   │ -> .tsx + sourcemap│  │   on overlay        │
│ + warns  │   │                   │   │   tsconfig)         │
└────┬─────┘   └────────┬──────────┘   └──────────┬──────────┘
     │                  │                         │
     │              .tsx files written            │
     │              to overlay dir                │
     │                                            │
     ▼                                            ▼
┌─────────────────────────────────────────────────────────┐
│ Rust diagnostic merger                                  │
│  - rsvelte warnings keep .svelte positions              │
│  - tsgo diagnostics: sourcemap-lookup back to .svelte   │
│  - dedup, severity sort, filter by config               │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │ writers (human/JSON)│
                └─────────────────────┘
```

### Component breakdown

| Module | Path | Responsibility | Reference |
|---|---|---|---|
| Project walker | `src/svelte_check/walker.rs` | Find files matching `**/*.{svelte,ts,js}` minus ignore list | `submodules/language-tools/packages/svelte-check/src/utils.ts` |
| Overlay dir manager | `src/svelte_check/overlay.rs` | Materialise generated `.tsx` shadow files in a temp dir; write overlay `tsconfig.json` | `submodules/language-tools/packages/svelte-check/src/incremental.ts::writeOverlayTsconfig` |
| tsgo runner | `src/svelte_check/tsgo.rs` | Spawn `tsgo --noEmit -p <overlay>`, parse JSON output, surface progress | `submodules/typescript-go/cmd/tsgo` (CLI flags), upstream JSON output format |
| Diagnostic mapper | `src/svelte_check/mapper.rs` | Use the sourcemap from svelte2tsx to translate `.tsx` line/col → `.svelte` line/col | `submodules/language-tools/packages/svelte-check/src/incremental.ts::mapCliDiagnosticsToLsp` |
| CLI orchestration | `src/bin/svelte_check.rs` | Argument parsing, watch mode, exit codes | `submodules/language-tools/packages/svelte-check/src/index.ts` |
| Writers | `src/svelte_check/writers.rs` | Human-friendly + machine (JSON / GitHub Actions) output | `submodules/language-tools/packages/svelte-check/src/writers.ts` |

### tsgo integration details

#### Discovery

- Resolve `tsgo` from (in order): `$TSGO_BIN` env var → `node_modules/.bin/tsgo` → `npx tsgo`.
- Print the resolved version on the first invocation so debug logs are unambiguous.

#### Invocation

```rust
let mut cmd = std::process::Command::new(tsgo_bin);
cmd.args([
    "--noEmit",
    "--pretty=false",
    "-p", overlay_tsconfig.to_str().unwrap(),
]);
// tsgo's --listFiles + --traceResolution help diagnose mis-resolution; gate behind --debug.
let output = cmd.output()?;
```

#### Output parsing

tsgo emits diagnostics in tsc-compatible textual form
(`file(line,col): error TS2304: Cannot find name 'foo'.`). We parse with a
small regex; when tsgo lands a structured JSON output flag (in flight
upstream), swap the parser without changing the rest of the pipeline.

#### Incremental mode

- On first run we generate `.tsx` shadows for every `.svelte` file.
- On subsequent runs (watch / `--watch`), we only regenerate for changed
  `.svelte` files and re-invoke tsgo with `--incremental` so its
  `tsbuildinfo` short-circuits unchanged files.
- We never embed tsgo's incremental state in our own state — let tsgo own
  it, we just trigger it.

### Sourcemap mapping

The svelte2tsx port already produces source maps via the Rust `MagicString`
in `src/svelte2tsx/magic_string.rs`. We need:

1. A `sourcemap::SourceMap` parser/lookup (use the `sourcemap` crate).
2. For each tsgo diagnostic at `(tsx_file, line, col)`:
   - Read the inline sourcemap embedded in the generated `.tsx`.
   - Look up the original `.svelte` position.
   - If the position falls in the ignored `/*Ωignore_startΩ*/.../*Ωignore_endΩ*/` region (svelte2tsx's existing sentinel), drop the diagnostic — it's noise from the synthesis layer.

### Acceptance criteria

- [ ] Rust `svelte-check` binary in `target/release/svelte-check`.
- [ ] Passes the existing `submodules/language-tools/packages/svelte-check/test/` fixture set (golden output comparisons).
- [ ] Performance: ≥ 2× faster than the JS svelte-check on a 1000-file project (the dominant cost is tsgo which is 10× faster than tsc; we expect rsvelte's portion to be near-free).
- [ ] CI-friendly: machine-readable JSON output, GitHub Actions annotation format, non-zero exit on errors.

---

## Wave 3 — vite-plugin-svelte (NAPI shim)

### Goal

`@sveltejs/vite-plugin-svelte` keeps its public Vite plugin API (the JS
shim users `import` from their `vite.config.js`), but every byte of
heavy lifting (compile, preprocess, HMR diff) happens in Rust via NAPI.

### Architecture

```
vite.config.js
   │ import { svelte } from '@sveltejs/vite-plugin-svelte'
   ▼
┌──────────────────────────────────────────────┐
│ JS shim (~500 LoC, kept in vite-plugin-svelte│
│ submodule fork)                              │
│  - Vite plugin lifecycle: configResolved,    │
│    transform, handleHotUpdate, …             │
│  - Loads native NAPI module                  │
│  - Routes calls into Rust                    │
└──────────────────────┬───────────────────────┘
                       │ NAPI
                       ▼
┌──────────────────────────────────────────────┐
│ rsvelte_vps (new crate inside this repo)     │
│  - compile()           -> existing napi_compile│
│  - compile_module()    -> existing napi_compile_module│
│  - preprocess()        -> new napi_preprocess │
│  - resolve_id()        -> Rust path resolver  │
│  - hot_update_diff()   -> Rust template diff  │
│  - stats()             -> Rust counters       │
└──────────────────────────────────────────────┘
```

### Component breakdown

| Module | Path | Responsibility | Reference |
|---|---|---|---|
| Compile dispatcher | re-uses `napi_compile` | Map Vite's `transform` hook input to rsvelte's `compile` | `submodules/vite-plugin-svelte/packages/vite-plugin-svelte/src/plugins/compile.js` |
| Preprocess dispatcher | new `napi_preprocess` | Run preprocessor pipeline (already implemented in `src/compiler/preprocess/`) | `submodules/vite-plugin-svelte/packages/vite-plugin-svelte/src/plugins/preprocess.js` |
| Path resolver | new `src/vps/resolver.rs` | Resolve `<script src="...">`, virtual modules, `.svelte` extensions | `submodules/vite-plugin-svelte/packages/vite-plugin-svelte/src/utils/id.js` |
| HMR diff | new `src/vps/hmr.rs` | Detect template-only vs script-also changes; produce a minimal patch payload Vite can ship to the browser | `submodules/vite-plugin-svelte/packages/vite-plugin-svelte/src/plugins/hot-update.js` |
| Stats counter | new `src/vps/stats.rs` | Wall-clock per phase, file count, cache hits | `submodules/vite-plugin-svelte/packages/vite-plugin-svelte/src/utils/vite-plugin-svelte-stats.js` |

### JS shim design

The shim is intentionally tiny. It exists because Vite plugins must be
JS modules with specific shape; we don't try to replace that.

```js
// submodules/vite-plugin-svelte/packages/vite-plugin-svelte/src/index.js
import { compile, preprocess, hotUpdateDiff } from '@rsvelte/vite-plugin-svelte-native';

export function svelte(options = {}) {
  // ... configure(), setupOptimizer(), … stay in JS
  return [
    {
      name: 'vite-plugin-svelte:compile',
      async transform(code, id) {
        if (!id.endsWith('.svelte')) return null;
        // 1 NAPI hop, no JS compiler.
        return compile(code, { filename: id, ...options.compilerOptions });
      },
    },
    // ...
  ];
}
```

### NAPI surface additions (from existing baseline)

| Function | Already exists | Notes |
|---|---|---|
| `napi_compile` | ✅ | No changes |
| `napi_compile_module` | ✅ | No changes |
| `napi_svelte2tsx` | ✅ | Unchanged |
| `napi_preprocess` | ❌ new | Async wrapper around `compiler::preprocess::preprocess` — needs a JS-callable preprocessor callback shape (or document that only Rust-native preprocessors are supported and JS preprocessors stay in JS) |
| `napi_hmr_diff` | ❌ new | Input: previous + current `.svelte` content. Output: `{ kind: 'hot-update' \| 'full-reload', payload: ... }` |
| `napi_resolve_id` | ❌ new | Input: importer + specifier. Output: resolved path or null |

### Tradeoffs

- **JS preprocessors**: end users define preprocessors as JS callbacks
  (`svelte.config.js`'s `preprocess: [...]`). We can't run those in Rust.
  Two options:
  1. Keep JS preprocessors running in JS (slow path), Rust preprocessors
     (none yet) running in Rust. The JS shim falls back to current behaviour
     when a JS preprocessor is configured.
  2. Document that users with custom preprocessors should set
     `experimental: { napi: false }` to opt out.
- **HMR fast path**: rsvelte already detects template-only changes during
  Phase 2 (no script edits → patch instead of reload). Surfacing this via
  NAPI is a small wrapper.

### Acceptance criteria

- [ ] `npm i @sveltejs/vite-plugin-svelte` in our submodule fork's branch
      transparently uses the Rust shim. Existing test suite in
      `submodules/vite-plugin-svelte/packages/e2e-tests/` passes.
- [ ] HMR latency on the Svelte playground app (a typical SvelteKit demo)
      drops by ≥ 30% (Vite's own overhead caps the upper bound).
- [ ] A clear opt-out (`experimental.napi = false`) for users who hit a
      preprocessor incompatibility.

### Risk register

| Risk | Mitigation |
|---|---|
| Vite plugin lifecycle subtleties (e.g. `enforce: 'pre'` ordering) break | E2E tests cover this; we run them on every PR. |
| User has JS preprocessors that depend on Node APIs we can't NAPI-bridge | Keep JS preprocessor path. The Rust path is opt-in for "pure compiler users". |
| NAPI call overhead exceeds the savings on tiny files | Batch `transform` calls if Vite invokes them in tight loops. |

---

## Wave 4 — svelte-language-server (deferred)

### Why deferred

LSP requires **<50 ms** response times for hover, completion, signature help.
A subprocess invocation of tsgo currently has ~100–300 ms minimum RTT, which
shows up as latency in the editor.

### CLI-side checking is already covered

The Wave 2 `svelte-check` CLI provides the *checking* half of the language
server today: `.svelte` + `.ts` diagnostics, watch mode, incremental cache,
GitHub Actions / machine output, exact column mapping via the structured
attribute bake. Users who only need "errors in CI / pre-commit" don't have
to wait for the LSP — `target/release/svelte_check` is the answer.

What the LSP would add (and what's still gated on `tsserver`): in-editor
hover, completion, signature help, find-references, rename, code actions.

### When to revisit

When tsgo ships a long-running language-services daemon (an analogue to
`tsserver`). Microsoft has indicated that's on the roadmap. Until then:

- Keep using the current Node `svelte-language-server` (it works).
- For pure checking, use `svelte-check` (this repo).
- Track the tsgo issue tracker for `tsserver` mode RFCs / releases.

### Pre-work we can do anyway

- Ship Wave 1–3 (svelte2tsx + svelte-check + vite-plugin-svelte). Each gives
  the LSP wave a building block.
- Stand up a **diagnostics-only LSP** as an early prototype (just
  `textDocument/publishDiagnostics` powered by `svelte-check` infrastructure)
  — useful even before completion / hover work.

---

## Out of scope (delegate, don't port)

| Tool | Why not | Where to contribute instead |
|---|---|---|
| eslint-plugin-svelte | ESLint itself is JS; oxlint is the Rust path forward | Add Svelte rules to oxlint upstream |
| prettier-plugin-svelte | Prettier itself is JS | dprint plugin or biome's Svelte formatter |
| svelte-preprocess | Wraps sass/postcss/ts (all JS-heavy) | Skip — wrapper, not core |
| mdsvex | Built on unified/remark | Skip — markdown ecosystem is JS |
| SvelteKit | Whole framework, deeply Vite/Rollup-coupled | Out of scope. Specific hot paths (e.g. SSR renderer) might be revisited individually later. |

---

## Cross-cutting infrastructure

These bits land in Wave 1 and are reused by every later wave.

### Sourcemap propagation

- `src/svelte2tsx/magic_string.rs` produces sourcemaps from the original
  `.svelte` to the generated `.tsx`.
- The `sourcemap` crate (already a transitive dep via OXC) is the canonical
  consumer. Use `sourcemap::SourceMap::from_reader(...)` for parsing and
  `original_location_for(line, col, Bias::LeastUpperBound)` for lookup.
- Standardise on a `SourcemapBackedDiagnostic` struct in
  `src/svelte_check/mapper.rs` so Wave 4 LSP can reuse the same code.

### NAPI binding strategy

- Single crate (`svelte-compiler-rust`) keeps exporting all NAPI functions
  rather than splitting per tool. Avoids double-loading the Rust runtime in
  consumer Node processes.
- Async APIs (`preprocess`, future `hot_update_diff`) use
  `napi::tokio::task::spawn_blocking` so the Node event loop stays
  responsive; the work itself is sync internally.

### Submodule update workflow

```bash
git submodule update --remote submodules/svelte
git submodule update --remote submodules/language-tools
git submodule update --remote submodules/vite-plugin-svelte
git submodule update --remote --depth 1 submodules/typescript-go
pnpm run generate-fixtures        # re-snapshot expected outputs
pnpm run compatibility-report     # re-confirm 100%
```

Bumps go in their own PR with a "submodule bump" label so behavioural
changes from upstream are reviewed independently of feature work.

### Documentation

Each tool's README in `submodules/<tool>/` is the source of truth for
public-facing API. Our Rust modules carry doc-comments that link back to
the corresponding upstream file (`Corresponds to <path>` convention,
already used throughout `src/compiler/phases/`).

---

## Tracking

Open tasks are filed in the GitHub Issues tracker with labels
`wave-1-svelte2tsx`, `wave-2-svelte-check`, `wave-3-vite-plugin-svelte`,
`wave-4-lsp`. The compatibility report (`pnpm run compatibility-report`)
remains the single source of truth for "is rsvelte compatible with the
upstream Svelte test suite"; once Wave 1 lands `svelte2tsx` will also be
in that report.
