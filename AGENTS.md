# AGENTS.md

This file provides guidelines for AI agents working on this project.

## Project Goals

### 1. 100% Test Compatibility

Pass all tests from the official Svelte compiler (`svelte/compiler`) test suite.

- Reuse test cases from the Svelte repository (git submodule at `./svelte`)
- Support all syntax including edge cases
- Guarantee output compatibility with JSON-based comparison

### 2. 100x Performance

Achieve 100 times the processing speed compared to the official Svelte compiler.

- Leverage Rust's zero-cost abstractions
- Implement an efficient parser with optimal memory layout
- Use parallel processing with rayon for multi-file compilation
- Optimize code generation

### 3. Drop-in Replacement

Usable as a drop-in replacement for the official Svelte compiler.

- Provide N-API bindings for Node.js integration
- Compatible with Vite and other build tools
- Same API surface as `svelte/compiler`

### 4. OXC Integration

Designed to be integrated into [oxc](https://oxc.rs/).

- Compatible AST structure with oxc conventions
- Usable from oxfmt for Svelte formatting
- Usable from oxlint for Svelte linting
- Follow oxc coding patterns and memory management

## Architecture

```
src/
├── lib.rs              # Library entry point
├── main.rs             # CLI entry point
├── ast/                # AST definitions
│   ├── mod.rs
│   ├── span.rs         # Source positions (u32-based for memory efficiency)
│   ├── template.rs     # Svelte template nodes
│   ├── js.rs           # JavaScript expression wrapper
│   └── css.rs          # CSS stylesheet types
├── parser/             # Parser implementation
│   ├── mod.rs          # Public API: parse(), parse_parallel()
│   ├── lexer.rs        # Tokenization utilities
│   └── state.rs        # Parser state machine
├── compiler/           # Compiler implementation
│   ├── mod.rs          # Public API: compile()
│   └── phases/         # Compiler phases (matching Svelte's architecture)
│       ├── mod.rs
│       ├── phase1_parse.rs     # Phase 1: Parsing
│       ├── phase2_analyze/     # Phase 2: Analysis
│       │   ├── mod.rs
│       │   ├── scope.rs        # Scope tracking
│       │   ├── types.rs        # Analysis types
│       │   └── visitors.rs     # AST visitors
│       └── phase3_transform/   # Phase 3: Code generation
│           ├── mod.rs
│           ├── client.rs       # Client-side JS generation
│           ├── server.rs       # Server-side JS generation
│           └── css.rs          # CSS transformation
└── error/              # Error types
    └── mod.rs

tests/
├── parser_fixtures.rs    # Parser fixture tests
└── compiler_fixtures.rs  # Compiler fixture tests

benches/
└── parser.rs           # Performance benchmarks

scripts/
├── parse-with-svelte.mjs   # Parse with official Svelte compiler
└── compare-parsers.mjs     # Compare Rust vs JS parser output
```

### Key Design Decisions

1. **Memory Layout**: Fields ordered by size (largest first), u32 for positions
2. **String Handling**: `compact_str` for short strings, avoiding heap allocations
3. **Parallelism**: Thread-safe parser state, rayon for multi-file parsing
4. **JS Expressions**: Uses `serde_json::Value` for flexibility in matching Svelte output
5. **Testing**: Direct comparison with Svelte's output.json fixtures

## Development Guidelines

### Setup

After cloning, configure git hooks:
```bash
git config core.hooksPath .githooks
```

### Pre-commit Hooks

The project uses git hooks (`.githooks/pre-commit`) that run:
1. `cargo fmt -- --check` - Code formatting
2. `cargo clippy --all-targets --all-features -- -D warnings` - Linting

### CI/CD

GitHub Actions (`.github/workflows/ci.yml`) runs on every push/PR:
- Format check
- Clippy check
- Tests (Linux, macOS, Windows)
- Release build
- Documentation build

### Running Tests

```bash
# Run all tests
cargo test

# Run parser fixture tests with output
cargo test test_parser_modern_fixtures -- --nocapture

# Run benchmarks
cargo bench
```

### Adding Parser Features

1. Check the Svelte parser implementation in `svelte/packages/svelte/src/compiler/phases/1-parse/`
2. Implement the corresponding feature in `src/parser/state.rs`
3. Run fixture tests to verify compatibility
4. Use `scripts/compare-parsers.mjs` for debugging differences

### Commit Guidelines

- **Commit frequently**: After implementing a feature or fixing a bug, commit and push immediately
- **Run checks before committing**: `cargo fmt && cargo clippy --all-targets --all-features -- -D warnings`
- **Push after each commit**: Keep the remote repository up to date
- **Atomic commits**: Each commit should represent a single logical change

### Test Status

Track progress by running:
```bash
# Parser tests
cargo test test_parser_modern_fixtures -- --nocapture

# Compiler tests
cargo test --test compiler_fixtures -- --nocapture
```

Current status:
- **Parser**: 22/22 modern mode tests passing (100%)
- **Compiler**: Total 2/25 (Client 2/25, Server 15/25) tests passing

## Current Progress

### Parser (22/22 modern mode tests passing)

- [x] Project structure
- [x] AST type definitions
- [x] Fixture test infrastructure
- [x] Basic text parsing
- [x] Pre-commit hooks (fmt + clippy)
- [x] GitHub Actions CI
- [x] Element parsing
- [x] Block parsing ({#if}, {#each}, {#await}, {#key}, {#snippet})
- [x] Expression parsing
- [x] Directive parsing (bind:, on:, class:, style:, use:, transition:, animate:)
- [x] Script/Style parsing
- [x] CSS parsing

### Compiler (Total: 2/25, Client: 2/25, Server: 15/25 tests passing)

**Passing tests:**
- hello-world (client + server)
- purity (client + server)
- bind-this (server only)
- functional-templating (server only)
- hmr (server only)
- each-string-template (server only)
- each-index-non-null (server only)
- text-nodes-deriveds (server only)
- state-proxy-literal (server only)
- svelte-element (server only)
- delegated-locally-declared-shadowed (server only)
- imports-in-modules (server only)
- skip-static-subtree (server only)
- function-prop-no-getter (server only)
- await-block-scope (server only)

**Implemented features:**
- [x] Compiler fixture test infrastructure
- [x] Phase 1/2/3 architecture (Parse → Analyze → Transform)
- [x] Client-side HTML template generation (`$.from_html`)
- [x] Fragment handling for multiple root elements
- [x] Expression handling and navigation code (`$.first_child`, `$.sibling`)
- [x] Component instantiation code generation
- [x] Constant folding for Math.max/Math.min expressions
- [x] Server-side HTML rendering (`$$renderer.push`)
- [x] Expression escaping (`$.escape`)
- [x] Whitespace normalization between elements
- [x] Each block generation with index support
- [x] Basic script block processing (`$state` → value, `$props()` → `$$props`)
- [x] JS formatting for script content
- [x] Bind directive handling (`bind:value` → `$.attr`)
- [x] Expression attributes (`$.attr()` for dynamic attributes)
- [x] `svelte:element` dynamic elements (`$.element()`)
- [x] Each block with object literal expressions
- [x] Import hoisting for SSR
- [x] `{@html expr}` tag (`$.html()`)
- [x] `<option>` element handling (`$$renderer.option()`)
- [x] Component children with `children` callback and `$$slots`
- [x] `$derived()` transformation (SSR)
- [x] `{#await}` block (`$.await()`)
- [x] ASI (Automatic Semicolon Insertion) for statements

**Pending features:**
- [ ] Props destructuring with defaults
- [ ] Reactive effects (`$.template_effect`)
- [ ] Control flow blocks (`{#if}`, `{#await}`)
- [ ] CSS scoping and transformation
- [ ] Client-side bindings
- [ ] Snippet blocks
- [ ] Component bindings with getter/setter

### Integration

- [ ] N-API bindings for Node.js
- [ ] Vite plugin compatibility
- [ ] Full test suite compatibility
