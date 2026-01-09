# svelte-compiler-rust

A high-performance Rust implementation of the Svelte compiler.

## Goals

1. **100% Test Compatibility**: Pass all tests from the official Svelte compiler test suite
2. **100x Performance**: Achieve 100 times the performance of the official Svelte compiler
3. **Drop-in Replacement**: Usable as a drop-in replacement for the Svelte compiler via N-API bindings (works with Vite)
4. **OXC Integration**: Designed to be integrated into [oxc](https://oxc.rs/) for use with oxfmt and oxlint

## Features

- Memory-efficient AST representation (u32 positions, compact strings)
- Parallel parsing with rayon
- JSON output compatible with Svelte's AST format

## Usage

```rust
use svelte_compiler_rust::{parse, ParseOptions};

let source = r#"<h1>Hello, {name}!</h1>"#;
let ast = parse(source, ParseOptions::default()).unwrap();
```

## Development

```bash
# Build
cargo build

# Run tests
cargo test

# Run parser fixture tests with output
cargo test test_parser_modern_fixtures -- --nocapture

# Run benchmarks
cargo bench
```

## Compatibility

Current compatibility with the official Svelte compiler test suite:

| Test Suite | Passing | Total | Coverage | Notes |
|------------|---------|-------|----------|-------|
| Parser Modern | 22 | 22 | 100% |  |
| Parser Legacy | 80 | 82 | 98% | 1 skipped |
| Compiler Snapshot | 16 | 17 | 94% | 8 skipped |
| CSS | 116 | 177 | 66% |  |
| Validator | 72 | 312 | 23% | 11 skipped |
| Compiler Errors | 61 | 118 | 52% | 26 skipped |
| Runtime Runes | 10 | 724 | 1% | 16 skipped |
| Runtime Legacy | 13 | 1198 | 1% |  |
| Runtime Browser | 0 | 30 | 0% |  |
| Hydration | 5 | 70 | 7% | 1 skipped |
| SSR | 8 | 80 | 10% |  |
| Sourcemaps | 0 | 0 | 0% |  |
| Preprocess | 0 | 0 | 0% | Not implemented |
| Print | 0 | 0 | 0% | Not implemented |
| Migrate | 0 | 0 | 0% | Not implemented |


### Incompatibilities

#### Parser Legacy: `javascript-comments` (1/83 tests)

This test is incompatible due to fundamental differences in how JavaScript comments are represented between OXC and acorn/ESTree.

**Root Cause:**

The official Svelte compiler uses acorn, which attaches comments directly to AST nodes as `leadingComments` and `trailingComments` arrays (ESTree format). This implementation uses OXC, which provides comments as a separate list rather than attaching them to individual nodes.

Converting OXC's comment list to ESTree's node-attached format would require complex heuristics to determine which comments belong to which nodes, and this transformation is not implemented.

**Impact:**

- This limitation only affects the legacy AST format (Svelte 4 compatibility mode)
- The modern parser (Svelte 5) is fully compatible (22/22 tests passing)
- Comment content is preserved in the source; only the AST representation differs
- This does not affect runtime behavior or compiled output

## Status

Work in Progress - Parser and core compiler implemented.

See [AGENTS.md](./AGENTS.md) for detailed progress tracking.

## License

MIT
