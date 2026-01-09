# AGENTS.md

This file provides guidelines for AI agents working on this project.

## TODO Implementation Guides

Phase 2 Analyze の visitor 実装で残された TODO を解決するためのガイド：

- **[TODO_QUICKSTART.md](./TODO_QUICKSTART.md)** - 🚀 すぐに始める実践ガイド（推奨）
- **[TODO_CHECKLIST.md](./TODO_CHECKLIST.md)** - 📋 簡潔なタスクリストと優先順位
- **[TODO_IMPLEMENTATION_GUIDE.md](./TODO_IMPLEMENTATION_GUIDE.md)** - 📚 完全な実装ガイド（詳細版）

実装者は **QUICKSTART** から始めることを推奨します。

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
├── common/mod.rs            # Shared test utilities and report structures
├── parser_fixtures.rs       # Parser fixture tests
├── compiler_fixtures.rs     # Compiler fixture tests
├── compatibility_report.rs  # Comprehensive compatibility report generator
├── css.rs                   # CSS scoping tests
├── validator.rs             # Validator tests
├── compiler_errors.rs       # Compiler error tests
├── runtime.rs               # Runtime tests (hydration, runtime-*)
├── ssr.rs                   # Server-side rendering tests
└── sourcemaps.rs            # Sourcemap tests

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

# Generate compatibility report (saves JSON to fixtures/)
npm run compatibility-report

# List all test categories with sample counts
npm run list-categories

# Generate fixtures from Svelte compiler (required before running tests)
npm run generate-fixtures
```

### Compatibility Report

The compatibility report system provides comprehensive tracking of test results against the official Svelte compiler.

**Output location:** `fixtures/{svelte-commit}/compatibility-report.json`

**JSON schema:**
```json
{
  "svelte_commit": "...",
  "svelte_short_hash": "...",
  "generated_at": "ISO8601 timestamp",
  "summary": {
    "total_tests": 3027,
    "total_passed": 330,
    "total_failed": 2495,
    "total_skipped": 197,
    "overall_percentage": 11.6,
    "category_percentages": { "parser-modern": 90.9, ... }
  },
  "categories": {
    "parser-modern": {
      "stats": { "total": 22, "passed": 20, "failed": 2, ... },
      "samples": [{ "name": "...", "status": "passed|failed|skipped|error", ... }]
    }
  }
}
```

This report can be used to track progress over time and power documentation dashboards.

### Auto-updating Documentation

Run tests and automatically update README.md and the documentation site:

```bash
# Run compatibility tests and update all documentation
npm run test-and-update
```

This command:
1. Generates `fixtures/{commit}/compatibility-report.json`
2. Updates the compatibility table in `README.md`
3. Updates `playground/static/test-results.json` for the progress dashboard

Individual commands:
```bash
npm run compatibility-report  # Generate report only
npm run update-docs           # Update docs from existing report
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

# Generate full compatibility report
npm run compatibility-report
```

**Current status (2026-01-09):**

| Test Suite | Passing | Total | Status |
|------------|---------|-------|--------|
| Parser Modern | 18 | 22 | ⚠️ 81.8% |
| Parser Legacy | 82 | 82 | ✅ 100% |
| Compiler Snapshot | 16 | 17 | ✅ 94.1% |
| CSS | 110 | 177 | ⚠️ 62.1% |
| Validator | 65 | 312 | ⚠️ 20.8% |
| Compiler Errors | 0 | 118 | ❌ 0% |
| Runtime Runes | 10 | 724 | ❌ 1.4% |
| Runtime Legacy | 13 | 1198 | ❌ 1.1% |
| Runtime Browser | 0 | 30 | ❌ 0% |
| Hydration | 4 | 70 | ❌ 5.7% |
| SSR | 10 | 80 | ❌ 12.5% |
| Preprocess | 0 | 19 | ⏸️ Not implemented |
| Print | 0 | 39 | ⏸️ Not implemented |
| Migrate | 0 | 76 | ⏸️ Not implemented |

**Overall: 326/2830 tests passed (11.5%)**

**Test output must match JavaScript compiler exactly** (formatting differences are normalized).

**Parser Modern remaining failures (4/22):**
- `loose-invalid-expression` - Invalid JS expressions (e.g., `a.`, `x.`)
- `loose-unclosed-tag` - Unclosed tags at EOF
- `loose-unclosed-open-tag` - Unclosed opening tags at EOF
- `comment-before-script` - Comment positioning/ordering

See [NEXT_STEPS.md](./NEXT_STEPS.md) for detailed instructions on fixing these issues.

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
