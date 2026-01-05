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
- **Compiler**: Total 15/25 (Client 15/25, Server 18/25) tests passing

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

### Compiler (Total: 15/25, Client: 15/25, Server: 18/25 tests passing)

**Passing tests (client + server):**
- hello-world
- purity
- svelte-element
- props-identifier
- nullish-coallescence-omittance
- state-proxy-literal
- delegated-locally-declared-shadowed
- imports-in-modules
- each-string-template
- each-index-non-null
- bind-this
- function-prop-no-getter
- bind-component-snippet
- await-block-scope
- text-nodes-deriveds
- destructured-assignments
- export-state

**Failing tests (require compile options or complex features):**
- async-* tests (6 tests) - require `experimental.async` compile option
- hmr - requires `hmr: true` compile option
- functional-templating - requires `fragments: 'tree'` compile option
- class-state-field-constructor-assignment - requires class field transformation (`$state`/`$derived` in class fields → private fields with getters/setters)
- skip-static-subtree (client) - requires advanced navigation, custom element data handling, autofocus/muted attributes, option value handling, TEMPLATE_USE_IMPORT_NODE flag

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
- [x] Client-side `{#each}` block generation (`$.each()`, `$.comment()`)
- [x] `$props()` identifier pattern (`$.rest_props()`, `$.push/$.pop`)
- [x] Props property access transformation (`props.X` → `$$props.X`)
- [x] Constant variable tracking for compile-time evaluation
- [x] Snippet blocks with hoisted arrow functions
- [x] Component `bind:value` with getter/setter pattern
- [x] Root-level text+expression handling with `$.template_effect`
- [x] Constant folding for template expressions with nullish coalescing
- [x] `$.get()` wrapper for state variables in template effects
- [x] `$.update()` for increment/decrement operations
- [x] `bind:this` support for components (`$.bind_this()`)
- [x] Arrow function state transformation in component props
- [x] Component children callback with `$.next()`, `$.text()`, `$.template_effect()`
- [x] Client-side `{#await}` block runtime code (`$.await()`, navigation)
- [x] Root-level expressions with navigation (`$.sibling()`)
- [x] Combined `$.template_effect()` for multiple reactive text nodes
- [x] Function array pattern for `$.template_effect` (`[fn1, fn2]` syntax)
- [x] State variable skip detection for wrapper functions
- [x] Server-side component binding with do/while settling pattern
- [x] AST-based code generation infrastructure (`js_ast` module with builders and codegen)
- [x] Simple component AST generation path for components without runtime code
- [x] Runtime code AST builders (navigation, event handlers, template effects, bindings, delegate)

**Pending features:**
- [ ] Compile options support (`experimental.async`, `hmr`, `fragments`)
- [ ] Class field transformation (`$state`, `$derived` in classes → private fields with getters/setters)
- [ ] `{#if}` block client-side code generation (`$.if()`)
- [ ] CSS scoping and transformation
- [ ] Advanced element navigation with skip counts (`$.sibling(node, 10)`, `$.next(14)`)
- [ ] Custom element attribute handling (`$.set_custom_element_data`)
- [ ] Special attribute handling (`$.autofocus()`, `muted`, option values)
- [ ] Template flags support (`TEMPLATE_USE_IMPORT_NODE`, `TEMPLATE_USE_SVG`, `TEMPLATE_USE_MATHML`)
- [ ] Full migration of `generate_runtime_code` to AST-based generation

### Integration

- [ ] N-API bindings for Node.js
- [ ] Vite plugin compatibility
- [ ] Full test suite compatibility
