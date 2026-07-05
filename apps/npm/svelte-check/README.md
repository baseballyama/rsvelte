# @rsvelte/svelte-check

A Rust-powered drop-in replacement for [`svelte-check`](https://github.com/sveltejs/language-tools/tree/master/packages/svelte-check). Type-checks `.svelte`, `.svelte.ts` / `.svelte.js`, and the surrounding `.ts` / `.js` files in a Svelte project, and reports compiler warnings, A11y warnings, CSS warnings, and TypeScript diagnostics from a single CLI.

> **⚠️ Early stage.** Output and flags are stabilising. Not yet recommended for production CI gates without a fallback to the official `svelte-check`.

## Install

```bash
npm install -D @rsvelte/svelte-check
# pnpm add -D @rsvelte/svelte-check
# yarn add -D @rsvelte/svelte-check
```

The package ships a small loader that resolves the right prebuilt native binary for your platform via `optionalDependencies`. Supported targets:

| OS | Architecture |
|---|---|
| macOS | arm64, x64 |
| Linux | x64 (glibc), arm64 (glibc) |
| Windows | x64 (MSVC) |

If your platform isn't listed, please [open an issue](https://github.com/baseballyama/rsvelte/issues).

## Usage

From your project root:

```bash
# Svelte + TypeScript diagnostics (TypeScript runs via tsc by default)
npx rsvelte-check

# Prefer Microsoft's native tsgo backend (faster than tsc)
npx rsvelte-check --tsgo

# Compiler + A11y + CSS diagnostics only (fast — no TypeScript)
npx rsvelte-check --no-type-check

# Watch mode with incremental cache
npx rsvelte-check --watch --incremental
```

Add it to your `package.json`:

```json
{
  "scripts": {
    "check": "rsvelte-check --tsgo",
    "check:watch": "rsvelte-check --tsgo --watch --incremental"
  }
}
```

## CLI flags

| Flag | Description |
|---|---|
| `--workspace <dir>` | Project root to scan. Defaults to the current directory. |
| `--output <format>` | `human`, `human-verbose` (default), `machine`, `machine-verbose`, or `github-actions`. |
| `--ignore <list>` | Comma-separated path components to skip while walking the workspace. |
| `--fail-on-warnings` | Exit non-zero when any warning is reported (default: errors only). |
| `--tsgo` | Prefer [tsgo](https://github.com/microsoft/typescript-go) over `tsc` as the TypeScript backend (each falls back to the other if missing). |
| `--no-type-check` | Skip TypeScript entirely — Svelte compiler / A11y / CSS diagnostics only. |
| `--tsconfig <path>` | Base `tsconfig.json` for the overlay to `extends`. |
| `--emit-overlay` | Materialise `.tsx` shadow files + an overlay tsconfig under `<workspace>/.svelte-check/` without running a type-checker. Useful for inspecting what gets handed to TS. |
| `--compiler-warnings <list>` | Per-code overrides, e.g. `--compiler-warnings css-unused-selector:ignore,a11y-no-noninteractive-element-to-interactive-role:error`. |
| `--diagnostic-sources <list>` | Restrict output to any subset of `svelte`, `ts` / `js`, `css`. |
| `--incremental` | Reuse `<workspace>/.svelte-check/manifest.json` between runs — unchanged files skip the overlay regeneration step. |
| `--watch` | Stay alive and re-check on file changes. Composes with `--incremental`. |
| `--preserve-watch-output` | In watch mode, don't clear the terminal between runs. |

Run `rsvelte-check --help` for the authoritative list.

## How it works

`rsvelte-check` walks your project, parses every `.svelte` file with the rsvelte compiler, and reports compiler / A11y / CSS warnings directly. For TypeScript diagnostics, it generates `.tsx` shadow files (via [`@rsvelte/svelte2tsx`](https://www.npmjs.com/package/@rsvelte/svelte2tsx)) plus an overlay `tsconfig.json` under `.svelte-check/`, then hands the overlay to `tsc` (or `tsgo` with `--tsgo`). Diagnostics are remapped back onto the original `.svelte` source via high-resolution source maps so error positions point at the line and column you actually wrote.

Highlights:

- **SvelteKit-aware.** Honours `svelte.config.js`'s `kit.files` overrides; injects SvelteKit-generated kit-file augmentations for both `.ts` (real TS annotations) and `.js` (JSDoc) files.
- **Incremental.** A per-file overlay manifest and a per-file warning cache (`<cacheDir>/warnings.json`) make warm runs near-instant.
- **Parallel compile.** Files are compiled across rayon workers; the TS pass is the long pole.
- **Watch mode.** Composes with `--incremental` for an editor-like inner loop.

## Compatibility status

- **Compiler / A11y / CSS warnings** — full coverage; matches the official `svelte-check`'s set.
- **TypeScript diagnostics via tsgo** — covered for the standard project shapes (plain Svelte 5, SvelteKit). Edge cases around custom preprocessors are still being shaken out.
- **LSP integration (editor hover / completion)** — out of scope for this package. Wait on the upstream `tsgo` `tsserver` mode before assuming editor support.

If you hit a diagnostic the official `svelte-check` produces and this one doesn't (or vice-versa), please [open an issue](https://github.com/baseballyama/rsvelte/issues) with a minimal repro.

## Known limitations

- **Same-name `Foo.svelte.ts` / `Foo.svelte.js` companion next to `Foo.svelte`** ([#800](https://github.com/baseballyama/rsvelte/issues/800)). When a module file shares a component's base name, `import … from './Foo.svelte'` resolves to the companion instead of the component, so the component's default export and `<script module>` named exports are reported missing (`has no default export`, `Circular definition of import alias`, `declares 'X' locally, but it is not exported`). This is standard TypeScript relative-module resolution — `tsc` and `tsgo` behave identically — and the official `svelte-check` only avoids it via a TypeScript language-server plugin (`resolveModuleNameLiterals`) that the native `tsgo` binary does not support. **Workaround:** don't put a same-name companion next to a component — give shared module-context code a distinct name (e.g. `foo-helpers.ts`), or import the component's `<script module>` exports directly from `./Foo.svelte`. The [`rsvelte_lint`](https://github.com/baseballyama/rsvelte/tree/main/crates/rsvelte_lint) linter ships an opt-in `svelte/no-companion-module-shadow` rule (off by default) that flags this pattern so you catch it before it surprises you.

## Performance

`rsvelte-check` is part of the [rsvelte](https://github.com/baseballyama/rsvelte) project. On a 500-file workspace the Svelte-side check runs **~71× faster multi-threaded** than the official `svelte-check` ([live benchmark](https://baseballyama.github.io/rsvelte/benchmark)). The TypeScript pass via `tsc` / `tsgo` dominates wall-clock time on most projects; the Svelte side rarely registers.

## License

MIT
