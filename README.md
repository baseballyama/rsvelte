<p align="center">
  <img src="assets/logo.png" alt="rsvelte" width="200" height="200" />
</p>

<h1 align="center">rsvelte</h1>

<p align="center">
  <strong>A Rust port of the official Svelte 5 compiler, built to slot natively into the <a href="https://oxc.rs/">OXC</a> ecosystem.</strong>
</p>

<p align="center">
  <a href="https://app.codspeed.io/baseballyama/rsvelte?utm_source=badge"><img src="https://img.shields.io/endpoint?url=https://codspeed.io/badge.json" alt="CodSpeed"/></a>
</p>

> **⚠️ Early Stage Project** — rsvelte already passes the official Svelte 5 compiler test suite end-to-end, but it's still pre-1.0. APIs, output, and behaviour may change without notice. Use it in production at your own risk.

## Why rsvelte exists

The end goal isn't "another Svelte compiler" — it's making Svelte a first-class citizen of OXC's Rust-native JavaScript/TypeScript toolchain.

Today, the native JS toolchain that has grown up around OXC — `oxlint`, `oxfmt`, [Rolldown](https://rolldown.rs/), and [`tsgo`](https://github.com/microsoft/typescript-go) (wired into `oxlint` via [`tsgolint`](https://github.com/oxc-project/tsgolint)) — can only see `.js` / `.ts` / `.jsx` / `.tsx` files. `.svelte` files are invisible to them because parsing Svelte requires running the JavaScript-based Svelte compiler, which native tools can't and won't link against. The result: Svelte developers don't get the order-of-magnitude speed-ups that the rest of the JS ecosystem is starting to take for granted.

rsvelte fixes that at the source. By porting the compiler — **and** the surrounding ecosystem hot paths (`svelte2tsx`, `svelte-check`, `vite-plugin-svelte`) — to Rust on top of OXC's own parser, codegen, and semantic stack, rsvelte gives OXC a Svelte surface it can call into directly. Once upstreamed, that surface unlocks:

- **`oxlint`** — lint `<script>` blocks and Svelte-specific patterns at OXC speed (a Rust path forward for `eslint-plugin-svelte`).
- **`oxfmt`** — format `.svelte` files alongside the rest of the project (a Rust path forward for `prettier-plugin-svelte`). The standalone [`rsvelte-fmt`](#format-svelte-files-rsvelte-fmt) CLI proves this path today.
- **Rolldown** — native bundling of Svelte projects through OXC's parser stack, without a JS-side compiler hop.
- **`tsgo` + `tsgolint`** — type-checking and type-aware linting over `.svelte` files. Already wired into `@rsvelte/svelte-check` today as the correctness bridge.

Until we get there, the drop-in replacement story — `@rsvelte/compiler`, `@rsvelte/svelte-check`, `@rsvelte/vite-plugin-svelte` — lets you use rsvelte today and acts as the correctness bridge that proves the Rust port is byte-identical to upstream Svelte.

## Packages

All packages ship under the `@rsvelte` scope on npm.

| Package | Drop-in for | Status |
|---|---|---|
| [`@rsvelte/compiler`](apps/npm/compiler) | [`svelte/compiler`](https://svelte.dev/docs/svelte-compiler) (wasm) | ✅ 100% test compat ([details](#compatibility)) |
| [`@rsvelte/svelte2tsx`](apps/npm/svelte2tsx) | [`svelte2tsx`](https://github.com/sveltejs/language-tools/tree/master/packages/svelte2tsx) | ✅ 245 / 245 fixtures |
| [`@rsvelte/svelte-check`](apps/npm/svelte-check) | [`svelte-check`](https://github.com/sveltejs/language-tools/tree/master/packages/svelte-check) CLI | ✅ v1.0 — walker + overlay + tsgo backend + incremental + watch |
| [`@rsvelte/vite-plugin-svelte`](https://github.com/baseballyama/rsvelte/tree/main/apps/npm/vite-plugin-svelte) | [`@sveltejs/vite-plugin-svelte`](https://github.com/sveltejs/vite-plugin-svelte) | ✅ v1.0 — fork that routes through the NAPI compiler |
| [`@rsvelte/vite-plugin-svelte-native`](apps/npm/vite-plugin-svelte-native) | — | NAPI bindings the Vite plugin and other Node tools consume |

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

The public surface mirrors [`svelte/compiler`](https://svelte.dev/docs/svelte-compiler) — `compile`, `compileModule`, `parse`, and `VERSION` are all available. Output is byte-identical to the official compiler on every in-scope fixture (see [Compatibility](#compatibility)). It also matches the official compiler on over 99% of a corpus spanning real projects, Svelte's own fixtures, and svelte.dev docs — after normalization that treats cosmetic-only differences like line-wrapping as equivalent (see [Real-world corpus testing](#real-world-corpus-testing)).

> **Heads-up:** a few function-valued options can't cross the wasm / NAPI boundary. See [Compiler option compatibility](#compiler-option-compatibility) before passing `cssHash` or `warningFilter`.

### Use with Vite

[`@rsvelte/vite-plugin-svelte`](https://github.com/baseballyama/rsvelte/tree/main/apps/npm/vite-plugin-svelte) is a fork of `@sveltejs/vite-plugin-svelte` that swaps in the rsvelte compiler. The public API matches upstream exactly — your `vite.config.js` doesn't need to change.

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
npx svelte-check --workspace .              # type-check the current workspace (uses tsc)
npx svelte-check --tsgo                     # type-check with tsgo instead of tsc (faster)
npx svelte-check --no-type-check            # Svelte diagnostics only, skip TypeScript
npx svelte-check --watch                    # re-check on file changes
npx svelte-check --incremental              # reuse cached overlay between runs
npx svelte-check --output machine           # JSON-friendly output for CI
npx svelte-check --fail-on-warnings         # treat warnings as errors
npx svelte-check --compiler-warnings "css-unused-selector:ignore"
```

Type-checking is on by default and runs the stock `tsc` against the
`.svelte` overlay; pass `--tsgo` to prefer Microsoft's native `tsgo`
instead, or `--no-type-check` to report only Svelte-side diagnostics.

See `npx svelte-check --help` for the full list. The CLI flag set is a superset of upstream's — every upstream flag works, plus a few rsvelte-specific ones (`--tsgo`, `--no-type-check`, `--emit-overlay`).

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

### Format `.svelte` files (`rsvelte-fmt`)

`rsvelte-fmt` is a Rust-native formatter for Svelte projects — one CLI that formats `.svelte` files **in-process** (no Node, no Prettier doc-IR round-trip) and routes `.js` / `.ts` / `.jsx` / `.tsx` / `.json` / `.css` to [`oxfmt`](https://oxc.rs/docs/guide/usage/formatter), with both pipelines running in parallel. It's the standalone proof of the `oxfmt` integration goal above; the `.svelte` engine itself lives in the [`rsvelte_formatter`](crates/rsvelte_formatter) library crate.

Install from npm — prebuilt binaries ship for macOS / Linux / Windows:

```bash
npm install -D @rsvelte/fmt
npx rsvelte-fmt --help
```

```bash
npx rsvelte-fmt src/                 # format in place, recursively
npx rsvelte-fmt --check src/         # exit 1 if anything would change (CI gate)
cat App.svelte | npx rsvelte-fmt --stdin --stdin-filepath App.svelte   # editor integration
```

[`oxfmt`](https://www.npmjs.com/package/oxfmt) formats the non-`.svelte` files (and `<style>` CSS); it's an **optional peer dependency** — `npm install -D oxfmt` and the loader resolves it automatically (or pass `--oxfmt-bin <path>`). Without it, `.svelte` markup still formats and the other files are skipped.

Prefer to build from source? `cargo build --release -p rsvelte_fmt` produces `./target/release/rsvelte-fmt`. See [`crates/rsvelte_fmt/README.md`](crates/rsvelte_fmt/README.md) for all flags, exit codes, and how it compares to `oxfmt + prettier-plugin-svelte`, or the [`@rsvelte/fmt`](apps/npm/fmt) package README for npm-specific details.

### Embed in a Rust crate

```toml
[dependencies]
rsvelte_core = { git = "https://github.com/baseballyama/rsvelte" }
```

```rust
use rsvelte_core::{compile, CompileOptions};

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

Everything else (`generate`, `css`, `dev`, `hmr`, `sourcemap`, `runes`, `compatibility`, `experimental.async`, `preserveComments`, `preserveWhitespace`, `customElement`, `accessors`, `namespace`, `immutable`, `modernAst`, `discloseVersion`, `outputFilename`, `cssOutputFilename`, …) matches upstream exactly. The full list of accepted fields is mirrored in [`apps/npm/vite-plugin-svelte-native/index.d.ts`](apps/npm/vite-plugin-svelte-native/index.d.ts).

The Rust API (`rsvelte_core::compile`) has no such restriction — `css_hash: Option<CssHashFn>` and `warning_filter: Option<WarningFilterFn>` work as real `Arc<dyn Fn>` closures.

## Performance

Per-task benchmark across 3,852 real `.svelte` files, 10 iterations (3 warmup). Each task is measured against its JavaScript counterpart — `svelte/compiler` for the compiler phases, `svelte2tsx`, `svelte-check`, and `prettier-plugin-svelte` for `fmt`:

| Task | JS baseline | Rust (single-threaded) | Rust (multi-threaded) | Multi vs JS |
|---|---:|---:|---:|---:|
| **Full pipeline** — parse / analyze / codegen | 807.5 ms | 436.5 ms | 61.2 ms | **13.2×** |
| **Parser only** — phase 1, isolated | 210.9 ms | 9.9 ms | 2.2 ms | **96.3×** |
| **`svelte2tsx`** — `.svelte` → `.tsx` generation | 328.3 ms | 130.0 ms | 17.2 ms | **19.0×** |
| **`fmt`** — formatter, `.svelte` sources | 3,475.9 ms | 98.2 ms | 17.0 ms | **204.2×** |
| **`svelte-check`** — CLI, 500-file workspace | 2,086.9 ms | 50.6 ms | 14.3 ms | **145.5×** |

> Apple M1 Pro · 10-core arm64 · 3,852 `.svelte` files · 10 iterations (3 warmup). Recorded 2026-06-06 on the latest `main`. Live numbers, charts, and reproduction steps live on the [benchmark page](https://baseballyama.github.io/rsvelte/benchmark) (or run `pnpm run generate-benchmark` locally).

A single-threaded **100× speedup** over the JS compiler is one of this project's explicit goals — `fmt` already lands at multi-threaded `204.2×` (and `35.4×` single-threaded) against `prettier-plugin-svelte`, the parser at `96.3×`, and `svelte-check` at `145.5×`, while the full pipeline is still climbing. Current numbers are a snapshot, not a ceiling.

## Compatibility

<!-- svelte-target-version -->
**Targeting Svelte `v5.56.3`** ([`a9f48540e236`](https://github.com/sveltejs/svelte/commit/a9f48540e236)) — automatically maintained by `pnpm run update-docs`.
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

## Real-world corpus testing

Passing the official fixture suite proves rsvelte is correct on the cases Svelte's own authors thought to test. But a drop-in replacement has to be correct on the code *real projects actually ship* — namespaced components, `$props.id()` ordering, `{@const}`-in-snippet, long `{@render}` wrapping, and a thousand other shapes that rarely show up in curated fixtures. So on top of the fixture suite, rsvelte runs a continuously growing **output-equality corpus**: it compiles thousands of units of real Svelte source with **both** the official compiler and rsvelte, and asserts the outputs match after comparison-side normalization (described below).

The corpus spans ~11,900 compile units: every `.svelte` / `.svelte.js` / `.svelte.ts` file, plus every ` ```svelte ` code block in the markdown of Svelte's fixtures and the svelte.dev docs. These units come from every repository [listed in `corpus-sources.json`](scripts/compat-corpus/corpus-sources.json) (32 sources): Svelte's own fixtures, the curated [svelte.dev](https://github.com/sveltejs/svelte.dev) docs, and the shipped source of real-world component libraries and apps like [bits-ui](https://github.com/huntabyte/bits-ui), [shadcn-svelte](https://github.com/huntabyte/shadcn-svelte), [melt-ui](https://github.com/melt-ui/next-gen), [flowbite-svelte](https://github.com/themesberg/flowbite-svelte), [svelte-ux](https://github.com/techniq/svelte-ux), and [layerchart](https://github.com/techniq/layerchart). Each repo is pinned by a git submodule and bumped automatically — the project and docs repos via a weekly PR, and Svelte via a weekly check that opens a PR whenever a new stable release lands — so the corpus tracks the live ecosystem over time.

Three independent tracks run over that shared corpus — in CI on every PR that touches the compiler, the pipeline, or a pinned source — each comparing rsvelte against the *real* tool it replaces, not a hand-written approximation (a separate lint-parity track runs over its own corpus, below):

| Track | Compared against | What must match | Known divergences |
|---|---|---|---|
| **Compiler** (CSR + SSR) | `svelte/compiler` | JS + CSS output, byte-identical after oxfmt + blank-line normalization, or AST-equivalent; files the official compiler rejects produce the same error code | **54** |
| **`svelte2tsx`** | official `svelte2tsx` | generated `.tsx`, byte-identical after oxfmt + blank-line normalization | **0** |
| **Formatter** | `oxfmt` + `prettier-plugin-svelte` | `rsvelte-fmt` output, byte-identical | **121** |

The counts are absolute divergences — each track grades a different slice of the corpus, so they aren't directly comparable; the over-99% rate above comes from the compiler track (54 of ~11,900 units). And that rate isn't flattered by Svelte's own fixtures: nearly all of those divergences are in third-party project code, so parity on the real-world-only slice (~5,500 units) is still ~99%. The formatter track grades the `.svelte` components (most of the corpus); its 121 divergences likewise work out to ~99% parity.

The **lint-parity** track checks that the native `rsvelte-lint` produces the same findings as the real [`eslint-plugin-svelte`](https://github.com/sveltejs/eslint-plugin-svelte) over the two lint-relevant upstream repos (`eslint-plugin-svelte` + `svelte-eslint-parser`), since those repos *are* the lint ground truth. It currently sits at **zero** divergences over every compared rule (type-aware rules and a few non-comparable rules such as `indent` are excluded; see the pipeline README).

Normalization runs only on the *comparison* side, never inside the compiler — so a real divergence can never hide behind a compiler post-pass (and rsvelte, chasing a 100× speedup, never spends cycles inside the compiler on cosmetic output massaging). Each track normalizes differently:

- **Compiler** — oxfmt + blank-line stripping, plus an AST-structural fallback that absorbs pure cosmetics like line-wrapping, redundant parens, and quote style.
- **`svelte2tsx`** — oxfmt + blank-line stripping, but no AST-equivalent fallback: the normalized TSX must match byte-for-byte, since the functional comments the language server relies on are part of its contract.
- **Formatter** — no comparison-side normalization at all: `rsvelte-fmt`'s output is compared byte-for-byte against an oxfmt-formatted oracle, because correct blank lines and exact layout are precisely what a formatter is graded on.

Anything that survives is a real difference against the official tool, not an artifact of normalization.

Every track is a **ratchet**: its known-divergence count — checked into [`compat/corpus/`](compat/corpus) (and [`compat/lint-corpus/`](compat/lint-corpus) for the lint track) — **may only shrink**. A newly introduced divergence turns CI red, and fixed ones are pruned from the baseline, so real-world parity only improves over time and never silently regresses. (The counts in the table are the committed baselines as of this writing; see the `compat/` directories for live values.)

This is the difference between passing your own tests and clearing a drop-in-replacement bar: rsvelte's output is checked against the official toolchain on the same kinds of code real projects ship every day. See [`scripts/compat-corpus/README.md`](scripts/compat-corpus/README.md) for the full pipeline, normalization layers, and how to add a repository to the corpus.

## Goals

1. **OXC ecosystem integration** — be the Svelte surface that `oxlint`, `oxfmt`, Rolldown, and `tsgo` (via `tsgolint`) all link against. This is the project's reason for existing; everything else is a step toward it.
2. **100% test compatibility** with the official `svelte/compiler` test suite — keeps the Rust port provably equivalent to upstream while OXC integration lands.
3. **100× single-threaded speedup** over the JS compiler via Rust + OXC.
4. **Drop-in replacements** for the ecosystem hot paths (`svelte/compiler`, `svelte-check`, `vite-plugin-svelte`, `svelte2tsx`) so you can adopt rsvelte today without touching the rest of your build.
5. **Ecosystem port** — see [`docs/ecosystem-implementation-plan.md`](docs/ecosystem-implementation-plan.md) for the multi-wave plan.

## Architecture

The directory structure mirrors `submodules/svelte/packages/svelte/src/compiler/`:

```
crates/rsvelte_core/src/compiler/phases/
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
./scripts/bench/bench.sh                                  # JS vs Rust benchmark
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
./scripts/dev/upgrade-svelte.sh 5.52.0
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
