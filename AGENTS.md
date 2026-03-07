# AGENTS.md

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

**CRITICAL**: All implementations must follow the official Svelte compiler implementation.

1. **Reference Implementation** - Always check `svelte/packages/svelte/src/compiler/` before implementing
2. **Structural Consistency** - Mirror directory structure, module organization, and naming
3. **Exact Output** - Output must match the official compiler exactly (verified by tests)
4. **Test-Driven** - Verify all changes against the official Svelte test suite

When implementing, reference the corresponding file in `svelte/packages/svelte/src/compiler/` and use the same algorithms and logic.

## Development Workflow

### Docker Development Environment (Recommended)

All builds and tests should run inside the Docker container.

```bash
# First-time setup
./docker-dev.sh build              # Build Docker image
./docker-dev.sh up                 # Start container

# Development
./docker-dev.sh shell              # Open shell inside container
./docker-dev.sh run cargo build    # Run a command
./docker-dev.sh test               # Run tests

# VS Code Dev Containers
# Select "Reopen in Container" to start the development environment
```

### Setup (Run inside container)

```bash
git config core.hooksPath .githooks
npm run generate-fixtures  # Required before running tests
```

### Testing (Run inside container)

```bash
cargo test                          # Run all tests
cargo test test_parser_modern_fixtures -- --nocapture
npm run compatibility-report        # Generate detailed report
npm run test-and-update            # Run tests + update docs
```

Pre-commit hooks run `cargo fmt` and `cargo clippy` automatically.

### Working with Subagents

**MANDATORY**: Use the Task tool for all implementation work.

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

## Test Status (2026-03-07)

| Suite | Pass/Total | Status |
|-------|------------|--------|
| Parser Modern | 22/22 | 100% |
| Parser Legacy | 82/82 | 100% |
| Compiler Errors | 144/144 | 100% |
| SSR | 82/82 | 100% |
| Compiler Snapshot | 20/20 | 100% |
| CSS | 179/179 | 100% |
| Runtime Legacy | 1202/1202 | 100% |
| Runtime Runes | 865/865 | 100% |
| Hydration | 77/77 | 100% |
| Runtime Browser | 31/31 | 100% |
| Validator | 324/324 | 100% |
| Preprocess | 0/19 | N/A |
| Print | 0/40 | N/A |
| Migrate | 0/76 | N/A |

**Overall: 3028/3028 (100.0%)**

## Implementation Status

### All Test Suites Complete (100%)

**Parser** - All Svelte 5 syntax, script/style parsing, legacy AST conversion
**Phase 2 Analyze** - Complete scope analysis, rune detection, store subscriptions, async blockers
**Phase 3 Transform** - Full client/server code generation including async infrastructure
**CSS** - Selector scoping, combinators, pseudo-classes, `:global()`, keyframe prefixing
**Validator** - All warning/error detection including A11y
**Compiler Errors** - All error detection patterns

## Quick Reference

### Adding Features

1. Check `svelte/packages/svelte/src/compiler/phases/{phase}/` for reference implementation
2. Implement in corresponding Rust module
3. Run tests: `cargo test`
4. Debug with: `scripts/compare-parsers.mjs`

### Documentation Updates

```bash
npm run test-and-update  # Updates README.md and docs dashboard
```

### Compatibility Report

Output: `fixtures/{commit}/compatibility-report.json`

Tracks test results over time for progress monitoring.
