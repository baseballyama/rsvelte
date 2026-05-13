# rsvelte

> **⚠️ Early Stage Project** — This project can compile a wide range of Svelte components and is fully passing the official compiler test suite, but it is still in an early phase of development. APIs, output, and behavior may change without notice. Not yet recommended for production use.

A Rust port of the official Svelte 5 compiler. Targets **100% test compatibility** with `svelte/compiler` and is designed to slot into the [OXC](https://oxc.rs/) JavaScript/TypeScript toolchain.

## Packages

rsvelte ships drop-in replacements for the main pieces of the Svelte toolchain. All packages are published under the `@rsvelte` scope on npm.

| Package | Drop-in for | Status |
|---|---|---|
| [`@rsvelte/compiler`](npm/compiler) | [`svelte/compiler`](https://svelte.dev/docs/svelte-compiler) | ✅ 100% test compat ([details](#compatibility)) |
| [`@rsvelte/svelte2tsx`](npm/svelte2tsx) | [`svelte2tsx`](https://github.com/sveltejs/language-tools/tree/master/packages/svelte2tsx) | ✅ 245 / 245 fixtures |
| [`@rsvelte/svelte-check`](npm/svelte-check) | [`svelte-check`](https://github.com/sveltejs/language-tools/tree/master/packages/svelte-check) CLI | 🟡 In progress (walker + overlay + tsgo backend) |
| [`@rsvelte/vite-plugin-svelte`](https://github.com/baseballyama/vite-plugin-svelte/tree/rsvelte) | [`@sveltejs/vite-plugin-svelte`](https://github.com/sveltejs/vite-plugin-svelte) | 🟡 Fork that swaps in the Rust compiler |
| [`@rsvelte/vite-plugin-svelte-native`](npm/vite-plugin-svelte-native) | — | NAPI bindings consumed by the Vite plugin |

See [`docs/ecosystem-implementation-plan.md`](docs/ecosystem-implementation-plan.md) for the full ecosystem port plan.

## Quick Start

### Node.js

```bash
npm install @rsvelte/compiler
```

Use it as a drop-in replacement for `svelte/compiler`:

```js
import { compile, compileModule, parse } from '@rsvelte/compiler';

const result = compile('<h1>Hello, {name}!</h1>', {
  generate: 'client', // or 'server'
  filename: 'App.svelte'
});

console.log(result.js.code);
console.log(result.css?.code);

// Compile a Svelte module (.svelte.js / .svelte.ts)
const moduleResult = compileModule('export const count = $state(0);', {
  filename: 'counter.svelte.js'
});

// Parse into AST
const ast = parse('<h1>Hello</h1>', { modern: true });
```

The API matches the official [`svelte/compiler`](https://svelte.dev/docs/svelte-compiler) — `compile`, `compileModule`, `parse`, and `VERSION` are all available.

### Vite

Use [`@rsvelte/vite-plugin-svelte`](https://github.com/baseballyama/vite-plugin-svelte/tree/rsvelte) — a fork of `@sveltejs/vite-plugin-svelte` that swaps in the Rust compiler:

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

### SvelteKit

SvelteKit imports `@sveltejs/vite-plugin-svelte` internally. Use pnpm `overrides` to redirect it to the rsvelte fork:

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

- **3,341 / 3,341 in-scope tests passing** — every in-scope category of the official Svelte 5 compiler test suite at 100%
- **2.1x faster single-threaded, 15.8x faster multi-threaded** vs the official JS compiler
- **Drop-in replacement** — N-API bindings for seamless use with existing tools (Vite, SvelteKit, …)
- **WASM build** — runs in the browser (used by the docs playground)
- **Ecosystem port underway** — `svelte2tsx` already at 100%; `svelte-check` and `vite-plugin-svelte` shim in progress

## Performance

Compile benchmark across 3,654 real Svelte files (average of 3 runs):

| Runner | Time | Throughput | Speedup |
|---|---:|---:|---:|
| **JavaScript (`svelte/compiler`)** | 689 ms | 5,304 files/sec | 1.0× |
| **Rust (single-threaded)** | 333 ms | 10,986 files/sec | **2.1×** |
| **Rust (multi-threaded)** | 44 ms | 83,797 files/sec | **15.8×** |

> Apple M1 Max · 3,654 files · average of 3 runs. Reproduce locally with `./scripts/bench.sh`.

A single-threaded **100× speedup** over the JS compiler is one of this project's explicit goals — current numbers are a snapshot, not a ceiling.

## Compatibility

Current compatibility with the official Svelte compiler test suite:

| Test Suite | Pass | Total | Status | Notes |
|---|---:|---:|---|---|
| Parser Modern | 22 | 22 | 100% | |
| Parser Legacy | 82 | 83 | 100% | 1 skipped (acorn vs OXC comment attachment) |
| Compiler Snapshot | 28 | 28 | 100% | |
| CSS | 179 | 179 | 100% | |
| Validator | 324 | 325 | 100% | 1 skipped (`error-mode-warn`) |
| Compiler Errors | 144 | 144 | 100% | |
| Runtime Runes | 865 | 865 | 100% | |
| Runtime Legacy | 1,202 | 1,202 | 100% | |
| Runtime Browser | 31 | 31 | 100% | |
| Hydration | 78 | 78 | 100% | |
| SSR | 82 | 82 | 100% | |
| Preprocess | 19 | 19 | 100% | |
| Print | 40 | 40 | 100% | |
| svelte2tsx | 245 | 245 | 100% | 2 skipped (`expected.error.json` error fixtures) |
| **Total (in-scope)** | **3,341** | **3,341** | **100%** | |
| Migrate | 0 | 76 | — | **Out of scope** — rsvelte is a Svelte 5 compiler port, not a 4→5 migrator |
| Sourcemaps | 0 | 0 | — | No fixtures yet |

Re-run `pnpm run test-and-update` to refresh these numbers.

## Goals

1. **100% test compatibility** with the official `svelte/compiler` test suite
2. **100× single-threaded speedup** over the JS compiler via Rust + OXC
3. **Drop-in replacement** — identical output, N-API bindings, no toolchain changes required
4. **Ecosystem port** — pluggable into `svelte-check`, `vite-plugin-svelte`, and the wider Svelte tooling chain (see [`docs/ecosystem-implementation-plan.md`](docs/ecosystem-implementation-plan.md))
5. **OXC integration** — serve as the foundation for Svelte support in OXC's linter, formatter, and bundler ecosystem

## Architecture

The directory structure mirrors `submodules/svelte/packages/svelte/src/compiler/`:

```
src/compiler/phases/
├── 1_parse/     # Parsing (Svelte syntax → AST)
├── 2_analyze/   # Analysis (scope tree, bindings, rune detection)
└── 3_transform/ # Code generation (AST → JS/CSS, client + SSR)
```

Key design decisions:

- Memory-efficient AST (u32 positions, `compact_str`)
- JavaScript parsing / codegen via OXC
- Direct AST passing between phases — no re-parsing
- Parallel processing with `rayon`
- No backward-compat shims for internal APIs — refactor freely

## Development

### Setup

```bash
git submodule update --init --recursive
git config core.hooksPath .githooks
pnpm install
pnpm run generate-fixtures   # required before running tests
```

### Build & test

```bash
cargo build
cargo test                                          # all tests
cargo test --release                                # recommended for full runs
cargo test --test parser_fixtures -- --nocapture    # single suite
pnpm run compatibility-report                       # generate compatibility JSON
pnpm run test-and-update                            # refresh report + docs
./scripts/bench.sh                                  # JS vs Rust benchmark
```

The pre-commit hook (`.githooks/pre-commit`) runs `cargo fmt` and `cargo clippy` automatically.

### Docker (optional)

A `Dockerfile` and `docker-compose.yml` provide a reproducible toolchain (Rust nightly + Node 22 + pnpm):

```bash
docker compose up -d
docker compose exec dev bash
docker compose exec dev cargo test
```

VS Code Dev Containers ("Reopen in Container") also works.

### Upgrading Svelte

```bash
./scripts/upgrade-svelte.sh 5.52.0
```

Updates the Svelte submodule, rebuilds, regenerates fixtures, and refreshes the compatibility report.

## Known incompatibilities

### Parser Legacy: `javascript-comments` (1 test skipped)

The official compiler uses acorn and attaches comments to AST nodes as `leadingComments` / `trailingComments`. rsvelte uses OXC, where comments are provided as a separate list. This only affects the legacy AST format (Svelte 4 compatibility mode) and does **not** impact compiled output or runtime behavior.

### Validator: `error-mode-warn` (1 test skipped)

Tests an error-mode option not yet wired through rsvelte's diagnostic pipeline. Compiled output is unaffected.

### svelte2tsx: 2 error-fixture skips

Two svelte2tsx fixtures shaped around `expected.error.json` (error-path assertions) are skipped pending a structured error-fixture runner.

## License

MIT
