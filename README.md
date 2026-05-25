# rsvelte

> **⚠️ Early Stage Project** — rsvelte already passes the official Svelte 5 compiler test suite end-to-end, but it's still pre-1.0. APIs, output, and behaviour may change without notice. Use it in production at your own risk.

**A Rust port of the official Svelte 5 compiler, built to slot natively into the [OXC](https://oxc.rs/) ecosystem.**

## Why rsvelte exists

The end goal isn't "another Svelte compiler" — it's making Svelte a first-class citizen of OXC's Rust-native JavaScript/TypeScript toolchain.

Today, the native JS toolchain that has grown up around OXC — `oxlint`, `oxfmt`, [Rolldown](https://rolldown.rs/), and [`tsgo`](https://github.com/microsoft/typescript-go) (wired into `oxlint` via [`tsgolint`](https://github.com/oxc-project/tsgolint)) — can only see `.js` / `.ts` / `.jsx` / `.tsx` files. `.svelte` files are invisible to them because parsing Svelte requires running the JavaScript-based Svelte compiler, which native tools can't and won't link against. The result: Svelte developers don't get the order-of-magnitude speed-ups that the rest of the JS ecosystem is starting to take for granted.

rsvelte fixes that at the source. By porting the compiler — **and** the surrounding ecosystem hot paths (`svelte2tsx`, `svelte-check`, `vite-plugin-svelte`) — to Rust on top of OXC's own parser, codegen, and semantic stack, rsvelte gives OXC a Svelte surface it can call into directly. Once upstreamed, that surface unlocks:

- **`oxlint`** — lint `<script>` blocks and Svelte-specific patterns at OXC speed (a Rust path forward for `eslint-plugin-svelte`).
- **`oxfmt`** — format `.svelte` files alongside the rest of the project (a Rust path forward for `prettier-plugin-svelte`).
- **Rolldown** — native bundling of Svelte projects through OXC's parser stack, without a JS-side compiler hop.
- **`tsgo` + `tsgolint`** — type-checking and type-aware linting over `.svelte` files. Already wired into `@rsvelte/svelte-check` today as the correctness bridge.

Until we get there, the drop-in replacement story — `@rsvelte/compiler`, `@rsvelte/svelte-check`, `@rsvelte/vite-plugin-svelte` — lets you use rsvelte today and acts as the correctness bridge that proves the Rust port is byte-identical to upstream Svelte.

## Packages

All packages ship under the `@rsvelte` scope on npm.

| Package | Drop-in for | Status |
|---|---|---|
| [`@rsvelte/compiler`](npm/compiler) | [`svelte/compiler`](https://svelte.dev/docs/svelte-compiler) (wasm) | ✅ 100% test compat ([details](#compatibility)) |
| [`@rsvelte/svelte2tsx`](npm/svelte2tsx) | [`svelte2tsx`](https://github.com/sveltejs/language-tools/tree/master/packages/svelte2tsx) | ✅ 245 / 245 fixtures |
| [`@rsvelte/svelte-check`](npm/svelte-check) | [`svelte-check`](https://github.com/sveltejs/language-tools/tree/master/packages/svelte-check) CLI | ✅ v1.0 — walker + overlay + tsgo backend + incremental + watch |
| [`@rsvelte/vite-plugin-svelte`](https://github.com/baseballyama/vite-plugin-svelte/tree/rsvelte) | [`@sveltejs/vite-plugin-svelte`](https://github.com/sveltejs/vite-plugin-svelte) | ✅ v1.0 — fork that routes through the NAPI compiler |
| [`@rsvelte/vite-plugin-svelte-native`](npm/vite-plugin-svelte-native) | — | NAPI bindings the Vite plugin and other Node tools consume |

See [`docs/ecosystem-implementation-plan.md`](docs/ecosystem-implementation-plan.md) for the full ecosystem port plan, including which upstream tools are intentionally **out of scope** (and where they're being routed instead — usually back to OXC).

## Quick start

### Use as `svelte/compiler` (wasm)

```bash
npm install @rsvelte/compiler
```

```js
import { compile, compileModule, parse, VERSION } from '@rsvelte/compiler';

const result = compile('<h1>Hello, {name}!</h1>', {
  generate: 'client',     // or 'server'
  filename: 'App.svelte',
});

console.log(result.js.code);
console.log(result.css?.code);

// Compile a Svelte module (.svelte.js / .svelte.ts)
const moduleResult = compileModule('export const count = $state(0);', {
  filename: 'counter.svelte.js',
});

// Parse to AST
const ast = parse('<h1>Hello</h1>', { modern: true });

console.log(VERSION); // upstream Svelte version this build targets
```

The public surface mirrors [`svelte/compiler`](https://svelte.dev/docs/svelte-compiler) — `compile`, `compileModule`, `parse`, and `VERSION` are all available. Output is byte-identical to the official compiler on every in-scope fixture (see [Compatibility](#compatibility)).

> **Heads-up:** a few function-valued options can't cross the wasm / NAPI boundary. See [Compiler option compatibility](#compiler-option-compatibility) before passing `cssHash` or `warningFilter`.

### Use with Vite

[`@rsvelte/vite-plugin-svelte`](https://github.com/baseballyama/vite-plugin-svelte/tree/rsvelte) is a fork of `@sveltejs/vite-plugin-svelte` that swaps in the rsvelte compiler. The public API matches upstream exactly — your `vite.config.js` doesn't need to change.

```bash
npm install -D @rsvelte/vite-plugin-svelte
```

```js
// vite.config.js
import { svelte } from '@rsvelte/vite-plugin-svelte';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [svelte()],
});
```

### Use with SvelteKit

SvelteKit pulls in `@sveltejs/vite-plugin-svelte` internally, so the cleanest swap is a package-manager override that redirects the upstream plugin to the rsvelte fork. With pnpm:

```bash
pnpm add -D @rsvelte/vite-plugin-svelte
```

```jsonc
// package.json
{
  "pnpm": {
    "overrides": {
      "@sveltejs/vite-plugin-svelte": "npm:@rsvelte/vite-plugin-svelte@^0.1.0"
    }
  }
}
```

Then `pnpm install`. No changes to `vite.config.js` or `svelte.config.js` are needed. (npm and yarn ship equivalent `overrides` / `resolutions` fields if you prefer those.)

### Type-check with `svelte-check`

`@rsvelte/svelte-check` is a drop-in CLI replacement for `svelte-check`, backed by a Rust walker plus a tsgo overlay for `<script lang="ts">` diagnostics.

```bash
npm install -D @rsvelte/svelte-check
npx svelte-check
```

Common flags:

```bash
npx svelte-check --workspace .              # type-check the current workspace
npx svelte-check --tsgo                     # run tsgo against the .svelte overlay (recommended)
npx svelte-check --watch                    # re-check on file changes
npx svelte-check --incremental              # reuse cached overlay between runs
npx svelte-check --output machine           # JSON-friendly output for CI
npx svelte-check --fail-on-warnings         # treat warnings as errors
npx svelte-check --compiler-warnings "css-unused-selector:ignore"
```

See `npx svelte-check --help` for the full list. The CLI flag set is a superset of upstream's — every upstream flag works, plus a few rsvelte-specific ones (`--tsgo`, `--emit-overlay`).

### Convert `.svelte` to `.tsx` (`svelte2tsx`)

```bash
npm install @rsvelte/svelte2tsx
```

```js
import { svelte2tsx } from '@rsvelte/svelte2tsx';

const result = await svelte2tsx('<h1>Hello, {name}!</h1>', {
  filename: 'App.svelte',
  isTsFile: true,
  mode: 'ts',          // or 'dts' to emit a declaration file
  version: '5',
});

console.log(result.code);          // the synthesised .tsx
console.log(result.exportedNames); // { props, all }
```

Useful if you're building your own language tooling on top of the same surface `svelte-check`, the Svelte language server, and `tsc` all rely on.

### Embed in a Rust crate

```toml
[dependencies]
svelte-compiler-rust = { git = "https://github.com/baseballyama/rsvelte" }
```

```rust
use svelte_compiler_rust::{compile, CompileOptions};

let source = r#"<h1>Hello, {name}!</h1>"#;
let result = compile(source, CompileOptions::default()).unwrap();
println!("{}", result.js.code);
```

The Rust API is the same surface OXC will eventually wire `oxlint` / `oxfmt` into. Unlike the JS surface, the Rust `CompileOptions` honours **every** field — including `css_hash` and `warning_filter` as real Rust closures.

### Call from C / Go / PHP / Ruby / Zig / Java / …

A `cdylib` exposing a stable C ABI ships in [`crates/rsvelte_capi`](crates/rsvelte_capi). One shared library + one cbindgen-generated header (`rsvelte.h`) lets any language with a C FFI drive the same compiler — UTF-8 JSON in, UTF-8 JSON out, no per-language schema generation.

**Download prebuilt binaries** from [GitHub Releases](https://github.com/baseballyama/rsvelte/releases) under the `capi-vX.Y.Z` tag scheme (`darwin-{arm64,x64}`, `linux-{x64,arm64}-gnu`, `win32-x64-msvc`; each archive ships the dylib + static archive + `rsvelte.h` + checksums):

```bash
VERSION=0.1.1 TRIPLE=darwin-arm64
curl -L "https://github.com/baseballyama/rsvelte/releases/download/capi-v${VERSION}/rsvelte_capi-${VERSION}-${TRIPLE}.tar.gz" | tar -xz
```

Or build from source:

```bash
cargo build -p rsvelte_capi --release
# → target/release/librsvelte_capi.{dylib,so,a}, rsvelte_capi.dll
# → crates/rsvelte_capi/include/rsvelte.h (regenerated via cbindgen)
```

Ready-to-run smoke tests are shipped — and run in CI on every PR — for **C, Go, Python, Ruby, Zig, PHP, and Java (JDK 22+ FFM)**. Drift in the generated header or any `CompileOption` deserializer is caught by 35 cargo integration tests + a `RSVELTE_CAPI_CHECK_HEADER=1` build guard. See [`crates/rsvelte_capi/README.md`](crates/rsvelte_capi/README.md) for the full API, JSON envelope shape, memory ownership rules, and the per-language quick-start table.

## Compiler option compatibility

The JS-facing surfaces (`@rsvelte/compiler` wasm bundle, `@rsvelte/vite-plugin-svelte-native` NAPI bindings) accept the full `svelte/compiler#CompileOptions` shape, but **function-valued** options can't currently cross the language boundary. The Rust core has no way to call back into JavaScript, so callback-shaped fields are accepted (so the TypeScript types stay drop-in compatible with upstream Svelte) and then **silently ignored**.

If your build relies on any of these, the value won't take effect. Use the workarounds below.

| Option | Behaviour in rsvelte (JS surface) | Workaround |
|---|---|---|
| `cssHash({ hash, name, filename, css }) => string` | Ignored. CSS scope classes fall back to the default `svelte-<base36hash>` scheme — identical to upstream Svelte's default `cssHash`. | Pre-compute the hash on the JS side and pass it as `cssHashOverride: '<hash>'` — an rsvelte-specific extension that injects a deterministic string. |
| `warningFilter(warning) => boolean` | Ignored. All compiler warnings are returned unfiltered. | Filter `result.warnings` yourself after compilation. |

Everything else (`generate`, `css`, `dev`, `hmr`, `sourcemap`, `runes`, `compatibility`, `experimental.async`, `preserveComments`, `preserveWhitespace`, `customElement`, `accessors`, `namespace`, `immutable`, `modernAst`, `discloseVersion`, `outputFilename`, `cssOutputFilename`, …) matches upstream exactly. The full list of accepted fields is mirrored in [`npm/vite-plugin-svelte-native/index.d.ts`](npm/vite-plugin-svelte-native/index.d.ts).

The Rust API (`svelte_compiler_rust::compile`) has no such restriction — `css_hash: Option<CssHashFn>` and `warning_filter: Option<WarningFilterFn>` work as real `Arc<dyn Fn>` closures.

## Performance

Per-task benchmark across 3,637 real `.svelte` files, 10 iterations (3 warmup), against the official `svelte/compiler`:

| Task | JS (`svelte/compiler`) | Rust (single-threaded) | Rust (multi-threaded) | Multi vs JS |
|---|---:|---:|---:|---:|
| **Full pipeline** — parse / analyze / codegen | 864.8 ms | 381.1 ms | 50.1 ms | **17.3×** |
| **Parser only** — phase 1, isolated | 187.5 ms | 8.7 ms | 1.9 ms | **99.5×** |
| **`svelte2tsx`** — `.svelte` → `.tsx` generation | 306.1 ms | 115.3 ms | 16.0 ms | **19.1×** |
| **`svelte-check`** — CLI, 500-file workspace | 2,088.0 ms | 46.9 ms | 13.8 ms | **151.5×** |

> Apple M1 Pro · 10-core arm64 · 3,637 `.svelte` files · 10 iterations (3 warmup). Recorded 2026-05-24 at commit `da6b3c8`. Live numbers, charts, and reproduction steps live on the [benchmark page](https://baseballyama.github.io/rsvelte/benchmark) (or run `node scripts/run-benchmark.mjs > docs/static/benchmark-results.json` locally).

A single-threaded **100× speedup** over the JS compiler is one of this project's explicit goals — the parser is already at multi-threaded `99.5×` and `svelte-check` at `151.5×`, but the full pipeline is still climbing. Current numbers are a snapshot, not a ceiling.

## Compatibility

<!-- svelte-target-version -->
**Targeting Svelte `v5.53.6`** ([`d4c78292ed66`](https://github.com/sveltejs/svelte/commit/d4c78292ed66)) — automatically maintained by `pnpm run update-docs`.
<!-- /svelte-target-version -->

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

1. **OXC ecosystem integration** — be the Svelte surface that `oxlint`, `oxfmt`, Rolldown, and `tsgo` (via `tsgolint`) all link against. This is the project's reason for existing; everything else is a step toward it.
2. **100% test compatibility** with the official `svelte/compiler` test suite — keeps the Rust port provably equivalent to upstream while OXC integration lands.
3. **100× single-threaded speedup** over the JS compiler via Rust + OXC.
4. **Drop-in replacements** for the ecosystem hot paths (`svelte/compiler`, `svelte-check`, `vite-plugin-svelte`, `svelte2tsx`) so you can adopt rsvelte today without touching the rest of your build.
5. **Ecosystem port** — see [`docs/ecosystem-implementation-plan.md`](docs/ecosystem-implementation-plan.md) for the multi-wave plan.

## Architecture

The directory structure mirrors `submodules/svelte/packages/svelte/src/compiler/`:

```
src/compiler/phases/
├── 1_parse/     # Parsing (Svelte syntax → AST)
├── 2_analyze/   # Analysis (scope tree, bindings, rune detection)
└── 3_transform/ # Code generation (AST → JS/CSS, client + SSR)
```

Key design decisions:

- JavaScript parsing, semantic analysis, and codegen all run on OXC — the same crates `oxlint` / `oxfmt` use, so the OXC integration target stays cheap.
- Memory-efficient AST (u32 positions, `compact_str`, `bumpalo`-arena allocation on hot paths).
- Direct AST passing between phases — no re-parsing.
- Parallel processing with `rayon`.
- No backward-compat shims for internal APIs — refactor freely.

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

### Function-valued compiler options (JS surface)

See [Compiler option compatibility](#compiler-option-compatibility). The Rust API is unaffected.

## License

MIT
