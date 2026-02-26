# CLAUDE.md

Guidelines for AI agents working on this project.

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

**⚠️ CRITICAL**: All implementations must follow the official Svelte compiler implementation.

1. **Reference Implementation** - Always check `svelte/packages/svelte/src/compiler/` before implementing
2. **Structural Consistency** - Mirror directory structure, module organization, and naming
3. **Exact Output** - Output must match the official compiler exactly (verified by tests)
4. **Test-Driven** - Verify all changes against the official Svelte test suite

When implementing, reference the corresponding file in `svelte/packages/svelte/src/compiler/` and use the same algorithms and logic.

## Development Workflow

### Docker 開発環境 (必須)

**⚠️ 重要**: すべてのビルドとテストは Docker コンテナ内で実行してください。

```bash
# 初回セットアップ
./docker-dev.sh build              # Docker イメージをビルド
./docker-dev.sh up                 # コンテナを起動

# 開発作業
./docker-dev.sh shell              # コンテナ内でシェルを開く
./docker-dev.sh run cargo build    # コマンドを実行
./docker-dev.sh test               # テストを実行

# VS Code Dev Containers
# 「Reopen in Container」で自動的に開発環境が起動
```

### Setup (コンテナ内で実行)

```bash
git config core.hooksPath .githooks
npm run generate-fixtures  # Required before running tests
```

### Testing (コンテナ内で実行)

```bash
cargo test                          # Run all tests
cargo test test_parser_modern_fixtures -- --nocapture
npm run compatibility-report        # Generate detailed report
npm run test-and-update            # Run tests + update docs
```

Pre-commit hooks run `cargo fmt` and `cargo clippy` automatically.

### Working with Subagents

**⚠️ MANDATORY**: Use the Task tool for all implementation work.

- **Use subagents for**: Feature implementation, bug fixes, code exploration, multi-file changes
- **Available types**: `Bash` (commands), `Explore` (codebase analysis), `general-purpose` (implementation)
- **Exception**: Trivial single-file changes (e.g., fixing typos)

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

## Test Status (2026-02-26)

| Suite | Pass/Total | Status |
|-------|------------|--------|
| Parser Modern | 22/22 | ✅ 100% |
| Parser Legacy | 82/82 | ✅ 100% |
| Compiler Errors | 118/118 | ✅ 100% |
| SSR | 82/82 | ✅ 100% |
| Compiler Snapshot | 18/18 | ✅ 100% |
| CSS | 178/179 | 🟢 99% |
| Runtime Legacy | 1139/1202 | 🟢 95% |
| Runtime Runes | 774/838 | 🟢 92% |
| Hydration | 71/77 | 🟢 92% |
| Runtime Browser | 28/31 | 🟢 90% |
| Validator | 291/313 | 🟢 93% |
| Preprocess | 0/19 | ⏸️ N/A |
| Print | 0/40 | ⏸️ N/A |
| Migrate | 0/76 | ⏸️ N/A |

**Overall: 2803/2962 (94.6%)**

## Current Focus

### Remaining Failures (159 tests to 100%)

Runtime Runes (64 failures):
1. Async infrastructure - $.run, $.save, $.async (~40 tests, separate feature)
2. Non-async: mutation wrapping, CSS hash, attribute effects (~24 tests)

Runtime Legacy (63 failures):
1. Mutation return value wrapping `signal(signal().prop = val, true)` (~9 tests)
2. {@const} tag handling - derived_safe_equal, deep_read_state (~7 tests)
3. Compilation errors - invalid JS from store/destructure codegen (~8 tests)
4. Deep read state / untrack dependency wrapping (~6 tests)
5. Slot/let directive issues (~6 tests)
6. Server-side reactive statement ordering (~5 tests)

Validator (22 failures):
1. A11y warnings - role/aria prop mapping tables (~3 tests, 187 warnings)
2. bind_invalid_each_rest (~4 tests)
3. element_implicitly_closed (~2 tests)
4. Various missing single warnings (~13 tests)

Other: Hydration (6), Runtime Browser (3), CSS (1)

## Implementation Status

### Completed

**Parser** (100%)

- All Svelte 5 syntax: elements, blocks, directives, expressions
- Script/style parsing with CSS support
- Legacy AST conversion (Svelte 4 compatibility)

**Compiler** (Phase 1/2/3 architecture)

- Client/server code generation
- Runes: `$state`, `$derived`, `$props`
- Blocks: `{#each}`, `{#await}`, `{#snippet}`
- Component instantiation, bindings, event handlers
- CSS scoping with hash-based class names

**Phase 2 Analyze** (2026-01-10 Major Update)

Core Infrastructure:
- Complete `CompileOptions` with all 20+ fields (runes, custom_element, css_hash, etc.)
- Full type system sync (`types.rs` - 100% compatible with official compiler)
- `calculate_blockers()` - async/await dependency tracking
- `order_reactive_statements()` - reactive declaration topological sort

Visitors:
- `VariableDeclarator` - Complete implementation (528 lines, all rune detection)
- `shared/utils.rs` - State field tracking, $props.id() checks, helper functions
- Core visitor gap analysis documented (see `VISITOR_IMPLEMENTATION_PLAN.md`)

Remaining Work:
- CSS implementation (~80% missing - see `PHASE2_VISITOR_GAPS.md`)
- Expression context infrastructure (blocker for many visitors)
- 15+ validation checks in `analyze_component()`
- Most visitor detailed implementations

Documentation:
- 5 comprehensive implementation guides created
- Clear roadmap with priorities (40-60 hours estimated)

**CSS** (99% - 178/179)

- Selector scoping with `.svelte-hash`
- Combinators and pseudo-classes (`:is()`, `:not()`, `:has()`)
- `:global()` modifier support with `:where()` hash scoping
- Animation keyframe prefixing
- Unused selector detection (nesting, siblings, compounds)
- Remaining: unicode-identifier edge case

**Validator** (93% - 291/313)

- Warning generation system (most codes implemented)
- Remaining: A11y role/aria prop validation tables, bind_invalid_each_rest, element_implicitly_closed

**Compiler Errors** (100% - 118/118)

- All error detection patterns implemented

**Runtime** (92-95%)

- Full client/server code generation for most patterns
- Remaining: async infrastructure, mutation wrapping, deep_read_state, slot/let edge cases

## Quick Reference

### Adding Features

1. Check `svelte/packages/svelte/src/compiler/phases/{phase}/` for reference implementation
2. Implement in corresponding Rust module
3. Run tests: `cargo test`
4. Debug with: `scripts/compare-parsers.mjs`

### Documentation Updates

```bash
npm run test-and-update  # Updates README.md and playground dashboard
```

### Compatibility Report

Output: `fixtures/{commit}/compatibility-report.json`

Tracks test results over time for progress monitoring.
