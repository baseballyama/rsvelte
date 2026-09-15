# @rsvelte/compiler

A high-performance Rust implementation of the [Svelte](https://svelte.dev) 5
compiler, shipped as WebAssembly. Part of the
[rsvelte](https://github.com/baseballyama/rsvelte) project — a port of the
official Svelte compiler to Rust, aiming for byte-identical output and a large
speedup over the JavaScript compiler.

The whole compile pipeline — parse, analyze, transform — for client, SSR and
hydration, with output that matches the official compiler across the in-scope
test suite.

> **⚠️ Early stage.** This package exposes a browser-oriented low-level WASM
> API, not the public `svelte/compiler` API. Output is verified byte-for-byte
> against the official compiler across the in-scope Svelte test suite, but treat
> this package as experimental for production use.

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

## WASM API

```js
import init, {
  parse_svelte,
  compile,
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

// Parse to the Svelte AST (compact JSON, same shape the official parser produces).
const ast = JSON.parse(parse_svelte(source).ast);

console.log(version()); // the rsvelte compiler version
```

### Full compile options

`compile(source, options)` accepts the full compile-options object, including the
function forms Svelte's own `compile` supports. It returns the result as a JSON
string (`{ js, css, warnings, metadata }`); the callbacks are input-only.

```js
const result = JSON.parse(
  compile(source, {
    filename: 'App.svelte',
    generate: 'client',
    // `customElement` / `css` / `runes` also accept `({ filename }) => value`.
    css: 'injected',
    // Filter compiler warnings (applied by the compiler).
    warningFilter: (w) => !w.code.startsWith('a11y'),
    // A constant scope hash, or a dynamic `cssHash({ hash, css, name, filename })`.
    cssHash: ({ hash, css }) => `x-${hash(css)}`,
  }),
);
console.log(result.js.code, result.warnings);
```

The exported names and JSON-string return values below are specific to this
WASM package. They are deliberately not presented as `svelte/compiler`
equivalents.

### Rune modules and Web Workers

`compileModule(source, options)` compiles JavaScript rune modules such as
`state.svelte.js`. Like `compile`, it takes an options object and returns a JSON
string. It supports `generate`, `dev`, `filename`, `rootDir`, `experimental`, and
`warningFilter`. Preprocess TypeScript into JavaScript before calling it.

The same imports work in a browser module worker:

```js
// compiler-worker.js (bundle as a module worker)
import init, { compile, compileModule } from '@rsvelte/compiler';

const ready = init();
self.onmessage = async ({ data: { source, filename, module } }) => {
  await ready;
  try {
    const result = (module ? compileModule : compile)(source, {
      filename,
      generate: 'client',
    });
    self.postMessage({ result: JSON.parse(result) });
  } catch (error) {
    self.postMessage({ error: String(error) });
  }
};
```

Load this worker with `new Worker(new URL('./compiler-worker.js', import.meta.url),
{ type: 'module' })`. Ensure your bundler serves the generated wasm asset; you can
also pass its URL to `init({ module_or_path: wasmUrl })` explicitly.

### Playground tools

The default import and `@rsvelte/compiler/wasm` contain only compiler bindings.
They do not include lint or svelte2tsx. Applications needing those tools import
`@rsvelte/compiler/playground` and initialize that module separately. Its raw
binary is available at `@rsvelte/compiler/playground/wasm`. Both artifacts ship
in the npm package, but loading the default entry fetches only the compiler wasm.

## Compare CLI

Projects that already have Svelte installed can compare official and rsvelte
output before switching compilers:

```bash
npx --package @rsvelte/compiler rsvelte compare 'src/**/*.svelte'
```

The command compiles each component with both compilers and strictly compares
the generated `js.code` and `css.code`. Source maps are not included: their
segment layouts can differ even when the shipped code is identical. It exits 0
only when every file matches; a difference or compile failure exits 1.

```text
.................X.................

35 files scanned, 34 match, 1 difference

Differences:
* src/components/menu.svelte
  [client js.code] line 8, column 14
    official: "..."
    rsvelte:  "..."
```

Client production output is the default. Use `--generate server` or
`--generate both` for SSR, `--dev` for development output, and
`--options compiler-options.json` to merge JSON-compatible Svelte compiler
options. The CLI sets `filename` and `generate` per comparison. Directories and
quoted `*`, `**`, and `?` globs are supported; `node_modules`, `.git`, and
`target` are skipped during directory walks.

This is a generated-output check, not an application test: preprocessors, Vite
plugin behavior, runtime-version differences, source maps, and browser/server
behavior remain outside its comparison key.

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
> the repo-root `pkg/` directory. `finalize-pkg.mjs` overlays this README and the
> hand-written `bin/` + `lib/` files from this directory. See
> [`PUBLISHING.md`](./PUBLISHING.md) for how the version anchor and README
> overlay work.
