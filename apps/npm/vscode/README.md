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
- **Native template and CSS assistance** — HTML/Svelte tag and attribute
  completions, directive and binding documentation, tag-linked editing, CSS
  property/value and selector completions, CSS hovers, selections, and colours.
- **TypeScript language features** — hover, component-aware completion,
  definitions, references, rename, diagnostics, semantic tokens, code actions
  and reference/implementation code lenses through the native tsgo proxy.
- **Project preprocessors** — trusted workspaces apply the nearest
  `svelte.config.*` before type projection, with source-mapped diagnostics and
  TypeScript locations. Workspace config is never executed in restricted mode.

TypeScript features require TypeScript 7 in the workspace (or `TSGO_BIN`);
native formatting, linting and template/CSS providers remain available without
it.

## Emmet

VS Code's built-in Emmet extension supplies Emmet expansion. Configure it for
Svelte with:

```jsonc
{
  "emmet.includeLanguages": { "svelte": "html" }
}
```

## Requirements

Formatting requires the native `rsvelte-fmt` binary. Install it in your project:

```sh
npm install -D @rsvelte/fmt
```

Install the TypeScript 7 native backend for type-aware features:

```sh
npm install -D typescript@~6 @typescript/native@npm:typescript@7
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
| `rsvelte.preprocess.enable` | `true` | Apply preprocessors from `svelte.config.*` in trusted workspaces. |
| `rsvelte.rsvelteFmtPath` | `""` | Explicit path to a `rsvelte-fmt` binary. |

## Lint configuration

Which rules run, at what severity, comes from a `rsvelte-lint.json` (or
`.rsvelte-lintrc.json`) in your project — the same file the
[`rsvelte-lint`](https://www.npmjs.com/package/@rsvelte/lint) CLI reads, found
by walking up from the file being linted, so the editor reports what CI does:

```json
{
  "rules": {
    "svelte/no-unused-class-name": "off",
    "svelte/no-at-html-tags": "error"
  }
}
```

Without one, every rule runs at its default severity — noisy in a codebase that
has never been linted with rsvelte. Start from nothing with
`"extends": ["none"]` and opt rules in, or turn off the ones your project
already covers elsewhere (e.g. via `eslint-plugin-svelte`). Saving the config
applies it immediately. See the
[configuration reference](https://www.npmjs.com/package/@rsvelte/lint#configuration)
for the full shape.

## License

MIT. The bundled grammars, snippets and language configurations are copied from
[`sveltejs/language-tools`](https://github.com/sveltejs/language-tools) (MIT) —
see [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md).
