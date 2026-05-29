# AGENTS.md

Guidelines for AI agents working on this project. `CLAUDE.md` is a symlink to this file.

## Project Goals

This project aims to create a complete port of the official Svelte compiler in Rust.

1. **100% Test Compatibility** - Pass all tests from `svelte/compiler` test suite
2. **100x Performance** - Achieve 100x speed using Rust optimizations and parallelism
3. **Drop-in Replacement** - Provide N-API bindings compatible with existing tools (Vite, etc.)
4. **OXC Integration** - Design for integration into [oxc](https://oxc.rs/) ecosystem

## Architecture

Directory structure mirrors the official Svelte compiler at `submodules/svelte/packages/svelte/src/compiler/`.

```
src/compiler/phases/
├── 1_parse/     # Parsing (Svelte syntax → AST)
├── 2_analyze/   # Analysis (scope tree, bindings)
└── 3_transform/ # Code generation (AST → JS/CSS)
```

Upstream reference repos live under `submodules/`:

```
submodules/
├── svelte/                  # Svelte 5 compiler (mirror target)
├── language-tools/          # svelte2tsx, language-server, svelte-check, typescript-plugin, svelte-vscode
├── vite-plugin-svelte/      # Vite integration
└── typescript-go/           # tsgo — type-check backend for Wave 2 svelte-check
```

See `docs/ecosystem-implementation-plan.md` for the multi-wave plan to port
the Svelte ecosystem (svelte2tsx, svelte-check, vite-plugin-svelte) on top
of the rsvelte compiler.

**Key Design Decisions:**

- Memory-efficient layout (u32 positions, compact_str)
- Thread-safe parser with rayon parallelism
- Direct AST passing (no re-parsing between phases)
- No backward compatibility for internal APIs (refactor freely)

## Implementation Principles

**CRITICAL**: All implementations must follow the official Svelte compiler implementation.

1. **Reference Implementation** - Always check `submodules/svelte/packages/svelte/src/compiler/` before implementing
2. **Structural Consistency** - Mirror directory structure, module organization, and naming
3. **Exact Output** - Output must match the official compiler exactly (verified by tests)
4. **Test-Driven** - Verify all changes against the official Svelte test suite

When implementing, reference the corresponding file in `submodules/svelte/packages/svelte/src/compiler/` and use the same algorithms and logic.

## Development Workflow

### Setup

```bash
git submodule update --init --recursive
git config core.hooksPath .githooks
pnpm install
pnpm run generate-fixtures  # Required before running tests
```

### Build & Test

```bash
cargo build                                          # Build
cargo test                                           # Run all tests
cargo test --release                                 # Release mode (recommended for full runs)
cargo test --test parser_fixtures -- --nocapture     # Run a single suite
pnpm run compatibility-report                        # Generate compatibility report JSON
pnpm run test-and-update                             # Refresh report + docs
```

Pre-commit hooks run `cargo fmt` and `cargo clippy` automatically (`.githooks/pre-commit`).

### Docker (optional)

A `Dockerfile` and `docker-compose.yml` are provided for a reproducible toolchain (Rust nightly + Node 22 + pnpm). There is no `docker-dev.sh` wrapper — invoke Compose directly:

```bash
docker compose up -d            # Start dev container
docker compose exec dev bash    # Open a shell inside it
docker compose exec dev cargo test
```

VS Code Dev Containers ("Reopen in Container") also works.

### Working with Subagents

Use the `Agent` tool for substantial work — feature implementation, multi-file refactors, broad code exploration, or anything likely to consume meaningful context.

- `Explore` — codebase exploration and search across many files
- `Plan` — design implementation strategy before non-trivial work
- `general-purpose` — multi-step implementation and research
- For trivial single-file edits, work directly without spawning a subagent.

### Commit Guidelines

- Commit frequently after each logical change
- Run `cargo fmt && cargo clippy --all-targets --all-features -- -D warnings` before committing
- Push immediately after committing
- Use atomic commits (one logical change per commit)

### Maintaining This File

- Document new knowledge and patterns discovered during development
- Update test status and feature lists as work progresses
- Remove outdated information
- Keep it concise

## Test Status

Source: `pnpm run compatibility-report` (generated 2026-05-28, Svelte commit `b65a3f3fc5e1`). Re-run `pnpm run test-and-update` to refresh. Skip lists live in `tests/compatibility_report.rs` and `tests/runtime.rs`; `tests/audit_skipped.rs` re-checks every skipped fixture after a Svelte bump. See [docs/skip-remaining-clusters.md](docs/skip-remaining-clusters.md) for a per-cluster breakdown of remaining skips with upstream commits, root causes, and a porting plan.

| Suite | Pass/Total | Notes |
|-------|------------|-------|
| Parser Modern | 24/24 | |
| Parser Legacy | 82/83 | 1 skipped (`javascript-comments` — OXC drops standalone comments that acorn surfaces) |
| Compiler Errors | 144/144 | |
| Compiler Snapshot | 28/29 | 1 skipped (`async-in-derived` — nested `$derived(await ...)` plus per-block `@const` grouping; runtime-side derived grouping pass tracked separately). `async-const` unblocked by the 5.55.3 `@const` blocker port. |
| CSS | 181/181 | Deep descendant-chain pruning + `:where(...)` inner scoping ported (Svelte 5.53.7 `0965028d3`). |
| Validator | 324/325 | 1 skipped (`error-mode-warn` — opted out via `_config.js`) |
| SSR | 97/97 | HtmlTag SSR class-hash inlining + synthetic `<option value>` ported (Svelte 5.53.6, 5.55.9). |
| Hydration | 79/79 | All executed fixtures pass — `boundary-pending-attribute` unblocked by the 5.55.3 `@const` blocker port (expression-bodied assignment thunks). |
| Runtime Legacy | 1205/1205 | All executed fixtures pass — `flush-sync-each-block` unblocked by ASI-aware side-effect import detection (Svelte 5.55.2). |
| Runtime Runes | 964/979 | 15 skipped — async-blocker / `@const` clusters (Svelte 5.54.1–5.55.9). HtmlTag `is_controlled` + derived-update-server + derived-dep-set-while-rendering + derived-name-shadowed + set-text-stable-coercion + attribute-parts + async-derived-title-update + async-inspect-build + sync-statement grouping + per-const-tag `@const` blocker (Svelte 5.55.3) + `async-eager-derived` (Svelte 5.53.x) + `{#await await ...}` async-batching (Svelte 5.55.9) + SSR `$.save` parent-walk predicate + transitive `touch`-through-`binding.assignments` for chained `$derived(await ...)` (Svelte 5.55.1 `async-overlap-multiple-5..7`) ported. |
| Runtime Browser | 32/32 | |
| Print | 41/42 | 1 skipped (`css-keyframes-percent` — upstream fixture inconsistency, see docs) |
| Preprocess | 19/19 | Each fixture's `_config.js` JS preprocessor hand-ported in `tests/common/preprocess_fixtures.rs` |
| Sourcemaps | 0/0 | No fixtures yet |
| svelte2tsx | 247/247 | Wave 1 of the ecosystem port — error fixtures now compared via `expected.error.json` start/end offsets. Driven by `tests/common/svelte2tsx.rs`. |
| Migrate | 0/76 | **Out of scope** — rsvelte is a Svelte 5 compiler port, not a Svelte 4 → 5 migration tool |

**Compatibility report total: 3467/3467 in-scope-run passing — every executed fixture in every in-scope category passes. 19 in-scope fixtures remain skipped (see [docs/skip-remaining-clusters.md](docs/skip-remaining-clusters.md)); the 76 `migrate` fixtures are intentionally out of scope.**

### Ports landed for skip-reduction (Svelte 5.53.0+)

- **HtmlTag `is_controlled`** (Svelte 5.53.8 `0206a2019`) — fragment / html_tag visitor branches in `src/compiler/phases/3_transform/client/visitors/{html_tag.rs,shared/fragment.rs}`. Unblocked 11 fixtures across runtime-runes, runtime-legacy, hydration.
- **`$.update_derived` helpers on derived `++` / `--`** (Svelte 5.53.2 `6aa7b9c64`) — `transform_script.rs::rewrite_derived_update_expressions` rewrites `count()++`/`++count()` shape into `$.update_derived(count)` / `$.update_derived_pre(count)` after the bare-read wrap pass. Unblocked `derived-update-server`.
- **`<option>` synthetic-value via `transform_store_refs`** (Svelte 5.53.6 `e3d277b00`) — `select_element.rs` now routes the synthetic value expression through `transform_store_refs` so `$label` becomes `$.store_get(...)`. Unblocked `select-option-store-implicit-value`.
- **Bare-derived `$derived(visible)` collapse** (Svelte 5.55.5 `b771df3`) — `transform_script.rs::unthunk_bare_derived_arg` rewrites `$.derived(() => visible())` back to `$.derived(visible)` when the inner is a known derived. Unblocked `derived-dep-set-while-rendering`.
- **SSR attribute `$.stringify` elide** (Svelte 5.55.9 `a5df6616e`, partial) — `eval_attr_expr_json` handles `ConditionalExpression` and string-concat `BinaryExpression`. Class, style-directive, and class-attribute (no-directive) emission paths route through it; the no-class-directive path also falls back to a static `class="..."` attribute when every interpolation inlines. Unblocked `attribute-dynamic-multiple`, `globals-not-overwritten-by-bindings`, `attribute-parts`, `head-raw-elements-content`, `innerhtml-interpolated-literal`. Multi-line `let` extraction remains pending.
- **ASI-aware side-effect import detection** (Svelte 5.55.2 cluster) — `extract_imports` in `src/compiler/phases/3_transform/{client/mod.rs,server/helpers.rs}` now recognises `import "module"` / `import 'module'` (no `from`, no `;`) as a complete one-line side-effect import via `is_complete_side_effect_import`. Previously the line-by-line splitter only treated an import as complete when it contained `;` or matched `... from "…"`, so the side-effect form merged into the next statement (e.g. `let count = 1;`), breaking legacy `$.mutable_source` lowering. Unblocked `flush-sync-each-block`.
- **Comments in element openers and `Root.comments`** (Svelte 5.53.0 `92e2fc120`) — `parse_attribute` in `1_parse/state/element.rs` consumes `// …` / `/* … */` between attributes and pushes a `JsComment` onto `Root.comments`. The JS parser pipeline (`parse_expression` / `parse_program`) also forwards every OXC-discovered comment via a per-thread sink. Legacy AST surfaces the same data as `_comments`. Unblocked `parser-modern/comment-in-tag`, `parser-modern/parens`, `parser-legacy/script-comment-only`.
- **CSS prune-edge-cases / `:where()` composition** (Svelte 5.53.7 `0965028d3`) — `is_descendant_selector_unused` walks chains of arbitrary depth (was 2-link only), so `main > article > div > section > span` is now pruned as unused when the DOM doesn't satisfy the chain. `format_simple_selector_with_scope` and the relative-selector loop now also treat standalone `:where(...)` like `:is(...)`, recursing into the inner SelectorList so `ul :where(li)` emits `ul.svelte-xxx :where(li:where(.svelte-xxx))` instead of `:where(.svelte-xxx):where(li)`. Unblocked `css/css-prune-edge-cases`.
- **Head-effect blocker threading** (Svelte 5.53.0 `582e4443d`) — `client/visitors/title_element.rs` now scans the title value + memo expressions against `state.blocker_map` and emits a `[$$promises[N], ...]` blockers array as the 4th arg of `$.deferred_template_effect(...)`. `server/build.rs::apply_async_wrapping` now recurses into `SvelteHead` / `TitleElement` bodies so reactive expressions inside `<svelte:head><title>` get wrapped in `$$renderer.async([$$promises[N]], ...)`. Unblocked `async-derived-title-update`.
- **`$inspect` empty-statement thunk after top-level `await`** (Svelte 5.53.13 `b472171de`) — `async_body.rs::build_thunk` now emits `() => void 0` for `Hole(...)` entries (previously a sparse-array elision `,,`) and the array writer treats every entry as a real thunk. A new local `unthunk_bare_call` helper collapses `() => name()` to `name` in `ExprSimple` thunks to match upstream's `b.thunk` → `unthunk` pipeline. Unblocked `async-inspect-build`.
- **Sync-statement grouping in async-body transform** (Svelte 5.54.1 `6b33dd2a1`) — `async_body.rs` now flushes runs of analyzer-sync statements after the first top-level `await` into a single `SyncBlock` entry so they share one `$$promises[N]` blocker index and a combined `() => { ... }` thunk (mirroring upstream's `flush_sync_group`). `transform_async_body_inner` collects per-entry `analyzer_has_await` and `group_sync_entries` merges adjacent non-await runs; `build_thunk` flattens each `SyncBlock` via `sync_block_body_lines`. `compute_blocker_map` applies the same grouping so blocker indices line up between Phase 2 and Phase 3. Unblocked `async-if-hydration`, `async-derived-with-effect-and-boundary`, `async-binding-after-await`, `async-transform-empty-statements`.
- **Per-const-tag `@const` blocker** (Svelte 5.55.3 `3937ec03b`, partial) — `3_transform/server/visitors/const_tag.rs` now emits an **expression-bodied** assignment thunk (`async () => x = (await $.save(rhs))()` / `() => x = rhs`) instead of upstream's now-replaced block-bodied form, matching the final HEAD shape (commit `0ed8c282f` re-split the blocker wait into a separate thunk). The server `ServerCodeGenerator` also carries a precomputed `top_level_blocker_map` (from `compute_blocker_map(raw_script)`) so the const-tag visitor can look up instance-level `$$promises[N]` blockers (e.g. `let d = $derived(await ...)`) and emit `() => $$promises[N]` wait thunks for `{@const … = d}` declarations. The client `add_const_declaration` gained the same fallback for `state.blocker_map`. Unblocked `runtime-runes/async-const`, `runtime-runes/async-const-wait`, `hydration/boundary-pending-attribute`, `snapshot/async-const`.
- **Latest-use blocker order + server `$state.eager` derived-skip** (Svelte 5.53.x, `async-eager-derived` fixture) — `3_transform/client/visitors/fragment.rs` no longer calls `indices.sort()` on the assembled blocker indices so the emitted `$$promises[…]` array preserves insertion order, matching upstream's `Memoizer.#blockers = new Set()` iteration order (`[$$promises[1], $$promises[0]]` for the fixture instead of the previous `[$$promises[0], $$promises[1]]`). On the server side, `3_transform/server/transform_script.rs::wrap_derived_reads_in_script_inner` now recognises `$state.eager(<arg>)` and emits its whole-call text unchanged so identifier wrapping does not touch the inner argument, mirroring upstream's server `CallExpression` visitor which returns `node.arguments[0]` for `$state.eager` without visiting it. The `expression_tag` visitor in `3_transform/server/visitors/expression_tag.rs` now runs `wrap_derived_reads` BEFORE `transform_rune_in_template_expr` so the eager wrapper is still visible when the derived wrap runs, then the rune transform unwraps `$state.eager(...)` leaving the bare identifier intact (`derivedCount !== derivedCount()`). Unblocked `runtime-runes/async-eager-derived`.
- **`{#await await ...}` async-batching** (Svelte 5.55.9 `000c594e0`) — `3_transform/client/visitors/await_block.rs` now wraps the `$.await(...)` call in `$.async(node, [], [], (node) => $.await(...))` (empty blockers array) when `node.metadata.expression.has_await`, matching upstream's `has_blockers() || has_await` branch. The server visitor (`3_transform/server/visitors/await_block.rs`) IIFE-wraps the promise as `(async () => <expr>)()` so the await is not eagerly executed during SSR, and `bridge.rs::convert_await_block` / `build.rs::OutputPart::AwaitBlock` arm wrap the whole `$.await(...)` call in `$$renderer.child_block(async ($$renderer) => { ... })` so the SSR/hydration markup matches the client `$.async(...)` wrapper. `OutputPart::AwaitBlock` gained a `has_await: bool` field threaded from the visitor. Unblocked `runtime-runes/async-await`. `async-await-block-2` and `async-duplicate-dependencies` remain blocked on orthogonal axes (`$derived(await ...)` → `(await $.save($.async_derived(...)))()` lowering; `wrap_derived_reads` shadowing on `then` block argument identifiers; `{await expr}` text-expression `$.save(...)` predicate inside `async () => ...` server contexts).
- **SSR `$.save` parent-walk predicate** (Svelte 5.54.1 / 5.55.1 / 5.55.2 / mislabelled 5.53.4 — covers upstream's `AwaitExpression.js` walk) — `3_transform/server/visitors/expression_tag.rs` was wrapping any await with `(await $.save(...))()` whenever `self.in_block_body` was `false`, but the default at the top of the component was `false` too, so awaits inside the root component fragment got an unwanted `$.save(...)` wrap. Upstream's `AwaitExpression.js` server visitor instead walks `context.path` and only applies `save` when the first metadata-bearing ancestor is **not** a Fragment or ExpressionTag — i.e. when the immediate template parent is a `RegularElement` / `TitleElement` (the visitors that use `process_children` inline). Mirroring that, `in_block_body` now defaults to `true` (no save) and `RegularElement` / `TitleElement` / `select` / `textarea` / `<option>` toggle it `false` for their direct children iteration via save/restore. Every Fragment-bodied parent (root component fragment, IfBlock / EachBlock / KeyBlock / SnippetBlock / AwaitBlock body, SvelteHead, SvelteElement, SvelteBoundary, Component slot) leaves the flag at `true` so awaits in those bodies fall through to plain `await expr` — the surrounding `child_block(async ...)` already wraps them. The existing explicit `in_block_body = true` in `if_block.rs` / `each_block.rs` / `svelte_boundary.rs` is preserved because, after element children toggle the flag `false`, block visitors nested inside an element must re-toggle it back to `true` for their own body. Unblocked `runtime-runes/async-derived-indirect`, `runtime-runes/async-later-sync-overlaps`, `runtime-runes/async-overlap-multiple-1..4`, `runtime-runes/async-if-block-unskip`, `runtime-runes/async-if-else`.
- **Transitive `touch`-through-`binding.assignments`** (Svelte 5.55.1, `async-overlap-multiple-5..7`) — `3_transform/shared/async_body.rs::compute_blocker_map` and `update_blocker_map_for_stmt` now walk a new `collect_var_init_map` (binding name → init source for plain `let/var/const` declarators, excluding function-valued bindings already covered by `collect_function_bodies`) so a later async statement that references binding `b` also pulls in the identifiers from `b`'s initializer. Implemented as `apply_blocker_with_transitive(source, var_init_map, all_declared_vars, blocker_map, idx)`, which BFS-walks identifiers in `source`, upgrades each instance-scope binding's blocker index to `idx` (when higher), and queues every identifier from its init. Mirrors upstream's `calculate_blockers` → `touch(call)` → `for (const assignment of binding.assignments) touch(assignment.value, …)` recursion in `2-analyze/index.js`. The chained `let b = $derived(await delay(a*2)); let d = $derived(await delay(b + c))` pattern now collapses `a`/`b`/`c`/`d` to the chained derived's index, matching upstream's `[$$promises[2]]` blockers array (was `[$$promises[0], $$promises[2]]`). Unblocked `runtime-runes/async-overlap-multiple-5..7`.

### Ecosystem port (`docs/ecosystem-implementation-plan.md`)

| Wave | Scope | Status |
|---|---|---|
| 1 | svelte2tsx | ✅ 245/245 (100%), wired into compatibility report |
| 2 | svelte-check | ✅ v1.0 — walker + overlay + tsgo + incremental cache (incl. per-file warning cache at `<cacheDir>/warnings.json`) + watch + parallel compile + hires svelte2tsx source maps + SvelteKit kit-file `addedCode` augmentation for both `.ts` (TS annotations) and `.js` (JSDoc) files. `svelte.config.js` `kit.files` overrides are statically parsed and applied. Each / await (no-pending) / key / await-with-pending template wrappers preserve the expression chunk; each-block context bindings relocate via `MagicString::move_range` to keep destructure-pattern columns. Element-opener attribute bake is now structured (`Seg::Lit`/`Seg::Src`) so every attribute / `on:` / `class:` / `style:` / spread / `@attach` expression survives as an unedited MagicString chunk — column-accurate TS diagnostics on `<Component a={x} />`. |
| 3 | vite-plugin-svelte NAPI shim | 🟢 v1.0 — Rust-side `hmr_diff` + `resolve_id` + `preprocess` NAPI bindings + `@rsvelte/vite-plugin-svelte` JS shim forked in `submodules/vite-plugin-svelte` on `rsvelte-import-vps-native`. Every Vite `transform` / `hotUpdate` / preprocess call routes through the NAPI bindings. `pnpm run test:vps` (shim + fixture; 15 assertions) covers the surface end-to-end after `pnpm run build:vps-native`. SvelteKit HMR-latency bench is the one remaining open item. |
| 4 | svelte-language-server | ⛔ Deferred — CLI-side type checking is fully covered by `svelte-check` (Wave 2). LSP (editor hover/completion) waits on tsgo `tsserver` mode upstream. |

`migrate` (Svelte 4→5 migrator) remains intentionally out of scope.

## Implementation Status

### Fully passing in compatibility report

**Parser** - All Svelte 5 syntax, script/style parsing, legacy AST conversion
**Phase 2 Analyze** - Scope analysis, rune detection, store subscriptions, async blockers
**Phase 3 Transform** - Client/server code generation including async infrastructure
**CSS** - Selector scoping, combinators, pseudo-classes, `:global()`, keyframe prefixing
**Validator** - Warning/error detection including A11y
**Compiler Errors** - Error detection patterns
**Print** - `src/compiler/print/` provides AST-to-source conversion (40/40 fixtures).
**Preprocess** - `src/compiler/preprocess/` provides the markup/script/style preprocessor pipeline (19/19 fixtures). Each fixture's `_config.js` JS preprocessor is hand-ported into Rust closures in `tests/common/preprocess_fixtures.rs`.

### Out of scope

**Migrate** — Svelte 4 → 5 migrator. rsvelte is a port of the Svelte 5 compiler, not a migration tool, so the 76 `migrate` fixtures are intentionally not implemented and the category is reported as skipped (out of scope) rather than as an implementation gap. Do not start work on this without an explicit scope change.

### Not implemented

**Sourcemaps** - No fixtures collected yet.

## Quick Reference

### Adding Features

1. Check `submodules/svelte/packages/svelte/src/compiler/phases/{phase}/` for the reference implementation (requires `git submodule update --init`)
2. Implement in the corresponding Rust module under `src/compiler/phases/`
3. Run tests: `cargo test`
4. Debug differences with `node scripts/compare-parsers.mjs`

### Documentation Updates

```bash
pnpm run test-and-update  # Updates README.md and docs dashboard
```

### Compatibility Report

Default output path: `fixtures/{svelte-short-commit}/compatibility-report.json` (created on first run; the `fixtures/` directory is generated, not checked in). Override with `node scripts/update-docs.mjs --report <path>`.

Tracks test results over time for progress monitoring.
