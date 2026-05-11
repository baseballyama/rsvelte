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

Source: `pnpm run compatibility-report` (generated 2026-05-05, Svelte commit `04c0368aa8d8`). Re-run `pnpm run test-and-update` to refresh.

| Suite | Pass/Total | Notes |
|-------|------------|-------|
| Parser Modern | 22/22 | |
| Parser Legacy | 82/83 | 1 skipped (`javascript-comments` — OXC vs acorn comment attachment) |
| Compiler Errors | 144/144 | |
| Compiler Snapshot | 28/28 | |
| CSS | 179/179 | |
| Validator | 324/324 | 1 skipped (`error-mode-warn`) |
| SSR | 82/82 | |
| Hydration | 78/78 | |
| Runtime Legacy | 1202/1202 | |
| Runtime Runes | 865/865 | |
| Runtime Browser | 31/31 | |
| Print | 40/40 | |
| Preprocess | 19/19 | Each fixture's `_config.js` JS preprocessor hand-ported in `tests/common/preprocess_fixtures.rs` |
| Sourcemaps | 0/0 | No fixtures yet |
| svelte2tsx | 245/245 | Wave 1 of the ecosystem port. 2 skipped (`expected.error.json` error fixtures). Driven by `tests/common/svelte2tsx.rs` |
| Migrate | 0/76 | **Out of scope** — rsvelte is a Svelte 5 compiler port, not a Svelte 4 → 5 migration tool |

**Compatibility report total: 3341/3341 in-scope passing — every in-scope category at 100%. The 76 `migrate` fixtures are intentionally out of scope and do not count against the total.**

### Ecosystem port (`docs/ecosystem-implementation-plan.md`)

| Wave | Scope | Status |
|---|---|---|
| 1 | svelte2tsx | ✅ 245/245 (100%), wired into compatibility report |
| 2 | svelte-check | 🟡 v0.7 — walker + overlay + tsgo + incremental cache + watch + parallel compile + hires svelte2tsx source maps. Unedited chunks emit per-character segments so TS diagnostics in script regions resolve to exact `.svelte` line/column; edited template wrappers still anchor at chunk start. SvelteKit kit-file `addedCode` augmentation deferred. |
| 3 | vite-plugin-svelte NAPI shim | 🟡 v0.2 — Rust-side `hmr_diff` + `resolve_id` + NAPI bindings. `preprocess` NAPI is a pass-through; bridging JS preprocessor callbacks via `ThreadsafeFunction` is the documented next step. JS shim package fork is out of scope for the rsvelte repo. |
| 4 | svelte-language-server | ⛔ Deferred (waiting on tsgo `tsserver` mode upstream) |

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
