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

Directory structure mirrors the official Svelte compiler (`svelte/packages/svelte/src/compiler/`).

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
├── compiler/           # Compiler implementation (Svelte: compiler/)
│   ├── mod.rs          # Public API: compile()
│   ├── legacy.rs       # Legacy AST conversion (Svelte: compiler/legacy.js)
│   └── phases/         # Compiler phases (matching Svelte's 1-parse, 2-analyze, 3-transform)
│       ├── mod.rs
│       ├── 1_parse/            # Phase 1: Parsing (Svelte: 1-parse/)
│       │   ├── mod.rs          # Public API: parse(), parse_parallel()
│       │   ├── parser.rs       # Parser struct + helper methods
│       │   ├── read/           # Reading specific constructs
│       │   │   ├── mod.rs
│       │   │   ├── expression.rs # Expression parsing (uses OXC)
│       │   │   ├── script.rs   # parse_script_tag()
│       │   │   ├── style.rs    # parse_style_tag() + CSS parsing
│       │   │   └── options.rs  # parse_svelte_options()
│       │   ├── state/          # Parser state machines
│       │   │   ├── mod.rs
│       │   │   ├── element.rs  # Element/attribute/directive parsing
│       │   │   ├── fragment.rs # parse_fragment(), parse_node()
│       │   │   ├── tag.rs      # Mustache tags, blocks (if/each/await/key/snippet)
│       │   │   └── text.rs     # Text node parsing
│       │   └── utils/          # Utility functions
│       │       ├── mod.rs
│       │       ├── html.rs     # is_void_element(), etc.
│       │       └── lexer.rs    # Tokenization and HTML entity decoding
│       ├── 2_analyze/          # Phase 2: Analysis (Svelte: 2-analyze/)
│       │   ├── mod.rs
│       │   ├── scope.rs        # Scope/Binding definitions
│       │   ├── scope_builder.rs # Scope tree construction
│       │   ├── types.rs        # Analysis types
│       │   └── visitors.rs     # AST visitors
│       └── 3_transform/        # Phase 3: Code generation (Svelte: 3-transform/)
│           ├── mod.rs
│           ├── css.rs          # CSS transformation
│           ├── server.rs       # Server-side JS generation
│           ├── client/         # Client-side JS generation
│           └── js_ast/         # JS AST builders and codegen
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
8. **No Backward Compatibility**: This project does not maintain backward compatibility for internal APIs. Refactoring and restructuring are encouraged to keep the codebase clean and aligned with the official Svelte compiler structure.

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
2. Implement the corresponding feature in the appropriate module:
   - `parser.rs` - Parser struct and basic helpers
   - `state/fragment.rs` - Entry point and node dispatch
   - `state/element.rs` - Element, attribute, directive parsing
   - `state/tag.rs` - Mustache tags and blocks (if/each/await/key/snippet)
   - `state/text.rs` - Text node parsing
   - `read/script.rs` - Script tag parsing
   - `read/style.rs` - Style tag parsing
   - `read/options.rs` - svelte:options parsing
   - `utils/html.rs` - HTML utility functions
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

**Current status (2025-01-08):**

| Test Suite | Passing | Total | Status |
|------------|---------|-------|--------|
| Parser Modern | 22 | 22 | ✅ 100% |
| Parser Legacy | 82 | 83 | ✅ 99% (1 incompatible: JS comment attachment) |
| Compiler Snapshot | 17 | 17 | ✅ 100% (8 skipped: async/hmr/fragments) |
| CSS | 108 | 177 | ⚠️ 61% - In progress |
| Validator | 8 | 252 | ❌ 3% - Not implemented |
| Compiler Errors | 3 | 85 | ❌ 4% - Not implemented |

**Test output must match JavaScript compiler exactly** (formatting differences are normalized).

## Next Steps (Priority Order)

### 1. CSS Scoping (108/177 → 177/177)

Current implementation handles most selectors. Remaining issues (69 tests):

- Complex unused selector detection (combinators, nesting, sibling relationships)
- CSS escape sequences in selectors
- `@layer`, `@page`, `@supports` at-rules edge cases

**Recently implemented:**

- `:global { ... }` block syntax (comments out `:global {` and `}`)
- `:is()`, `:not()`, `:has()` scoping with `:where()` specificity
- Partial `:global()` scoping (e.g., `.foo:global([attr])`)
- Nested CSS rule parsing
- Template element/class/id tracking for unused selector detection (phase 2 analysis)
- Animation keyframe name replacement (`@keyframes foo` → `@keyframes svelte-hash-foo`)
- Basic unused selector detection for simple single-class/id selectors

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

### 4. Parser Legacy (82/83)

Legacy AST format for Svelte 4 compatibility. Remaining issue:

- JS comment attachment (`leadingComments`/`trailingComments` in ESTree format)
  - OXC parser provides comments separately; attaching them to AST nodes requires complex implementation

## Implemented Features

### Parser (22/22 modern, 82/83 legacy tests)

- All Svelte 5 syntax: elements, blocks, directives, expressions
- Script/Style parsing with CSS support
- Legacy AST conversion module (`src/compiler/phases/1_parse/legacy.rs`)
- Directive parsing: use:, class:, style:, transition:, animate:, let:
- Quoted expression handling in all directive types
- UTF-8 to UTF-16 position conversion for legacy format
- JS comment preservation in expressions (partial - comment attachment pending)

### Compiler (17/17 snapshot tests)

- Phase 1/2/3 architecture (Parse → Analyze → Transform)
- Client/Server code generation
- `$state`, `$derived`, `$props` runes
- `{#each}`, `{#await}`, `{#snippet}` blocks
- Component instantiation, bindings, event handlers
- CSS scoping with hash-based class names

### CSS Scoping (108/177 tests)

- Basic selector scoping with `.svelte-hash` class
- Descendant/child combinator handling
- `:global()` modifier support
- `:is()`, `:not()`, `:has()` with `:where()` specificity preservation
- Animation keyframe name prefixing
- Basic unused selector detection (simple single selectors)

## Not Yet Implemented

### CSS (69 failing tests)

- Complex unused selector detection (combinators, nesting)
- `@layer`, `@page`, `@supports` at-rules edge cases
- CSS escape sequences in selectors

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
- N-API bindings for Node.js
