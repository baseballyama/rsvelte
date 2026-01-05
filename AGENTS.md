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
# Parser tests
cargo test test_parser_modern_fixtures -- --nocapture

# Compiler tests
cargo test --test compiler_fixtures -- --nocapture
```

Current status:
- **Parser**: 22/22 modern mode tests passing (100%)
- **Compiler Snapshot Tests**: 28 total samples
  - 8 skipped (require unsupported options: async, hmr, fragments)
  - 3 not testable (different file structure)
  - 17 testable → **Client 16/17, Server 17/17**
- **CSS Tests**: 177 total samples → **26/167 matching** (10 compilation failures)

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

### Compiler Snapshot Tests (17 testable: Client 17/17, Server 17/17) ✅

**Passing tests (17 client + 17 server):**
- hello-world
- purity
- svelte-element
- props-identifier
- nullish-coallescence-omittance
- state-proxy-literal
- delegated-locally-declared-shadowed
- imports-in-modules
- skip-static-subtree
- each-string-template
- each-index-non-null
- bind-this
- function-prop-no-getter
- bind-component-snippet
- await-block-scope
- text-nodes-deriveds
- destructured-assignments
- export-state
- class-state-field-constructor-assignment
- skip-static-subtree (server only)

**Skipped tests (8 tests, require unsupported compile options):**
- async-each-hoisting - `experimental.async`
- async-if-hoisting - `experimental.async`
- async-top-level-inspect-server - `experimental.async`
- async-in-derived - `experimental.async`
- async-each-fallback-hoisting - `experimental.async`
- async-if-alternate-hoisting - `experimental.async`
- hmr - `hmr: true`
- functional-templating - `fragments: 'tree'`

**All tests passing! ✅**

Key features implemented for skip-static-subtree:
- [x] `TEMPLATE_USE_IMPORT_NODE` flag for custom elements
- [x] Read-only destructured props without `$.prop()` (use `$$props.X` directly)
- [x] Template HTML without special attributes
- [x] `{@html}` runtime code generation (`$.html(node, () => expr)`)
- [x] Custom element data (`$.set_custom_element_data(el, attr, value)`)
- [x] Special attribute runtime code (`$.autofocus(el, true)`, `el.muted = true`, `option.value = option.__value = 'a'`)
- [x] Advanced DOM navigation (`$.child(el, preserve_whitespace)`, `$.reset(el)`, `$.next(count)`)
- [x] `$.template_effect()` for reactive props
- [x] Hierarchical navigation detection and `build_with_fragment()` for complex components
- [x] Trailing static element navigation pattern

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
- [x] Special attribute AST builders (`$.autofocus()`, `$.set_custom_element_data()`, `$.html()`, `set_option_value()`)
- [x] Advanced navigation builders (`$.next(count)`, `$.child(node, preserve_whitespace)`, `$.sibling(node, count)`)
- [x] Class field transformation (`$state`, `$derived` in classes → private fields with getters/setters)
- [x] **Refactoring Phase 1**: Eliminate double parsing (AST passed from Phase 1 to Phase 3)
- [x] **Refactoring Phase 2**: Scope analysis infrastructure
  - Extended BindingKind (State, Derived, BindableProp, RawState, StoreSub, Template, Static)
  - DeclarationKind enum (Var, Let, Const, Function, Import, Param, etc.)
  - Binding tracking with references and mutations
  - ScopeBuilder for AST traversal and scope tree construction
- [x] **Refactoring Phase 3.1**: State structure consolidation
  - SourceContext: component name, source, script content, runes flag
  - TemplateState: HTML parts, expressions, root element count, custom elements
  - NavigationState: element stack, child index, node var index
  - VariableTracker: var counters, state/const vars, read-only props
  - FeatureCollector: nodes, each/await blocks, snippets, components
- [x] **Refactoring Phase 3.2**: Visitor pattern implementation
  - TemplateVisitor trait with enter/exit/visit methods
  - VisitorContext for traversal state tracking
  - walk_* functions for AST traversal

**Pending refactoring:**
- [ ] **Phase 3.3**: Cursor-based DOM navigation (current priority)
  - Svelte方式のシングルパス・カーソルベースナビゲーション実装
  - `prev_var`: 現在位置（前回の動的ノード変数）
  - `skipped`: スキップした静的ノード数
  - `$.child(parent)` で最初の動的子を取得
  - `$.sibling(prev, skipped)` で後続の動的兄弟を取得
  - `$.reset(parent)` で子の処理完了を示す
  - `$.template_effect()` でリアクティブテキストを処理
- [ ] **Phase 3.4**: TemplateBuilder implementation
- [ ] **Phase 3.5**: Memoizer implementation
- [ ] **Phase 4**: Memory optimization with arena allocation

**Pending features:**
- [ ] Compile options support (`experimental.async`, `hmr`, `fragments`)
- [ ] `{#if}` block client-side code generation (`$.if()`)
- [~] CSS scoping and transformation (basic scoping implemented, 26/167 tests passing)
- [x] Template flags support (`TEMPLATE_USE_IMPORT_NODE` for custom elements)
- [ ] skip-static-subtree client-side features (see failing tests checklist above)

### Integration

- [ ] N-API bindings for Node.js
- [ ] Vite plugin compatibility
- [ ] Full test suite compatibility
