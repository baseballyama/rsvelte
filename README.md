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

### Docker (Recommended)

We recommend using Docker for development. It avoids performance issues caused by security software.

```bash
# Build Docker image
./docker-dev.sh build

# Start development container
./docker-dev.sh up

# Open a shell inside the container
./docker-dev.sh shell

# Run tests inside the container
./docker-dev.sh test

# Run any command
./docker-dev.sh run cargo build --release

# Stop the container
./docker-dev.sh down
```

If you use VS Code, select "Reopen in Container" with the Dev Containers extension.

### Local (Alternative)

To develop locally:

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

### Upgrading Svelte

Use the upgrade script to update the Svelte submodule version. The `compiler/index.js` is a build artifact (in `.gitignore`), so switching the submodule alone will leave an old compiler and generate wrong fixtures.

```bash
./scripts/upgrade-svelte.sh 5.52.0
```

This script does the following automatically:

1. Checkout the submodule to the specified version
2. Build the Svelte compiler from source (`pnpm build`)
3. Regenerate test fixtures
4. Run the compatibility report
5. Update documentation
6. Update the docs site runtime version

## Compatibility

Current compatibility with the official Svelte compiler test suite:

| Test Suite | Passing | Total | Coverage | Notes |
|------------|---------|-------|----------|-------|
| Parser Modern | 22 | 22 | 100% |  |
| Parser Legacy | 82 | 82 | 100% | 1 skipped |
| Compiler Snapshot | 20 | 20 | 100% |  |
| CSS | 179 | 179 | 100% |  |
| Validator | 324 | 324 | 100% |  |
| Compiler Errors | 144 | 144 | 100% |  |
| Runtime Runes | 865 | 865 | 100% |  |
| Runtime Legacy | 1202 | 1202 | 100% |  |
| Runtime Browser | 31 | 31 | 100% |  |
| Hydration | 77 | 77 | 100% |  |
| SSR | 82 | 82 | 100% |  |
| Sourcemaps | 0 | 0 | 0% |  |
| Preprocess | 0 | 0 | 0% | Not implemented |
| Print | 0 | 0 | 0% | Not implemented |
| Migrate | 0 | 0 | 0% | Not implemented |


### Known Incompatibilities

#### Parser Legacy: `javascript-comments` (1/83 tests)

This test is incompatible due to differences in how JavaScript comments are handled between OXC and acorn/ESTree.

**Root Cause:**

The official Svelte compiler uses acorn, which attaches comments directly to AST nodes as `leadingComments` and `trailingComments` arrays (ESTree format). This implementation uses OXC, which provides comments as a separate list instead of attaching them to individual nodes.

Converting OXC's comment list to ESTree's node-attached format would require complex heuristics to determine which comments belong to which nodes. This conversion is not implemented.

**Impact:**

- This only affects the legacy AST format (Svelte 4 compatibility mode)
- The modern parser (Svelte 5) is fully compatible (22/22 tests passing)
- Comment content is preserved in the source; only the AST representation differs
- This does not affect runtime behavior or compiled output

## Status

All compiler test suites passing at 100% (3028/3028 tests).

## License

MIT
