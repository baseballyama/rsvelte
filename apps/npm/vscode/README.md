# rsvelte for VS Code

Rust-powered **formatting** and **linting** for Svelte, powered by
[rsvelte](https://github.com/baseballyama/rsvelte) — a port of the Svelte
compiler to Rust. This extension bundles
[`@rsvelte/language-server`](https://www.npmjs.com/package/@rsvelte/language-server)
and launches it over stdio.

## Features

- **Format on demand / on save** via the native `rsvelte-fmt` CLI. Works for
  `.svelte` plus the JS/TS/CSS/JSON families (everything is dispatched to oxfmt
  internally for a complete format).
- **Inline diagnostics** from the bundled `rsvelte_lint` engine (compiler
  warnings + a11y + native rules). No extra install — the linter ships inside
  the extension as wasm.

Type-checking is out of scope for now; use
[`@rsvelte/svelte-check`](https://www.npmjs.com/package/@rsvelte/svelte-check)
for batch type-checking.

## Requirements

Formatting requires the native `rsvelte-fmt` binary. Install it in your project:

```sh
npm install -D @rsvelte/fmt
```

The extension resolves `node_modules/.bin/rsvelte-fmt` from the workspace. If
it isn't found, formatting is disabled (linting still works). You can point at a
specific binary with `rsvelte.rsvelteFmtPath`.

## Setup as the default formatter

To format Svelte files with rsvelte, set it as the default formatter (so it
doesn't conflict with the official Svelte extension):

```jsonc
// .vscode/settings.json
{
  "[svelte]": {
    "editor.defaultFormatter": "rsvelte.rsvelte-vscode"
  }
}
```

## Settings

| Key | Default | Description |
| --- | --- | --- |
| `rsvelte.format.enable` | `true` | Enable formatting via `rsvelte-fmt`. |
| `rsvelte.lint.enable` | `true` | Enable linting via the bundled engine. |
| `rsvelte.rsvelteFmtPath` | `""` | Explicit path to a `rsvelte-fmt` binary. |

## License

MIT
