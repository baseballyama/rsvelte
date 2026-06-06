# rsvelte-fmt

Fast Svelte + JS/TS/CSS formatter — one CLI, written in Rust.

> **This is the command-line tool.** The `.svelte` formatting engine itself
> lives in the [`rsvelte_formatter`](../rsvelte_formatter) library crate;
> `rsvelte-fmt` is the thin CLI that drives it and routes everything else to
> `oxfmt`.

`rsvelte-fmt` dispatches by file type:

- `.svelte` files → in-process [`rsvelte_formatter`](../rsvelte_formatter).
  CSS inside `<style>` blocks is sent to `oxfmt` through a callback, so it
  matches what `oxfmt` produces for standalone `.css`.
- `.ts` / `.tsx` / `.js` / `.jsx` / `.cjs` / `.mjs` / `.json` / `.css`
  files → a child `oxfmt` process.

Both pipelines run **in parallel** via `rayon::join`, so on a mixed project the
in-process Svelte work overlaps with the `oxfmt` subprocess on every invocation.
There are no Node calls and no Prettier doc-IR round-trip — just rsvelte parsing
+ `oxc_formatter`.

## Status

Functional v0. The Svelte path is tested end-to-end (6 CLI integration
tests, plus 105 tests in `rsvelte_formatter`). The `oxfmt` delegation path
is exercised manually because `oxfmt` may not be present in every CI lane.

## Install

### npm (recommended)

The CLI is published as [`@rsvelte/fmt`](https://www.npmjs.com/package/@rsvelte/fmt)
with prebuilt binaries for macOS / Linux / Windows:

```bash
npm install -D @rsvelte/fmt
npx rsvelte-fmt --help
```

[`oxfmt`](https://www.npmjs.com/package/oxfmt) handles non-`.svelte` files and
`<style>` CSS. It's an **optional peer dependency** — install whatever version
you want and the loader resolves it automatically:

```bash
npm install -D oxfmt
```

### From source

```bash
cargo build --release -p rsvelte_fmt
./target/release/rsvelte-fmt --help
```

When run from source you need [`oxfmt`](https://oxc.rs/docs/guide/usage/formatter)
on `$PATH` for non-`.svelte` files. Use `--oxfmt-bin PATH` to point at a
specific binary (a native binary, or a Node launcher such as
`node_modules/oxfmt/bin/oxfmt`).

## Usage

```
rsvelte-fmt [OPTIONS] [PATH...]
```

### Write mode (default)

```bash
rsvelte-fmt src/
```

Walks `src/` recursively, formats every file in place. Skips
`node_modules`, `target`, `dist`, `build`, and hidden directories.

### Check mode

```bash
rsvelte-fmt --check src/
```

Reports which files would change, exits 1 if any. No writes.

### Stdin mode (editor integration)

```bash
cat file.svelte | rsvelte-fmt --stdin --stdin-filepath file.svelte
```

Reads source on stdin, writes formatted output to stdout. The
`--stdin-filepath` argument is used to dispatch to the right engine —
the file does not need to exist on disk.

This is the same shape Prettier and `oxfmt` use, so any editor
integration that drives those (VS Code's Prettier extension, format-on-
save hooks) can be pointed at `rsvelte-fmt` instead.

## Options

| Flag | Default | Effect |
|---|---|---|
| `--write` | (implied for paths) | Write formatted output back |
| `--check` | off | Exit 1 if any file would change |
| `--stdin` | off | Read source on stdin |
| `--stdin-filepath PATH` | — | Required with `--stdin` |
| `--print-width N` | 80 | Maximum line width |
| `--tab-width N` | 2 | Spaces per indent level |
| `--use-tabs` | off | Indent with tabs |
| `--oxfmt-bin PATH` | `oxfmt` | Subprocess binary for non-`.svelte` files |

Options are forwarded to both halves of the dispatch so a mixed
project formats consistently.

## Exit codes

| Code | Meaning |
|---|---|
| 0 | Success (write applied or check passed) |
| 1 | `--check` found at least one file that would change |
| 2 | Internal error (parse failure, `oxfmt` missing, IO error, …) |

## Example

```bash
$ cat src/App.svelte
<script>let count=1+2</script>
<button on:click={() => count++}  class:active={count >0}>
  { count + 1 }
</button>

$ rsvelte-fmt --check src/App.svelte
would format src/App.svelte
rsvelte-fmt: would reformat 1 / 1 files

$ rsvelte-fmt src/App.svelte
rsvelte-fmt: formatted 1 / 1 files

$ cat src/App.svelte
<script>
  let count = 1 + 2;
</script>
<button on:click={() => count++} class:active={count > 0}>
  {count + 1}
</button>
```

## How it's different from `oxfmt + prettier-plugin-svelte`

`oxfmt` currently delegates `.svelte` files to bundled
`prettier-plugin-svelte`, which means every `.svelte` file pays:

1. Node startup cost on the JS side
2. Prettier's doc-IR round-trip
3. Two parser passes (one in oxfmt for delegation, one in
   prettier-plugin-svelte)

`rsvelte-fmt` removes all three:

- The Svelte parser is rsvelte (Rust, in-process).
- The Svelte → output rewrite is straight `oxc_formatter` calls for JS
  pieces plus a hand-rolled markup pass.
- `oxfmt` is invoked only for standalone non-`.svelte` files and for the CSS
  body of `<style>` blocks — never for the Svelte markup itself.

Across 3,852 real `.svelte` files (Apple M1 Pro, 10 iterations / 3 warmup), the
Svelte engine formats **35× faster single-threaded and 204× faster
multi-threaded** than `prettier-plugin-svelte`. Benchmark the formatter locally
with `cargo bench -p rsvelte_formatter --bench formatter`, or run the full
JS-vs-Rust comparison with `pnpm run generate-benchmark`.

## License

MIT
