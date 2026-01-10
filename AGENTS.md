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

### Setup

```bash
git config core.hooksPath .githooks
npm run generate-fixtures  # Required before running tests
```

### Testing

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

## Test Status (2026-01-10)

| Suite | Pass/Total | Status |
|-------|------------|--------|
| Parser Modern | 22/22 | ✅ 100% |
| Parser Legacy | 82/82 | ✅ 100% |
| Compiler Snapshot | 15/19 | 🟢 78.9% |
| CSS | 110/177 | ⚠️ 62.1% |
| Validator | 82/312 | ⚠️ 26.3% |
| Compiler Errors | 0/118 | ❌ 0% |
| Runtime Runes | 10/724 | ❌ 1.4% |
| Runtime Legacy | 13/1198 | ❌ 1.1% |
| Runtime Browser | 0/30 | ❌ 0% |
| Hydration | 4/70 | ❌ 5.7% |
| SSR | 10/80 | ❌ 12.5% |
| Preprocess | 0/19 | ⏸️ N/A |
| Print | 0/39 | ⏸️ N/A |
| Migrate | 0/76 | ⏸️ N/A |

**Overall: 346/2830 (12.2%)**

## Current Focus

### Phase 3 Client-Side Code Generation (Priority)

Runtime tests: 1.4% passing. Implementing client-side visitors will significantly improve pass rates.

Required:

- Template → imperative code transformation
- Reactive dependency tracking
- Effect and derived state generation
- Event handler binding

### Compiler Snapshot Remaining (4 tests to 100%)

- `svelte-element`, `skip-static-subtree`, `props-identifier` - $props() validation
- `bind-component-snippet` - bind: directive implementation

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
