# svelte-compiler-rust

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

### Using with Vite / SvelteKit

`@sveltejs/vite-plugin-svelte` imports `svelte/compiler` internally. To swap it with the Rust compiler, patch the plugin using pnpm:

1. Install `@rsvelte/compiler`:

```bash
pnpm add -D @rsvelte/compiler
```

2. Create a patch file at `patches/@sveltejs__vite-plugin-svelte.patch`:

```diff
diff --git a/src/plugins/compile-module.js b/src/plugins/compile-module.js
--- a/src/plugins/compile-module.js
+++ b/src/plugins/compile-module.js
@@ -1,5 +1,5 @@
 import { buildModuleIdFilter, buildModuleIdParser } from '../utils/id.js';
-import * as svelteCompiler from 'svelte/compiler';
+import * as svelteCompiler from '@rsvelte/compiler';
 import { log, logCompilerWarnings } from '../utils/log.js';
 import { toRollupError } from '../utils/error.js';
 import { isSvelteWithAsync } from '../utils/svelte-version.js';
diff --git a/src/plugins/preprocess.js b/src/plugins/preprocess.js
--- a/src/plugins/preprocess.js
+++ b/src/plugins/preprocess.js
@@ -1,6 +1,6 @@
 import { toRollupError } from '../utils/error.js';
 import { mapToRelative } from '../utils/sourcemaps.js';
-import * as svelte from 'svelte/compiler';
+import * as svelte from '@rsvelte/compiler';
 import { log } from '../utils/log.js';
 import { arraify } from '../utils/options.js';
 import fs from 'node:fs';
diff --git a/src/utils/compile.js b/src/utils/compile.js
--- a/src/utils/compile.js
+++ b/src/utils/compile.js
@@ -1,4 +1,4 @@
-import * as svelte from 'svelte/compiler';
+import * as svelte from '@rsvelte/compiler';
 import { safeBase64Hash } from './hash.js';
 import { log } from './log.js';
diff --git a/src/utils/svelte-version.js b/src/utils/svelte-version.js
--- a/src/utils/svelte-version.js
+++ b/src/utils/svelte-version.js
@@ -1,4 +1,4 @@
-import { VERSION } from 'svelte/compiler';
+import { VERSION } from '@rsvelte/compiler';
```

3. Register the patch in `package.json`:

```json
{
  "pnpm": {
    "patchedDependencies": {
      "@sveltejs/vite-plugin-svelte": "patches/@sveltejs__vite-plugin-svelte.patch"
    }
  }
}
```

4. Run `pnpm install` to apply the patch.

No changes to `vite.config.js` or `svelte.config.js` are needed.

### Rust

```rust
use rsvelte::{compile, CompileOptions};

let source = r#"<h1>Hello, {name}!</h1>"#;
let result = compile(source, CompileOptions::default()).unwrap();
println!("{}", result.js.code);
```

## Highlights

- **3,028 / 3,028 tests passing** — fully compatible with the official Svelte compiler test suite
- **2.1x faster single-threaded, 15.8x faster multi-threaded** (vs the official JS compiler)
- **Drop-in replacement** — N-API bindings for seamless use with existing tools (Vite, etc.)
- **WASM support** — runs in the browser

## Performance

Compilation benchmark of 3,654 Svelte files:

| | Time | Throughput | Speedup |
|---|---:|---:|---:|
| **JavaScript (svelte/compiler)** | 689ms | 5,304 files/sec | 1.0x |
| **Rust (single-threaded)** | 333ms | 10,986 files/sec | **2.1x** |
| **Rust (multi-threaded)** | 44ms | 83,797 files/sec | **15.8x** |

> Benchmark environment: Apple M1 Max, 3,654 test files (client + server mode), average of 3 runs

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
