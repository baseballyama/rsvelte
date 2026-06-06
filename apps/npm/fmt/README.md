# @rsvelte/fmt

A Rust-powered formatter for Svelte projects. `rsvelte-fmt` formats `.svelte`
files in-process with the rsvelte formatter and delegates every other file
(`.ts` / `.tsx` / `.js` / `.jsx` / `.cjs` / `.mjs` / `.json` / `.css`) — and the
`<style>` CSS body of each Svelte component — to [`oxfmt`](https://oxc.rs/docs/guide/usage/formatter).
Both pipelines run in parallel, so a mixed project formats in a single pass with
no Node startup cost on the Svelte side and no Prettier doc-IR round-trip.

> **⚠️ Early stage (v0).** Output and flags are stabilising.

## Install

```bash
npm install -D @rsvelte/fmt
# pnpm add -D @rsvelte/fmt
# yarn add -D @rsvelte/fmt
```

The package ships a small loader that resolves the right prebuilt native binary
for your platform via `optionalDependencies`. Supported targets:

| OS | Architecture |
|---|---|
| macOS | arm64, x64 |
| Linux | x64 (glibc), arm64 (glibc) |
| Windows | x64 (MSVC) |

If your platform isn't listed, please [open an issue](https://github.com/baseballyama/rsvelte/issues).

### oxfmt (optional, bring-your-own version)

Non-`.svelte` files and the CSS inside `<style>` blocks are formatted by
[`oxfmt`](https://www.npmjs.com/package/oxfmt). It's declared as an **optional
peer dependency** — install whatever version you like and `rsvelte-fmt` will use
it automatically:

```bash
npm install -D oxfmt
```

`rsvelte-fmt` resolves your installed `oxfmt` (or, failing that, an `oxfmt` on
`$PATH`). Pass `--oxfmt-bin <path>` to point at a specific binary. Without any
`oxfmt`, `.svelte` markup still formats; only the non-Svelte files are skipped.

## Usage

```bash
# Format everything under src/ in place
npx rsvelte-fmt src/

# Check mode — exits non-zero if anything would change (CI gate)
npx rsvelte-fmt --check src/

# Editor / stdin mode
cat App.svelte | npx rsvelte-fmt --stdin --stdin-filepath App.svelte
```

Add it to your `package.json`:

```json
{
  "scripts": {
    "format": "rsvelte-fmt src/",
    "format:check": "rsvelte-fmt --check src/"
  }
}
```

Directory inputs are walked recursively, skipping `node_modules`, `target`,
`dist`, `build`, and hidden directories.

## CLI flags

| Flag | Default | Effect |
|---|---|---|
| `--write` | (implied for paths) | Write formatted output back to source files |
| `--check` | off | Exit 1 if any file would change; no writes |
| `--stdin` | off | Read source on stdin, write result to stdout |
| `--stdin-filepath PATH` | — | Filename used to pick the engine (required with `--stdin`) |
| `--print-width N` | 80 | Maximum line width before breaking |
| `--tab-width N` | 2 | Spaces per indent level |
| `--use-tabs` | off | Indent with tabs |
| `--oxfmt-bin PATH` | resolved / `oxfmt` | Override the oxfmt binary used for non-`.svelte` files |

Run `rsvelte-fmt --help` for the authoritative list.

## Exit codes

| Code | Meaning |
|---|---|
| 0 | Success (write applied or check passed) |
| 1 | `--check` found at least one file that would change |
| 2 | Internal error (parse failure, `oxfmt` missing, IO error, …) |

## Performance

`rsvelte-fmt` is part of the [rsvelte](https://github.com/baseballyama/rsvelte)
project. The Svelte parser is rsvelte (Rust, in-process) and the JS rewrite is
straight `oxc_formatter` — no Node calls and no Prettier round-trip for the
Svelte markup itself.

Formatting 3,852 real `.svelte` files (Apple M1 Pro, 10 iterations / 3 warmup),
the Svelte engine runs **35× faster single-threaded and 204× faster
multi-threaded** than `prettier-plugin-svelte`. Live numbers and reproduction
steps are on the [benchmark page](https://baseballyama.github.io/rsvelte/benchmark).

## License

MIT
