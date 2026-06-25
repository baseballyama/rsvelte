# @rsvelte/language-server

A Language Server for [rsvelte](https://github.com/baseballyama/rsvelte) — the
Rust port of the Svelte compiler. It exposes rsvelte's **formatter** and
**linter** over the Language Server Protocol, so any LSP client (VS Code,
Neovim, …) can format and lint Svelte (and JS/TS/CSS/JSON) without a separate
toolchain.

## Features (v1)

- **Formatting** — `textDocument/formatting` shells out to the native
  `rsvelte-fmt` CLI (`--stdin --stdin-filepath <path>`) and returns a
  whole-document edit. `rsvelte-fmt` formats `.svelte` in-process and delegates
  embedded JS/TS/CSS to oxfmt, so the result is a complete format. The binary is
  resolved from `node_modules/.bin/rsvelte-fmt` (install
  [`@rsvelte/fmt`](https://www.npmjs.com/package/@rsvelte/fmt)); if it can't be
  found, formatting is silently disabled.
- **Diagnostics** — push diagnostics from the bundled
  [`rsvelte_lint`](https://github.com/baseballyama/rsvelte/tree/main/crates/rsvelte_lint)
  engine (compiled to wasm, vendored in the package — no extra install). Runs on
  open, on change (300 ms debounced), and on save.

Type-checking is intentionally out of scope for v1 (use
[`@rsvelte/svelte-check`](https://www.npmjs.com/package/@rsvelte/svelte-check)
as a batch checker).

## Settings

The server reads these from the client's `rsvelte.*` configuration:

| Key | Default | Description |
| --- | --- | --- |
| `rsvelte.format.enable` | `true` | Enable formatting via `rsvelte-fmt`. |
| `rsvelte.lint.enable` | `true` | Enable linting via the bundled engine. |
| `rsvelte.rsvelteFmtPath` | `""` | Explicit path to a `rsvelte-fmt` binary (overrides resolution). |

## Usage

```sh
rsvelte-language-server --stdio
```

Most users won't run this directly — the
[rsvelte VS Code extension](https://github.com/baseballyama/rsvelte/tree/main/apps/npm/vscode)
bundles and launches it. For other editors, point your LSP client at the
`rsvelte-language-server` binary with the `--stdio` transport.

## License

MIT
