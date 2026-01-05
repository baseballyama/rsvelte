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
│       │   ├── scope.rs        # Scope/Binding definitions
│       │   ├── scope_builder.rs # Scope tree construction
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
6. **No Double Parsing**: AST from Phase 1 is passed to Phase 3 (eliminates 20-30% overhead)
7. **Scope Analysis**: ScopeBuilder walks AST to create scope tree with bindings

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

### Maintaining AGENTS.md

- **Record learnings**: Document any new knowledge, patterns, or implementation details discovered during development
- **Keep it current**: Update test status, feature lists, and progress sections as work is completed
- **Refactor regularly**: Reorganize and consolidate information to maintain clarity and reduce duplication
- **Remove outdated info**: Delete obsolete sections or details that no longer apply

### Test Status

Track progress by running:
```bash
# Run all tests (some will fail - this is expected)
cargo test

# Run specific test suites
cargo test test_parser_modern_fixtures -- --nocapture
cargo test --test compiler_fixtures -- --nocapture
cargo test --test css -- --nocapture
```

**Current status (2025-01-05):**

| Test Suite | Passing | Total | Status |
|------------|---------|-------|--------|
| Parser Modern | 22 | 22 | ✅ 100% |
| Parser Legacy | 0 | 83 | ❌ Not supported (Svelte 4) |
| Compiler Snapshot | 17 | 17 | ✅ 100% (8 skipped: async/hmr/fragments) |
| CSS | 89 | 167 | ❌ 53% - In progress |
| Validator | 8 | 252 | ❌ 3% - Not implemented |
| Compiler Errors | 3 | 85 | ❌ 4% - Not implemented |

**Test output must match JavaScript compiler exactly** (formatting differences are normalized).

## Next Steps (Priority Order)

### 1. CSS Scoping (89/167 → 167/167)
Current implementation handles basic selectors. Need to fix:
- Sibling combinators with `:where()` specificity
- `@layer`, `@page`, `@supports` at-rules
- Complex `:global()` patterns
- Escaped selectors

### 2. Validator (8/252)
Implement warning/error detection:
- A11y warnings
- Unused CSS selectors
- Invalid attribute combinations
- Scope validation

### 3. Compiler Errors (3/85)
Implement error detection for:
- Invalid syntax patterns
- Rune misuse
- Invalid element nesting
- Store subscription errors

### 4. Parser Legacy (0/83)
Svelte 4 syntax support (lower priority - focus on Svelte 5)

## Implemented Features

### Parser (22/22 tests)
- All Svelte 5 syntax: elements, blocks, directives, expressions
- Script/Style parsing with CSS support

### Compiler (17/17 snapshot tests)
- Phase 1/2/3 architecture (Parse → Analyze → Transform)
- Client/Server code generation
- `$state`, `$derived`, `$props` runes
- `{#each}`, `{#await}`, `{#snippet}` blocks
- Component instantiation, bindings, event handlers
- CSS scoping with hash-based class names

### CSS Scoping (89/167 tests)
- Basic selector scoping with `.svelte-hash` class
- Descendant/child combinator handling
- `:global()` modifier support

## Not Yet Implemented

### CSS (78 failing tests)
- Sibling combinators with `:where()` specificity bumping
- `@layer`, `@page`, `@supports` at-rules
- Complex `:global()` edge cases
- CSS escape sequences

### Validator (244 failing tests)
- Warning generation system
- A11y checks
- Unused CSS detection

### Compiler Errors (82 failing tests)
- Error detection for invalid patterns
- Syntax error reporting
- Rune validation

### Other
- `{#if}` block client-side generation
- `experimental.async`, `hmr`, `fragments` options
- Parser Legacy (Svelte 4 syntax)
- N-API bindings for Node.js
