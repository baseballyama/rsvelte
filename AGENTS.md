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

## Test Status (2026-02-18)

| Suite | Pass/Total | Status |
|-------|------------|--------|
| Parser Modern | 22/22 | ✅ 100% |
| SSR | 80/80 | ✅ 100% |
| Parser Legacy | 79/83 | ✅ 96% |
| Compiler Errors | 112/144 | 🟢 95% |
| Compiler Snapshot | 17/27 | 🟢 94% |
| Runtime Runes | 735/845 | 🟢 89% |
| Hydration | 67/77 | 🟢 88% |
| Validator | 258/323 | 🟢 83% |
| CSS | 142/178 | 🟢 80% |
| Runtime Legacy | 808/1202 | 🟡 67% |
| Runtime Browser | 17/30 | ⚠️ 57% |
| Preprocess | 0/19 | ⏸️ N/A |
| Print | 0/39 | ⏸️ N/A |
| Migrate | 0/76 | ⏸️ N/A |

**Overall: 2337/2940 (79.5%)**

## Current Focus

### Phase 3 Client-Side Code Generation (Priority)

Runtime Runes: 89% passing (735/845). Key remaining issues:

1. Template effect dependency extraction (~28 tests)
2. Missing $.set() calls for class fields/module context (~19 tests)
3. Async infrastructure - $.run, $.save, $.async (~27 tests)
4. Snippet/slot rendering - derived_safe_equal, fallback (~10 tests)
5. Store operations - update_store vs store_set (~9 tests)
6. Static content detection - nodeValue vs template_effect (~8 tests)
7. CSS hash scoping (~5 tests)

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

**CSS** (62%)

- Selector scoping with `.svelte-hash`
- Combinators and pseudo-classes (`:is()`, `:not()`, `:has()`)
- `:global()` modifier support
- Animation keyframe prefixing
- Basic unused selector detection

### Not Implemented

**CSS** (69 tests)

- Complex unused selector detection (combinators, nesting, siblings)
- CSS escape sequences
- `@layer`, `@page`, `@supports` edge cases

**Validator** (244 tests)

- Warning generation system
- A11y checks
- Comprehensive unused CSS detection

**Compiler Errors** (118 tests)

- Error detection for invalid patterns
- Rune validation

**Runtime** (2600+ tests)

- `{#if}` block client-side generation
- Most client-side reactive code generation
- `experimental.async`, `hmr`, `fragments` options

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
