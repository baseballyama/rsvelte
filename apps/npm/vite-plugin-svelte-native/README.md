# @rsvelte/vite-plugin-svelte-native

Native (N-API) bindings to the [rsvelte](https://github.com/baseballyama/rsvelte) Svelte 5 compiler, packaged for Node.js. Exposes the same `compile` / `compileModule` / `preprocess` / `hmrDiff` / `resolveId` surface as the official [`svelte/compiler`](https://svelte.dev/docs/svelte-compiler), plus a few low-overhead extras for tooling authors.

> **⚠️ Most users should not depend on this directly.** It's the engine that powers [`@rsvelte/vite-plugin-svelte`](https://github.com/baseballyama/rsvelte/tree/main/apps/npm/vite-plugin-svelte) — if you want to build a SvelteKit / Vite app with the Rust compiler, use that fork instead. Depend on this package if you're writing a build tool, language server, batch compiler, or any other Node.js program that needs to compile `.svelte` files at maximum speed.

## Install

```bash
npm install @rsvelte/vite-plugin-svelte-native
# pnpm add @rsvelte/vite-plugin-svelte-native
# yarn add @rsvelte/vite-plugin-svelte-native
```

The package ships a loader that resolves the right prebuilt `.node` binary for your platform via `optionalDependencies`. Supported targets:

| OS | Architecture |
|---|---|
| macOS | arm64, x64 |
| Linux | x64 (glibc), arm64 (glibc) |
| Windows | x64 (MSVC) |

If your platform isn't listed, please [open an issue](https://github.com/baseballyama/rsvelte/issues).

## Quick start

```js
const { compile, compileModule, preprocess, VERSION } = require('@rsvelte/vite-plugin-svelte-native');

// Component
const result = compile('<h1>Hello {name}!</h1>', {
  filename: 'App.svelte',
  generate: 'client', // 'client' | 'server' | false
});
console.log(result.js.code);
console.log(result.css?.code);

// Module (.svelte.js / .svelte.ts)
const mod = compileModule('export const count = $state(0);', {
  filename: 'counter.svelte.js',
});

// Pre-process pipeline (markup / script / style)
const pre = await preprocess(source, [/* PreprocessorGroup[] */], {
  filename: 'App.svelte',
});

console.log(VERSION); // upstream Svelte version this binding targets
```

The shape of `CompileOptions`, `CompileResult`, `Warning`, `PreprocessorGroup`, etc. matches the upstream `svelte/compiler` types. See [`index.d.ts`](./index.d.ts) for the complete surface.

## Why use this over `svelte/compiler`?

- **Faster.** ~2× single-threaded vs the JS compiler on real corpora; ~15× with `compileBatch` across rayon worker threads.
- **Drop-in.** Same options, same output shape — wire it into an existing build tool with minimal changes.
- **Zero-overhead batching.** `compileBatch([...inputs])` compiles N files in parallel across rayon workers and crosses the N-API boundary exactly once.
- **Async-friendly.** `compileAsync` / `compileBatchAsync` run on libuv worker threads — the JS event loop stays free.

## Performance tips for tool authors

This package exposes several levels of compile entry points; pick based on how your tool consumes the result:

| Entry point | When to use |
|---|---|
| `compile(source, options)` | Default. Returns the upstream `CompileResult` shape; lazy-decodes the underlying envelope so heavy strings (generated code, source map JSON) are read only when accessed. |
| `compileAsync(source, options)` | Same shape, runs on a libuv worker thread. Use inside Vite middleware, SSR pre-render, or anywhere you don't want to block the event loop. |
| `compileBatch([{source, options}, …])` | Compile many files in one N-API call. Per-file failures surface as `Error` instances at the corresponding slot — they don't abort the batch. |
| `compileBatchAsync([...])` | Same, async / off-thread. |
| `compileEnvelope(source, options)` | Returns a single `Buffer` containing the raw envelope. Useful for `postMessage` across worker threads with `transfer:` — no copy. Pair with `decodeEnvelope(buf)` on the receiving side. |
| `compileEnvelopeZeroCopy(...)` | Same as `compileEnvelope` but the returned `Buffer` is a view into `bumpalo` arena memory — skips Rust's `Vec` allocation. Faster, but with subtle GC / detach semantics. |
| `compileBuffers(...)` | Returns `js.code` / `js.map` / `css.code` / `css.map` as raw `Buffer`s. Skip when you can use `compile()` — kept as an escape hatch. |
| `compileLegacy(...)` | The old JSON-on-the-boundary path. Kept for parity tests; production callers should not use it. |

For Svelte source-to-TSX conversion use the bundled `svelte2tsx(source, options)`; for HMR-update diffs use `hmrDiff(prev, curr)`. See [`index.d.ts`](./index.d.ts) for full type signatures.

## Compatibility

- **3,341 / 3,341** in-scope tests from the official Svelte 5 compiler test suite pass.
- `VERSION` tracks the upstream Svelte version (currently `5.51.3`) — it's the *Svelte* compatibility line, not the rsvelte release version.

## License

MIT
