# @rsvelte/compiler

A high-performance Rust implementation of the [Svelte](https://svelte.dev) 5
compiler, shipped as WebAssembly. Part of the
[rsvelte](https://github.com/baseballyama/rsvelte) project — a port of the
official Svelte compiler to Rust, aiming for byte-identical output and a large
speedup over the JavaScript compiler.

The whole compile pipeline — parse, analyze, transform — for client, SSR and
hydration, with output that matches the official compiler across the in-scope
test suite.

> **⚠️ Early stage.** The API surface is stabilising. Output is verified
> byte-for-byte against the official compiler across the in-scope Svelte test
> suite, but treat this as experimental for production use.

## Install

```bash
npm install @rsvelte/compiler
# pnpm add @rsvelte/compiler
# yarn add @rsvelte/compiler
```

The package is a `wasm-pack` (`--target web`) module — the WebAssembly binary
ships with the package, so it runs anywhere WebAssembly does (modern browsers,
Node.js, Deno, Bun) with no native binaries and no `optionalDependencies`.

If you need the raw `.wasm` bytes yourself (for example to drive the synchronous
`initSync` on Node), import them from the stable **`@rsvelte/compiler/wasm`**
subpath rather than the internal artifact filename:

```js
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { initSync } from '@rsvelte/compiler';

const require = createRequire(import.meta.url);
const bytes = readFileSync(require.resolve('@rsvelte/compiler/wasm'));
initSync({ module: bytes });
```

`@rsvelte/compiler/wasm` is the supported path for the wasm binary and stays
stable across releases; the on-disk filename is an internal build detail and may
change.

## Usage

```js
import init, {
  parse_svelte,
  compile_client,
  compile_server,
  version,
} from '@rsvelte/compiler';

// Initialise the WebAssembly module once before calling any export.
await init();

const source = `<h1>Hello {name}</h1>`;

// Compile for the client.
const client = compile_client(source, 'App');
console.log(client.js);  // generated JavaScript
console.log(client.css); // scoped styles

// Compile for SSR.
const server = compile_server(source, 'App');

// Parse to the Svelte AST (JSON string, same shape the official parser produces).
const ast = JSON.parse(parse_svelte(source).ast);

console.log(version()); // the rsvelte compiler version
```

## Why it is fast

- Written in Rust with a memory-efficient AST (`u32` spans, compact strings) and
  direct phase-to-phase AST passing — no re-parsing between phases.
- Thread-safe, parallel parsing via [rayon](https://github.com/rayon-rs/rayon).
- Designed for integration into the [oxc](https://oxc.rs/) ecosystem.

## Related packages

- [`@rsvelte/svelte2tsx`](https://www.npmjs.com/package/@rsvelte/svelte2tsx) — `.svelte` → TSX for type-checking.
- [`@rsvelte/svelte-check`](https://www.npmjs.com/package/@rsvelte/svelte-check) — a drop-in `svelte-check`.
- [`@rsvelte/vite-plugin-svelte`](https://www.npmjs.com/package/@rsvelte/vite-plugin-svelte) — the Vite plugin, backed by the Rust compiler.

## License

MIT

---

> **Maintainers:** `@rsvelte/compiler` is published from the wasm-pack output in
> the repo-root `pkg/` directory, not from this directory. See
> [`PUBLISHING.md`](./PUBLISHING.md) for how the version anchor and README
> overlay work.
