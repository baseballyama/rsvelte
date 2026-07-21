# @rsvelte/fmt

A Rust-powered formatter for Svelte projects. `rsvelte-fmt` formats `.svelte`
files in-process with the rsvelte formatter and delegates every other file — and
the `<script>` / `<style>` bodies of each Svelte component — to
[`oxfmt`](https://oxc.rs/docs/guide/usage/formatter). On a directory it covers
the full oxfmt-supported set (`.ts` / `.js` / `.css` / `.json`, plus `.md` /
`.yaml` / `.toml` / `.html`, …), so it formats the same files `oxfmt .` would.
Both pipelines run in parallel, so a mixed project formats in a single pass with
no Node startup cost on the Svelte side and no Prettier doc-IR round-trip.

> **⚠️ Early stage (v0).** Output and flags are stabilising.

## Install

```bash
npm install -D @rsvelte/fmt
# pnpm add -D @rsvelte/fmt
# yarn add -D @rsvelte/fmt
```

The package resolves the right prebuilt native binary for your platform via
`optionalDependencies`. Supported targets:

| OS | Architecture |
|---|---|
| macOS | arm64, x64 |
| Linux | x64 (glibc), arm64 (glibc) |
| Windows | x64 (MSVC) |

If your platform isn't listed, please [open an issue](https://github.com/baseballyama/rsvelte/issues).

### Native-direct binary (no Node startup)

On install, a `postinstall` step swaps in the platform-native binary as the
CLI's `bin`, so `rsvelte-fmt` runs directly with no per-invocation Node cold
start — the biggest cost for format-on-save. It also records your `oxfmt` +
Node paths in a sidecar the binary reads at runtime.

If your package manager **gates install scripts** (e.g. pnpm's
`onlyBuiltDependencies`), allow `@rsvelte/fmt` so this step runs:

```jsonc
// package.json (pnpm)
"pnpm": { "onlyBuiltDependencies": ["@rsvelte/fmt"] }
```

Without it (or with `--ignore-scripts`, or on Windows) a small Node launcher is
used instead — identical output, just a little slower to start.

### oxfmt daemon (warm CSS formatting)

On POSIX, inline `<style>` blocks are formatted through a short-lived oxfmt
daemon kept warm across invocations, so re-formatting a changed `<style>` costs
a ~ms socket round-trip instead of a fresh `oxfmt` Node start (~370ms → ~5ms).
It idle-exits after 60s and is keyed to your oxfmt version. Output is identical
to the non-daemon path; set `RSVELTE_FMT_NO_DAEMON=1` to disable it.

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
# Format the current directory in place (no path = cwd, like `oxfmt`)
npx rsvelte-fmt

# Format everything under src/ in place
npx rsvelte-fmt src/

# Check mode — exits non-zero if anything would change (CI gate)
npx rsvelte-fmt --check

# Editor / stdin mode
cat App.svelte | npx rsvelte-fmt --stdin --stdin-filepath App.svelte
```

When no path is given, `rsvelte-fmt` formats the current directory — matching
`oxfmt`, where the path argument is optional and defaults to the cwd.

Add it to your `package.json`:

```json
{
  "scripts": {
    "format": "rsvelte-fmt src/",
    "format:check": "rsvelte-fmt --check src/"
  }
}
```

Directory inputs hand every non-`.svelte` file to `oxfmt` (which respects
`.gitignore` / `.prettierignore` and skips `node_modules`), while `.svelte`
files are walked in-process, skipping `node_modules`, `target`, `dist`,
`build`, and hidden directories.

## Configuration (`.oxfmtrc`)

`rsvelte-fmt` reads the project's [`oxfmt` config](https://oxc.rs/docs/guide/usage/formatter)
(`.oxfmtrc.json` / `.oxfmtrc.jsonc`, discovered upward from the working
directory, or `--config <path>`). Standalone files already pick it up via
`oxfmt`; the inline `<script>` and `<style>` blocks inside `.svelte` files now
honor it too, so settings like `singleQuote`, `semi`, `printWidth`,
`trailingComma`, `quoteProps`, `arrowParens`, `bracketSpacing`, and `endOfLine`
apply consistently across standalone files and embedded blocks. Explicit
`--print-width` / `--tab-width` / `--use-tabs` flags override the config.

### Svelte markup & sort options

The following `.oxfmtrc` keys also drive `.svelte` formatting, matching
`oxfmt` + `prettier-plugin-svelte`:

| Key | Default | Effect |
|---|---|---|
| `singleAttributePerLine` | `false` | Break every attribute onto its own line when an element has more than one |
| `bracketSameLine` | `false` | Keep a wrapped open tag's `>` / `/>` on the last attribute's line |
| `sortImports` | off | Sort imports inside embedded `<script>` (and standalone JS/TS) — accepts `true` or the full oxfmt object form |
| `svelte.allowShorthand` | `true` | Collapse `name={name}` / `class:x={x}` / `style:x={x}` / `bind:x={x}` to shorthand; set `false` to always emit the full form |
| `svelte.indentScriptAndStyle` | `true` | Indent the body of `<script>` / `<style>` one level under its tag; `false` keeps it flush |
| `svelte.sortOrder` | `options-scripts-markup-styles` | Print order of the top-level sections (any permutation of `options`/`scripts`/`markup`/`styles`, or `none` to keep source order) |

`sortTailwindcss` sorts the classes in static `class` attributes (the value must
be a plain string — values with `{expr}` interpolation are left untouched). It is
supported **only for a stock, zero-config Tailwind v4 setup**: a stylesheet that
is essentially `@import "tailwindcss";` with no `@plugin`, `@utility`,
`@custom-variant`, `@theme`, or `@config`, and no v3 `tailwind.config.js`. That
is the one case a pure-Rust sorter reproduces byte-for-byte, because Tailwind's
order otherwise depends on the project's compiled CSS (which needs the JS engine).

`rsvelte-fmt` resolves the stylesheet from `sortTailwindcss.stylesheet` (or a
conventional entry like `src/app.css`) and inspects it. If it is a default setup,
classes are sorted natively; otherwise `rsvelte-fmt` prints a warning naming the
reason and leaves class names unchanged — run `oxfmt` directly for a custom
Tailwind config. The `attributes` option is honored (default `["class"]`);
`functions` (e.g. `cn(...)`) are not, since those wrap non-static expressions.

## CLI flags

| Flag | Default | Effect |
|---|---|---|
| `--write` | (implied for paths) | Write formatted output back to source files |
| `--check` | off | Exit 1 if any file would change; no writes |
| `--stdin` | off | Read source on stdin, write result to stdout |
| `--stdin-filepath PATH` | — | Filename used to pick the engine (required with `--stdin`) |
| `--print-width N` | `.oxfmtrc` / 80 | Maximum line width before breaking |
| `--tab-width N` | `.oxfmtrc` / 2 | Spaces per indent level |
| `--use-tabs` | `.oxfmtrc` / off | Indent with tabs |
| `--config PATH`, `-c` | discovered | `.oxfmtrc` to apply to inline `<script>` / `<style>` blocks |
| `--oxfmt-bin PATH` | resolved / `oxfmt` | Override the oxfmt binary used for non-`.svelte` files |
| `--no-style-cache` | off | Disable the on-disk cache of formatted inline `<style>` blocks |

Run `rsvelte-fmt --help` for the authoritative list.

### Inline `<style>` cache

Inline `<style>` CSS is delegated to `oxfmt` for output parity with standalone
`.css` files. To avoid re-running that round-trip on every invocation,
formatted results are cached on disk (keyed by the oxfmt version, the resolved
`.oxfmtrc`, and the exact `<style>` body), so an unchanged block is served from
cache and skips `oxfmt` entirely on subsequent runs. Cache hits are
byte-identical to a fresh format. Disable with `--no-style-cache` or the
`RSVELTE_FMT_NO_CACHE` environment variable; relocate it with
`RSVELTE_FMT_CACHE_DIR` (defaults to the platform cache dir, e.g.
`~/.cache/rsvelte-fmt`).

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

Formatting 3,854 real `.svelte` files (Apple M1 Pro, 10 iterations / 3 warmup),
the Svelte engine runs **18× faster single-threaded and 114× faster
multi-threaded** than `prettier-plugin-svelte`. Live numbers and reproduction
steps are on the [benchmark page](https://baseballyama.github.io/rsvelte/benchmark).

## License

MIT
