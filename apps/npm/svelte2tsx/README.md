# @rsvelte/svelte2tsx

A Rust-powered drop-in replacement for [`svelte2tsx`](https://github.com/sveltejs/language-tools/tree/master/packages/svelte2tsx) — converts a Svelte component into a TypeScript / TSX module that TypeScript can type-check. Part of the [rsvelte](https://github.com/baseballyama/rsvelte) project.

`svelte2tsx` is the bridge that makes TypeScript-aware tooling work for `.svelte` files: editors, `svelte-check`, the Svelte VS Code extension, etc. This package exposes the same surface, backed by the rsvelte Rust compiler compiled to WebAssembly. **253 / 253** upstream `svelte2tsx` fixtures pass.

> **⚠️ Early stage.** Output is byte-identical against the upstream fixtures, but tooling integrations beyond `@rsvelte/svelte-check` are not yet validated. Open an issue if you hit a mismatch.

## Install

```bash
npm install @rsvelte/svelte2tsx
# pnpm add @rsvelte/svelte2tsx
# yarn add @rsvelte/svelte2tsx
```

Requires Node.js 18+. The WebAssembly bundle ships with the package — no native binaries, no `optionalDependencies`, runs anywhere Node does.

## Usage

```js
import { svelte2tsx } from '@rsvelte/svelte2tsx';

const source = `
<script lang="ts">
  let { name }: { name: string } = $props();
</script>

<h1>Hello, {name}!</h1>
`;

const result = svelte2tsx(source, {
  filename: 'Hello.svelte',
  isTsFile: true,
  version: '5',
});

console.log(result.code);          // TSX source
console.log(result.map);           // source map (string | null)
console.log(result.exportedNames); // { props: ['name'], all: [...] }
console.log(result.events);        // { eventName: type, ... }
```

## API

```ts
function svelte2tsx(
  source: string,
  options?: Svelte2TsxOptions
): Svelte2TsxResult;

interface Svelte2TsxOptions {
  /** Source filename used in the generated TSX `// @filename:` directive and source maps. */
  filename?: string;
  /** `<script lang="ts">` — emit real TS annotations. Otherwise JSDoc only. Default: false. */
  isTsFile?: boolean;
  /** `'ts'` (default) for type-check TSX, `'dts'` for ambient declarations. */
  mode?: 'ts' | 'dts';
  /** Generate accessor getters/setters on the component class. */
  accessors?: boolean;
  /** HTML namespace for element type inference. */
  namespace?: 'html' | 'svg' | 'mathml';
  /** Svelte version this component targets. Default: '5'. */
  version?: '4' | '5';
}

interface Svelte2TsxResult {
  /** Generated TSX source. */
  code: string;
  /** Source map (v3 JSON, as a string), or `null` if not produced. */
  map: string | null;
  /** Names exported by the component — `props` is the prop list, `all` is everything. */
  exportedNames: { props: string[]; all: string[] };
  /** Inferred event-handler types — `{ eventName: type }`. */
  events: Record<string, unknown>;
}
```

`svelte2tsx()` is **synchronous**, matching the upstream package — a drop-in call. On Node the WebAssembly module self-initialises (via `initSync` + `fs.readFileSync`) on the first call; subsequent calls have no init cost. Existing `await svelte2tsx(...)` code keeps working unchanged, since awaiting a plain value returns it.

### Browsers / bundlers without `node:fs`

The synchronous self-init reads the `.wasm` from disk, which needs Node. Where that isn't available, initialise the module once up front and then call `svelte2tsx()` synchronously:

```js
import { svelte2tsx, initialize } from '@rsvelte/svelte2tsx';

// Provide the wasm bytes or a compiled WebAssembly.Module for your environment.
await initialize({ module_or_path: wasmBytes });

const result = svelte2tsx(source, { version: '5' });
```

## When to use this

- You're writing a tool that needs to type-check `.svelte` source (linter, type-check CLI, editor extension, monorepo gate).
- You're already using `svelte2tsx` and want to test whether the Rust port produces equivalent output for your project.
- You're using [`@rsvelte/svelte-check`](https://www.npmjs.com/package/@rsvelte/svelte-check) — this package powers its `.tsx` shadow-file generation.

If you just want to *compile* a Svelte component to JS, use [`@rsvelte/compiler`](https://www.npmjs.com/package/@rsvelte/compiler) instead — `svelte2tsx` is for TS tooling, not runtime output.

## Compatibility

- 253 / 253 upstream `svelte2tsx` fixtures pass.
- 2 fixtures around `expected.error.json` (error-path assertions) are skipped pending a structured error-fixture runner.

If you hit a divergence from the official `svelte2tsx`, please file an issue at [github.com/baseballyama/rsvelte](https://github.com/baseballyama/rsvelte/issues) with a minimal repro.

## License

MIT
