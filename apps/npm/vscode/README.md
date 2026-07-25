# rsvelte for VS Code

Rust-powered **formatting** and **linting** for Svelte, powered by
[rsvelte](https://github.com/baseballyama/rsvelte) — a port of the Svelte
compiler to Rust. This extension bundles
[`@rsvelte/language-server`](https://www.npmjs.com/package/@rsvelte/language-server)
and launches it over stdio.

## Features

- **Syntax highlighting** for `.svelte` files (including `<script lang="ts">`,
  `<style lang="scss|less|postcss|sass|stylus">`, `<template lang="pug">`, and
  ` ```svelte ` code blocks in Markdown), plus Svelte-aware bracket matching,
  auto-closing, folding, and snippets. The official Svelte extension is **not**
  required.
- **Format on demand / on save** via the native `rsvelte-fmt` CLI. Works for
  `.svelte` plus the JS/TS/CSS/JSON families (everything is dispatched to oxfmt
  internally for a complete format).
- **Inline diagnostics** from the bundled `rsvelte_lint` engine (compiler
  warnings + a11y + native rules). No extra install — the linter ships inside
  the extension as wasm.

That's the full feature set — hover, completion, go-to-definition, rename,
find-references, and TypeScript diagnostics are **not** provided (this is a
formatter + linter, not a full language server). Those wait on
[tsgo](https://github.com/microsoft/typescript-go)'s `tsserver` mode landing
upstream; until then, use
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

## Using it alongside the official Svelte extension

This extension ships its own Svelte grammar and language definition, so it is a
standalone replacement for `svelte.svelte-vscode`. Running both at once
duplicates diagnostics, completions and hovers, makes VS Code prompt for which
formatter to use, and leaves it up to activation order which copy of the
`source.svelte` grammar ends up registered. The extension warns once if it
detects the official extension — disable one of the two.

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

MIT. The bundled grammars, snippets and language configurations are copied from
[`sveltejs/language-tools`](https://github.com/sveltejs/language-tools) (MIT) —
see [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md).
