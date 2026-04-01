# svelte-compiler-rust

> **⚠️ Early Stage Project** — This project can compile a range of Svelte components, but it is still in an early phase of development. APIs, output, and behavior may change without notice. It is not yet recommended for production use.

A Rust implementation of the Svelte compiler with **100% test compatibility** with the official compiler.

## Quick Start

### Node.js

Install the package:

```bash
npm install @rsvelte/compiler
```

Use it as a drop-in replacement for `svelte/compiler`:

```js
import { compile, compileModule, parse } from '@rsvelte/compiler';

// Compile a Svelte component
const result = compile('<h1>Hello, {name}!</h1>', {
  generate: 'client', // or 'server'
  filename: 'App.svelte',
});

console.log(result.js.code);
console.log(result.css?.code);

// Compile a Svelte module (.svelte.js / .svelte.ts)
const moduleResult = compileModule('export const count = $state(0);', {
  filename: 'counter.svelte.js',
});

// Parse into AST
const ast = parse('<h1>Hello</h1>', { modern: true });
```

The API matches the official [`svelte/compiler`](https://svelte.dev/docs/svelte-compiler) — `compile`, `compileModule`, `parse`, and `VERSION` are all available.

### Using with Vite

Use [`@rsvelte/vite-plugin-svelte`](https://github.com/baseballyama/vite-plugin-svelte/tree/rsvelte) — a fork of `@sveltejs/vite-plugin-svelte` that uses the Rust compiler:

```bash
npm install -D @rsvelte/vite-plugin-svelte
```

```js
// vite.config.js
import { svelte } from '@rsvelte/vite-plugin-svelte';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [svelte()]
});
```

### Using with SvelteKit

SvelteKit imports `@sveltejs/vite-plugin-svelte` internally. Use pnpm `overrides` to swap it with the rsvelte fork:

```bash
pnpm add -D @rsvelte/vite-plugin-svelte
```

```json
// package.json
{
  "pnpm": {
    "overrides": {
      "@sveltejs/vite-plugin-svelte": "npm:@rsvelte/vite-plugin-svelte@^0.1.0"
    }
  }
}
```

Then run `pnpm install`. No changes to `vite.config.js` or `svelte.config.js` are needed.

### Rust

```rust
use rsvelte::{compile, CompileOptions};

let source = r#"<h1>Hello, {name}!</h1>"#;
let result = compile(source, CompileOptions::default()).unwrap();
println!("{}", result.js.code);
```

## Highlights

- **3,028 / 3,028 tests passing** — fully compatible with the official Svelte compiler test suite
- **1.9x faster single-threaded, 16.9x faster multi-threaded** (vs the official JS compiler)
- **Drop-in replacement** — N-API bindings for seamless use with existing tools (Vite, etc.)
- **WASM support** — runs in the browser

## Performance

Benchmark of 3,654 Svelte files (average of 3 runs):

**Compile (Client)**

| | Time | Throughput | Speedup |
|---|---:|---:|---:|
| **JavaScript (svelte/compiler)** | 656ms | 5,574 files/sec | 1.0x |
| **Rust (single-threaded)** | 351ms | 10,402 files/sec | **1.9x** |
| **Rust (multi-threaded)** | 39ms | 94,295 files/sec | **16.9x** |

**Compile (SSR)**

| | Time | Throughput | Speedup |
|---|---:|---:|---:|
| **JavaScript (svelte/compiler)** | 627ms | 5,831 files/sec | 1.0x |
| **Rust (single-threaded)** | 358ms | 10,208 files/sec | **1.8x** |
| **Rust (multi-threaded)** | 44ms | 82,971 files/sec | **14.2x** |

**Parse**

| | Time | Throughput | Speedup |
|---|---:|---:|---:|
| **JavaScript (svelte/compiler)** | 143ms | 25,561 files/sec | 1.0x |
| **Rust (single-threaded)** | 6ms | 576,000 files/sec | **22.5x** |
| **Rust (multi-threaded)** | 3ms | 1,278,621 files/sec | **50.0x** |

> Benchmark environment: Apple M1 Max, 3,654 test files, average of 3 runs

## Compatibility

Compatibility with the official Svelte compiler test suite:

| Test Suite | Pass | Total | Status |
|---|---:|---:|---|
| Parser Modern | 22 | 22 | 100% |
| Parser Legacy | 82 | 82 | 100% |
| Compiler Snapshot | 20 | 20 | 100% |
| CSS | 179 | 179 | 100% |
| Validator | 324 | 324 | 100% |
| Compiler Errors | 144 | 144 | 100% |
| Runtime Runes | 865 | 865 | 100% |
| Runtime Legacy | 1,202 | 1,202 | 100% |
| Runtime Browser | 31 | 31 | 100% |
| Hydration | 77 | 77 | 100% |
| SSR | 82 | 82 | 100% |
| **Total** | **3,028** | **3,028** | **100%** |

Unimplemented suites: Preprocess, Print, Migrate (not included in compatibility tests)

## Goals

1. **Fully compatible drop-in replacement for the Svelte compiler** — produce identical output to the official compiler, usable with all existing toolchains
2. **Integration into [svelte-check](https://github.com/sveltejs/language-tools)** — faster type checking and diagnostics
3. **Integration into [Rolldown](https://rolldown.rs/)** — speed up the build pipeline for Svelte projects
4. **Integration into [oxlint](https://oxc.rs/docs/guide/usage/linter)** — lint support for Svelte files
5. **Integration into [oxfmt](https://oxc.rs/)** — formatter support for Svelte files
6. **Integration with the [OXC](https://oxc.rs/) ecosystem** — serve as the foundation for Svelte support in OXC's JavaScript/TypeScript toolchain

## Architecture

The directory structure mirrors the official Svelte compiler (`svelte/packages/svelte/src/compiler/`).

```
src/compiler/phases/
├── 1_parse/     # Parsing (Svelte syntax → AST)
├── 2_analyze/   # Analysis (scope tree, bindings)
└── 3_transform/ # Code generation (AST → JS/CSS)
```

Key design decisions:

- Memory-efficient AST representation (u32 positions, compact_str)
- Parallel processing with rayon
- JavaScript parsing and code generation via OXC
- Direct AST passing between phases (no re-parsing)

## Development

### Setup

```bash
git submodule update --init --recursive
npm install
npm run generate-fixtures  # Required before running tests
```

### Build & Test

```bash
cargo build                # Build
cargo test                 # Run tests
cargo test --release       # Run tests with release build (recommended)
cargo bench                # Run benchmarks
```

### Docker (Optional)

```bash
./docker-dev.sh build      # Build Docker image
./docker-dev.sh up         # Start container
./docker-dev.sh shell      # Open shell inside container
./docker-dev.sh test       # Run tests
```

You can also use the VS Code Dev Containers extension — select "Reopen in Container".

### Upgrading Svelte

```bash
./scripts/upgrade-svelte.sh 5.52.0
```

Automatically updates the Svelte submodule version, builds the compiler, regenerates fixtures, and updates the compatibility report.

## Known Incompatibilities

### Parser Legacy: `javascript-comments` (1 test skipped)

The official compiler uses acorn and attaches comments to AST nodes as `leadingComments` / `trailingComments`. This implementation uses OXC, where comments are provided as a separate list. This only affects the legacy AST format (Svelte 4 compatibility mode) and does not impact compiled output or runtime behavior.

## License

MIT
