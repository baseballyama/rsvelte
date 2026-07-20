<p align="center">
  <img src="assets/logo.png" alt="rsvelte" width="200" height="200" />
</p>

<h1 align="center">rsvelte</h1>

<p align="center">
  <strong>A Rust port of the official Svelte 5 compiler — and the ecosystem around it — built to slot natively into the <a href="https://oxc.rs/">OXC</a> toolchain.</strong>
</p>

<p align="center">
  <a href="https://baseballyama.github.io/rsvelte/">Website</a> ·
  <a href="https://baseballyama.github.io/rsvelte/playground">Playground</a> ·
  <a href="https://baseballyama.github.io/rsvelte/benchmark">Benchmarks</a> ·
  <a href="https://baseballyama.github.io/rsvelte/progress">Compatibility</a>
</p>

<p align="center">
  <a href="https://app.codspeed.io/baseballyama/rsvelte?utm_source=badge"><img src="https://img.shields.io/endpoint?url=https://codspeed.io/badge.json" alt="CodSpeed"/></a>
</p>

> **⚠️ Early stage** — rsvelte passes 100% of the in-scope fixtures in the official Svelte 5 test suite, but it's pre-1.0: APIs and behaviour may change without notice. Use in production at your own risk.

## Why rsvelte exists

The native JS toolchain growing around OXC — `oxlint`, `oxfmt`, [Rolldown](https://rolldown.rs/), [`tsgo`](https://github.com/microsoft/typescript-go) — can only see `.js` / `.ts` / `.jsx` / `.tsx`. `.svelte` files are invisible to it, because parsing Svelte means running the JavaScript-based Svelte compiler, which native tools can't link against. Svelte developers are locked out of the order-of-magnitude speed-ups the rest of the ecosystem is starting to take for granted.

rsvelte fixes that at the source: it ports the compiler — and the ecosystem hot paths around it (`svelte2tsx`, `svelte-check`, `vite-plugin-svelte`, formatting) — to Rust on top of OXC's parser, codegen, and semantic stack. The end goal is upstream integration, so `oxlint` can lint `.svelte`, `oxfmt` can format it, Rolldown can bundle it, and `tsgo` can type-check it — all without a JS compiler hop.

Until then, the `@rsvelte/*` packages are **drop-in replacements** you can use today. They double as the correctness proof: every release is verified against the official tools, byte for byte.

## Quick start

### Vite

The plugin is a fork of `@sveltejs/vite-plugin-svelte` with the same public API — only the compiler underneath changes.

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

### SvelteKit

SvelteKit pulls in `@sveltejs/vite-plugin-svelte` internally, so redirect it with a package-manager override — no config changes needed:

```jsonc
// package.json (pnpm; npm/yarn have equivalent overrides/resolutions fields)
{
  "pnpm": {
    "overrides": {
      "@sveltejs/vite-plugin-svelte": "npm:@rsvelte/vite-plugin-svelte@^0.4.0"
    }
  }
}
```

### Type-check (`svelte-check`)

`@rsvelte/svelte-check` is a CLI-compatible replacement for `svelte-check`: a Rust walker generates a TSX overlay per component and hands it to `tsc` (or Microsoft's native `tsgo` with `--tsgo`), then maps diagnostics back to exact `.svelte` positions.

```bash
npm install -D @rsvelte/svelte-check
npx rsvelte-check                 # Svelte + TypeScript diagnostics
npx rsvelte-check --tsgo          # prefer tsgo over tsc (faster)
npx rsvelte-check --watch --incremental
npx rsvelte-check --no-type-check # Svelte diagnostics only
```

Every upstream flag is accepted (`--output`, `--fail-on-warnings`, `--compiler-warnings`, `--threshold`, `--no-tsconfig`, `--config`, `--preserveWatchOutput`, …), plus rsvelte-specific ones — see the [upstream flag compatibility table](apps/npm/svelte-check#upstream-flag-compatibility) or `npx rsvelte-check --help`.

### Format (`rsvelte-fmt`)

One Rust CLI that formats `.svelte` in-process and routes `.js` / `.ts` / `.css` / `.json` to [`oxfmt`](https://oxc.rs/docs/guide/usage/formatter) (an optional peer dependency), both in parallel:

```bash
npm install -D @rsvelte/fmt oxfmt
npx rsvelte-fmt src/          # format in place
npx rsvelte-fmt --check src/  # CI gate: exit 1 if anything would change
```

See [`@rsvelte/fmt`](apps/npm/fmt) for all flags, stdin/editor integration, and configuration.

### Lint (`rsvelte-lint`)

A native Svelte linter that surfaces the compiler's own validator/a11y diagnostics plus a Rust port of [`eslint-plugin-svelte`](https://github.com/sveltejs/eslint-plugin-svelte)'s rules, designed to run alongside ESLint rather than replace it:

```bash
npm install -D @rsvelte/lint
npx rsvelte-lint src/                 # lint a directory
npx rsvelte-lint --fix src/           # autofix in place
```

See [`@rsvelte/lint`](apps/npm/lint) for configuration, ESLint config import (`--config-from-eslint`), and CI output formats (`--format sarif`, `--format github-actions`).

### Compile from JavaScript

[`@rsvelte/compiler`](apps/npm/compiler) ships the compiler as WebAssembly — it runs anywhere Node or a browser does:

```js
import init, { compile_client, compile_server, parse_svelte } from '@rsvelte/compiler';

await init(); // initialise the wasm module once

const { js, css } = compile_client('<h1>Hello {name}</h1>', 'App');
const ast = JSON.parse(parse_svelte('<h1>Hello</h1>').ast);
```

Need the exact `svelte/compiler` surface (`compile`, `compileModule`, `parse`, `preprocess`, `VERSION`) at native speed? That's [`@rsvelte/vite-plugin-svelte-native`](apps/npm/vite-plugin-svelte-native), the NAPI binding the Vite plugin runs on. One caveat: function-valued options can't cross the language boundary — see [Compiler option compatibility](#compiler-option-compatibility).

### Embed in Rust, or call from any language

```toml
[dependencies]
rsvelte_core = { git = "https://github.com/baseballyama/rsvelte" }
```

```rust
use rsvelte_core::{compile, CompileOptions};

let result = compile("<h1>Hello, {name}!</h1>", CompileOptions::default()).unwrap();
println!("{}", result.js.code);
```

The Rust API honours **every** compile option, including `css_hash` and `warning_filter` as real closures.

For everything else there's a stable **C ABI** ([`crates/rsvelte_capi`](crates/rsvelte_capi)): one shared library + one header, JSON in / JSON out, with prebuilt binaries on [GitHub Releases](https://github.com/baseballyama/rsvelte/releases) (`capi-vX.Y.Z` tags) and ready-to-run examples for C, Go, Python, Ruby, PHP, Zig, and Java.

## Packages

All npm packages ship under the `@rsvelte` scope.

| Package | Drop-in for |
|---|---|
| [`@rsvelte/vite-plugin-svelte`](apps/npm/vite-plugin-svelte) | [`@sveltejs/vite-plugin-svelte`](https://github.com/sveltejs/vite-plugin-svelte) |
| [`@rsvelte/svelte-check`](apps/npm/svelte-check) | [`svelte-check`](https://github.com/sveltejs/language-tools/tree/master/packages/svelte-check) CLI |
| [`@rsvelte/fmt`](apps/npm/fmt) | `prettier` + [`prettier-plugin-svelte`](https://github.com/sveltejs/prettier-plugin-svelte) |
| [`@rsvelte/lint`](apps/npm/lint) | [`eslint`](https://eslint.org) + [`eslint-plugin-svelte`](https://github.com/sveltejs/eslint-plugin-svelte) |
| [`@rsvelte/svelte2tsx`](apps/npm/svelte2tsx) | [`svelte2tsx`](https://github.com/sveltejs/language-tools/tree/master/packages/svelte2tsx) |
| [`@rsvelte/compiler`](apps/npm/compiler) | [`svelte/compiler`](https://svelte.dev/docs/svelte/svelte-compiler), as WebAssembly |
| [`@rsvelte/vite-plugin-svelte-native`](apps/npm/vite-plugin-svelte-native) | `svelte/compiler`, as a native NAPI binding |
| [`@rsvelte/language-server`](apps/npm/language-server) | [`svelte-language-server`](https://github.com/sveltejs/language-tools/tree/master/packages/language-server) |
| [`rsvelte-vscode`](apps/npm/vscode) | The `rsvelte` VS Code extension ([Marketplace](https://marketplace.visualstudio.com/items?itemName=baseballyama.rsvelte-vscode)) |

## Performance

Multi-threaded rsvelte vs. the official JavaScript tool, same machine, same corpus (3,854 real `.svelte` files; Apple M1 Pro, 10-core; 10 iterations after 3 warmup):

| Task | JS baseline | Rust (1 thread) | Rust (multi) | Multi vs JS |
|---|---:|---:|---:|---:|
| Compile — full pipeline | 990.9 ms | 564.4 ms | 74.7 ms | **13.3×** |
| Parse only | 246.6 ms | 11.9 ms | 2.2 ms | **112.8×** |
| `svelte2tsx` | 389.2 ms | 171.6 ms | 21.9 ms | **17.8×** |
| Format (vs prettier-plugin-svelte) | 4,316.7 ms | 233.0 ms | 37.8 ms | **114.2×** |
| `svelte-check` (500-file workspace) | 1,335.0 ms | 76.2 ms | 18.7 ms | **71.3×** |

Live numbers, charts, and reproduction steps: [benchmark page](https://baseballyama.github.io/rsvelte/benchmark), or `pnpm run generate-benchmark` locally. A single-threaded 100× compile speedup remains an explicit goal — current numbers are a snapshot, not a ceiling.

## Compatibility

<!-- svelte-target-version -->
**Targeting Svelte `v5.56.4`** ([`eae50dfd1c22`](https://github.com/sveltejs/svelte/commit/eae50dfd1c22)) — automatically maintained by `pnpm run update-docs`.
<!-- /svelte-target-version -->

rsvelte passes **100% of the in-scope fixtures** of the official Svelte compiler test suite — over 3,500 fixtures across parser, snapshot, CSS, validator, compiler errors, runtime (runes + legacy), hydration, SSR, preprocess, print, and svelte2tsx. The per-suite breakdown is on the live [compatibility dashboard](https://baseballyama.github.io/rsvelte/progress); regenerate locally with `pnpm run test-and-update`.

What "in-scope" excludes:

- **`migrate` (76 fixtures)** — the Svelte 4 → 5 migrator is intentionally out of scope; rsvelte ports the Svelte 5 compiler, not the migration tool.
- **A handful of individually skipped fixtures** — most notably `javascript-comments` (acorn vs OXC comment attachment; legacy AST only, no output impact), `error-mode-warn` (skipped via the fixture's `_config.js`), and two fixtures pending small upstream ports (`async-in-derived`, `css-keyframes-percent`). The dashboard lists every skip with its reason.

### Verified against real-world code, not just fixtures

On top of the fixture suite, a continuously growing **output-equality corpus** compiles ~12,000 units of real Svelte source — every `.svelte` / `.svelte.(js|ts)` file and markdown code block from [32 pinned repositories](scripts/compat-corpus/corpus-sources.json), including bits-ui, shadcn-svelte, melt-ui, and flowbite-svelte — with both the official tool and rsvelte, and asserts the outputs match:

| Track | Compared against | Known divergences |
|---|---|---:|
| Compiler (CSR + SSR) | `svelte/compiler` | **22** (~99.8% parity) |
| `svelte2tsx` | official `svelte2tsx` | **0** |
| Formatter | `oxfmt` + `prettier-plugin-svelte`, byte-for-byte | **74** |
| Linter | [`eslint-plugin-svelte`](https://github.com/sveltejs/eslint-plugin-svelte) (compared rules) | **0** |

Each count is a CI **ratchet**: the baselines in [`compat/`](compat) may only shrink, so a new divergence turns CI red and parity can only improve. Normalization (formatting, blank lines) runs on the comparison side only — never inside the compiler — so real differences can't hide. Details: [`scripts/compat-corpus/README.md`](scripts/compat-corpus/README.md).

### Compiler option compatibility

The drop-in JS surface ([`@rsvelte/vite-plugin-svelte-native`](apps/npm/vite-plugin-svelte-native), which the Vite plugin uses) and the C ABI accept the full `svelte/compiler` options shape, but **function-valued options can't cross the language boundary** — they are accepted (keeping the TypeScript types drop-in) and silently ignored:

| Option | Workaround |
|---|---|
| `cssHash(...) => string` | Falls back to upstream's default `svelte-<hash>` scheme. To force a specific value, pass the rsvelte-specific `cssHashOverride: '<hash>'`. |
| `warningFilter(warning) => boolean` | All warnings are returned; filter `result.warnings` yourself. |

Every other option matches upstream exactly. The Rust API has no such restriction, and the wasm `@rsvelte/compiler` is unaffected — it exposes a smaller fixed surface with no options object at all.

## Architecture

The directory layout mirrors the official compiler at `submodules/svelte/packages/svelte/src/compiler/`:

```
crates/rsvelte_core/src/compiler/phases/
├── 1_parse/     # Svelte syntax → AST
├── 2_analyze/   # scope tree, bindings, rune detection
└── 3_transform/ # AST → JS/CSS (client + SSR)
```

JavaScript parsing, semantic analysis, and codegen all run on OXC — the same crates `oxlint` and `oxfmt` use — with a memory-efficient AST (u32 spans, `compact_str`, arena allocation) and `rayon` parallelism across files.

## Development

```bash
git submodule update --init --recursive
git config core.hooksPath .githooks   # cargo fmt/clippy pre-commit
pnpm install
pnpm run generate-fixtures            # required before tests
cargo test
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the test-suite anatomy, how to run and debug a single fixture, and PR conventions.

## License

MIT
