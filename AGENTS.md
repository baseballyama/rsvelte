# AGENTS.md

Guidelines for AI agents working on this project. `CLAUDE.md` is a symlink to this file.

## Project Goals

This project aims to create a complete port of the official Svelte compiler in Rust.

1. **100% Test Compatibility** - Pass all tests from `svelte/compiler` test suite
2. **100x Performance** - Achieve 100x speed using Rust optimizations and parallelism
3. **Drop-in Replacement** - Provide N-API bindings compatible with existing tools (Vite, etc.)
4. **OXC Integration** - Design for integration into [oxc](https://oxc.rs/) ecosystem

## Architecture

Directory structure mirrors the official Svelte compiler at `svelte/packages/svelte/src/compiler/`.

```
src/compiler/phases/
├── 1_parse/     # Parsing (Svelte syntax → AST)
├── 2_analyze/   # Analysis (scope tree, bindings)
└── 3_transform/ # Code generation (AST → JS/CSS)
```

**Key Design Decisions:**

- Memory-efficient layout (u32 positions, compact_str)
- Thread-safe parser with rayon parallelism
- Direct AST passing (no re-parsing between phases)
- No backward compatibility for internal APIs (refactor freely)

## Implementation Principles

**CRITICAL**: All implementations must follow the official Svelte compiler implementation.

1. **Reference Implementation** - Always check `svelte/packages/svelte/src/compiler/` before implementing
2. **Structural Consistency** - Mirror directory structure, module organization, and naming
3. **Exact Output** - Output must match the official compiler exactly (verified by tests)
4. **Test-Driven** - Verify all changes against the official Svelte test suite

When implementing, reference the corresponding file in `svelte/packages/svelte/src/compiler/` and use the same algorithms and logic.

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

Source: `pnpm run compatibility-report` (generated 2026-05-02, Svelte commit `04c0368aa8d8`). Re-run `pnpm run test-and-update` to refresh.

| Suite | Pass/Total | Notes |
|-------|------------|-------|
| Parser Modern | 22/22 | |
| Parser Legacy | 82/83 | 1 skipped (`javascript-comments` — OXC vs acorn comment attachment) |
| Compiler Errors | 144/144 | |
| Compiler Snapshot | 27/28 | 1 failing (`async-top-level-inspect-server` — sparse-array `[a,,]` codegen vs thunk expansion) |
| CSS | 179/179 | |
| Validator | 324/324 | 1 skipped (`error-mode-warn`) |
| SSR | 82/82 | |
| Hydration | 77/78 | 1 failing (`boundary-pending-attribute` — SvelteBoundary pending block-scope wrapping) |
| Runtime Legacy | 1202/1202 | |
| Runtime Runes | 865/865 | |
| Runtime Browser | 31/31 | |
| Sourcemaps | 0/0 | No fixtures yet |
| Print | 0/40 | Skipped in compatibility report; standalone test in `tests/print.rs` |
| Preprocess | 0/19 | Not implemented |
| Migrate | 0/76 | Not implemented |

**Compatibility report total: 3035/3037 implemented passing (137 skipped, 2 failing — both newly-discovered SSR codegen edge cases, see `docs/full-code-review-followup.md`)**

## Implementation Status

### Fully passing in compatibility report

**Parser** - All Svelte 5 syntax, script/style parsing, legacy AST conversion
**Phase 2 Analyze** - Scope analysis, rune detection, store subscriptions, async blockers
**Phase 3 Transform** - Client/server code generation including async infrastructure
**CSS** - Selector scoping, combinators, pseudo-classes, `:global()`, keyframe prefixing
**Validator** - Warning/error detection including A11y
**Compiler Errors** - Error detection patterns

### Implemented but not in the compatibility report

**Print** - `src/compiler/print/` provides AST-to-source conversion; tested standalone via `cargo test --test print`. Not yet wired into `compatibility_report.rs` (currently hardcoded as "Print API not implemented").

### Not implemented

**Preprocess** - `src/compiler/preprocess/` has scaffolding only; 19 official fixtures still skipped.
**Migrate** - Svelte 4 → 5 migrator not started; 76 official fixtures skipped.
**Sourcemaps** - No fixtures collected yet.

## Quick Reference

### Adding Features

1. Check `svelte/packages/svelte/src/compiler/phases/{phase}/` for the reference implementation (requires `git submodule update --init`)
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
