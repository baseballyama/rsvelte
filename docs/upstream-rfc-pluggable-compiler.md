# Upstream RFC draft — pluggable compiler for `@sveltejs/vite-plugin-svelte`

Draft for filing in the [`sveltejs/vite-plugin-svelte`](https://github.com/sveltejs/vite-plugin-svelte)
repository. Goal: get the official plugin to accept a user-supplied
compiler module so alternative implementations (rsvelte, profiling
wrappers, test mocks) can stop forking the plugin.

## Where to file

- **Preferred:** GitHub Discussions → "Ideas / RFC" category.
  API-shape proposals tend to land better when there's a discussion
  thread before an Issue/PR.
- **Acceptable fallback:** Issue tagged `enhancement` / `rfc`.

## Title (pick one)

- `[Feature] Allow swapping the Svelte compiler module (pluggable compiler)`
- `RFC: Pluggable compiler option for alternative Svelte compiler implementations`

---

## Body (paste verbatim into Discussion / Issue)

```markdown
## Summary

Allow `@sveltejs/vite-plugin-svelte` to import its compiler module
from a user-provided source instead of statically importing
`svelte/compiler`. This unblocks alternative compiler implementations
(Rust ports, profiling wrappers, debug instrumentation, test mocks)
without each one having to maintain a fork of this plugin.

## Motivation

Today, every consumer of an alternative Svelte compiler has to fork
`vite-plugin-svelte` just to swap the import target. The fork's diff
is mechanically the same in every case: replace
`from 'svelte/compiler'` with the alternative module specifier.
That's high maintenance cost (each upstream release has to be
rebased) for what is effectively a one-line user choice.

Concrete use cases:

- **Rust ports of the compiler** — e.g.
  [`rsvelte`](https://github.com/baseballyama/rsvelte) exposes
  `compile` / `compileModule` / `preprocess` / `parse` via a drop-in
  N-API module. Users today have to install a forked plugin.
- **Profiling / instrumentation wrappers** — wrap the official
  compiler to record per-component timing or AST inspection.
- **Test mocks** — substitute a deterministic mock compiler in unit
  tests without monkey-patching.

## Proposed API

Add a `compiler` option to `svelte()`:

```js
import { svelte } from '@sveltejs/vite-plugin-svelte';
import * as rsvelte from '@rsvelte/compiler';

export default {
  plugins: [
    svelte({
      // Option 1: pre-imported module
      compiler: rsvelte,
      // Option 2: module specifier (resolved via Vite's resolver)
      // compiler: '@rsvelte/compiler',
    })
  ]
};
```

The compiler module must export the same surface as `svelte/compiler`:

- `compile(source, options): CompileResult`
- `compileModule(source, options): CompileResult`
- `parse(source, options): AST`
- `preprocess(source, preprocessors, options): Promise<Preprocessed>`
- `VERSION: string`

Default: `await import('svelte/compiler')` (current behavior, no
opt-in required).

## Implementation sketch

Resolve the user-supplied `compiler` once at `configResolved` time
and store it on the existing `PluginAPI` object (the same place
`api.options`, `api.idParser`, `api.compileSvelte` already live).
Every static `import * as svelte from 'svelte/compiler'` site is
replaced with a read from `api.compiler`.

Resolution rules:

- `compiler` is a module object → use as-is.
- `compiler` is a string → `await import(compiler)` (resolved
  through the project's package graph, same as any other vite
  plugin dependency).
- `compiler` is absent → default to `await import('svelte/compiler')`
  (current behavior).

The diff on `main` is small — ~50 lines across the same 15 files a
typical fork already touches.

## Considerations

- **Type contract.** Add a `Compiler` interface (or a re-export of
  `typeof import('svelte/compiler')`) to `public.d.ts`. Without an
  explicit contract, mis-shaped alternative compilers fail with
  cryptic runtime errors instead of a TypeScript diagnostic.

- **Version skew.** Compile output and the `svelte` runtime helpers
  it imports must agree on version. If a user passes a `compiler`
  whose `VERSION` doesn't match the project's installed `svelte`
  package, components can silently misbehave at runtime.
  Recommendation: log a warning at `configResolved` time when
  `compiler.VERSION !== installedSvelteVersion`.

- **Sourcemap interop.** This RFC doesn't touch sourcemap handling —
  the compile-output shape is unchanged, and Vite's downstream
  consumers (combined sourcemap, source-content lookup) keep
  working as-is.

- **Inspector / dep optimizer.**
  `vite-plugin-svelte-inspector` and the dep-optimizer integration
  consume compile output / the AST and don't import
  `svelte/compiler` directly, so they don't need to be touched by
  this change.

## Prior art

- `postcss` accepts plugins / custom parsers via config.
- `rollup` accepts `acornInjectPlugins` for a custom parser.
- `vite` accepts `customLogger`.
- `esbuild-loader` (webpack) lets you supply your own esbuild instance.

## Out of scope

- **Custom HMR or resolution hooks.** Alternative compilers can
  expose extra capabilities (e.g. a source-level diff for HMR), but
  those would be a separate plugin / proposal — the current ask is
  the minimal "swap the compiler import" change that unblocks every
  fork today.
- **Bundling the compiler.** Resolution stays via the project's
  package graph; this RFC doesn't propose vendoring anything.

## Willingness to contribute

Happy to prepare the PR if the direction is agreeable.
```

---

## Local notes (not for upstream)

- Filing this is the first step in retiring our
  `submodules/vite-plugin-svelte` fork. Once the option lands
  upstream, the fork's reason to exist (mechanical
  `svelte/compiler` → `@rsvelte/compiler` swap) goes away — we
  just pass `compiler: rsvelte` from the user's `vite.config.js`.
- Open question for upstream maintainers: do they prefer
  `compiler` (terse) or `compilerImpl` (more explicit)?
- If we want async-loading support (lazy import to avoid eager
  N-API load in build tools that don't need it), we may also need
  `compiler: () => Promise<Compiler>` as a third accepted form.
  Mention only if asked — keep the initial proposal small.
