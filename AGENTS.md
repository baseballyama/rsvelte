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

Source: `pnpm run compatibility-report` (generated 2026-05-26, Svelte commit `b65a3f3fc5e1`). Re-run `pnpm run test-and-update` to refresh. Skip lists live in `tests/compatibility_report.rs` and `tests/runtime.rs`; `tests/audit_skipped.rs` re-checks every skipped fixture after a Svelte bump. See [docs/skip-remaining-clusters.md](docs/skip-remaining-clusters.md) for a per-cluster breakdown of remaining skips with upstream commits, root causes, and a porting plan.

| Suite | Pass/Total | Notes |
|-------|------------|-------|
| Parser Modern | 24/24 | |
| Parser Legacy | 82/83 | 1 skipped (`javascript-comments` — OXC drops standalone comments that acorn surfaces) |
| Compiler Errors | 144/144 | |
| Compiler Snapshot | 20/20 | |
| CSS | 180/181 | 1 skipped (`css-prune-edge-cases` — Svelte 5.53.7) |
| Validator | 324/325 | 1 skipped (`error-mode-warn` — opted out via `_config.js`) |
| SSR | 97/97 | HtmlTag SSR class-hash inlining + synthetic `<option value>` ported (Svelte 5.53.6, 5.55.9). |
| Hydration | 78/78 | HtmlTag `is_controlled` cluster ported (Svelte 5.53.8 `0206a2019`) |
| Runtime Legacy | 1205/1205 | All executed fixtures pass — `flush-sync-each-block` unblocked by ASI-aware side-effect import detection (Svelte 5.55.2). |
| Runtime Runes | 936/979 | 43 skipped — async-blocker / `@const` clusters (Svelte 5.54.1–5.55.9). HtmlTag `is_controlled` + derived-update-server + derived-dep-set-while-rendering + derived-name-shadowed + set-text-stable-coercion + attribute-parts ported. |
| Runtime Browser | 32/32 | |
| Print | 41/42 | 1 skipped (`css-keyframes-percent` — upstream fixture inconsistency, see docs) |
| Preprocess | 19/19 | Each fixture's `_config.js` JS preprocessor hand-ported in `tests/common/preprocess_fixtures.rs` |
| Sourcemaps | 0/0 | No fixtures yet |
| svelte2tsx | 245/247 | Wave 1 of the ecosystem port. 2 skipped (`expected.error.json` error fixtures). Driven by `tests/common/svelte2tsx.rs` |
| Migrate | 0/76 | **Out of scope** — rsvelte is a Svelte 5 compiler port, not a Svelte 4 → 5 migration tool |

**Compatibility report total: 3427/3427 in-scope-run passing — every executed fixture in every in-scope category passes. 49 in-scope fixtures remain skipped (see [docs/skip-remaining-clusters.md](docs/skip-remaining-clusters.md)); the 76 `migrate` fixtures are intentionally out of scope.**

### Ports landed for skip-reduction (Svelte 5.53.0+)

- **HtmlTag `is_controlled`** (Svelte 5.53.8 `0206a2019`) — fragment / html_tag visitor branches in `src/compiler/phases/3_transform/client/visitors/{html_tag.rs,shared/fragment.rs}`. Unblocked 11 fixtures across runtime-runes, runtime-legacy, hydration.
- **`$.update_derived` helpers on derived `++` / `--`** (Svelte 5.53.2 `6aa7b9c64`) — `transform_script.rs::rewrite_derived_update_expressions` rewrites `count()++`/`++count()` shape into `$.update_derived(count)` / `$.update_derived_pre(count)` after the bare-read wrap pass. Unblocked `derived-update-server`.
- **`<option>` synthetic-value via `transform_store_refs`** (Svelte 5.53.6 `e3d277b00`) — `select_element.rs` now routes the synthetic value expression through `transform_store_refs` so `$label` becomes `$.store_get(...)`. Unblocked `select-option-store-implicit-value`.
- **Bare-derived `$derived(visible)` collapse** (Svelte 5.55.5 `b771df3`) — `transform_script.rs::unthunk_bare_derived_arg` rewrites `$.derived(() => visible())` back to `$.derived(visible)` when the inner is a known derived. Unblocked `derived-dep-set-while-rendering`.
- **SSR attribute `$.stringify` elide** (Svelte 5.55.9 `a5df6616e`, partial) — `eval_attr_expr_json` handles `ConditionalExpression` and string-concat `BinaryExpression`. Class, style-directive, and class-attribute (no-directive) emission paths route through it; the no-class-directive path also falls back to a static `class="..."` attribute when every interpolation inlines. Unblocked `attribute-dynamic-multiple`, `globals-not-overwritten-by-bindings`, `attribute-parts`, `head-raw-elements-content`, `innerhtml-interpolated-literal`. Multi-line `let` extraction remains pending.
- **ASI-aware side-effect import detection** (Svelte 5.55.2 cluster) — `extract_imports` in `src/compiler/phases/3_transform/{client/mod.rs,server/helpers.rs}` now recognises `import "module"` / `import 'module'` (no `from`, no `;`) as a complete one-line side-effect import via `is_complete_side_effect_import`. Previously the line-by-line splitter only treated an import as complete when it contained `;` or matched `... from "…"`, so the side-effect form merged into the next statement (e.g. `let count = 1;`), breaking legacy `$.mutable_source` lowering. Unblocked `flush-sync-each-block`.
- **Comments in element openers and `Root.comments`** (Svelte 5.53.0 `92e2fc120`) — `parse_attribute` in `1_parse/state/element.rs` consumes `// …` / `/* … */` between attributes and pushes a `JsComment` onto `Root.comments`. The JS parser pipeline (`parse_expression` / `parse_program`) also forwards every OXC-discovered comment via a per-thread sink. Legacy AST surfaces the same data as `_comments`. Unblocked `parser-modern/comment-in-tag`, `parser-modern/parens`, `parser-legacy/script-comment-only`.

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
