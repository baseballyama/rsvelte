# rsvelte for Zed

A [Zed](https://zed.dev) extension that adds the `Svelte` language and starts
[`@rsvelte/language-server`](../npm/language-server) for `.svelte` files.

## Install

Not yet in Zed's extension registry. To try it now:

1. `Zed: install dev extension` from the command palette.
2. Pick this directory (`apps/zed`).

Zed compiles the extension to `wasm32-wasip2` itself; you only need a Rust
toolchain with that target installed.

## What works today

The extension is a launcher — everything below is whatever the language server
already implements, nothing more.

| Feature | Status |
| --- | --- |
| Syntax highlighting, brackets, indents, outline, injections | ✅ (tree-sitter grammar + queries shipped here) |
| Diagnostics (compiler errors/warnings + `rsvelte_lint`) | ✅ pushed on open/change, bundled as wasm — no extra install |
| Format document / format on save | ✅ **only when a `rsvelte-fmt` binary is resolvable** — see below |
| Completions, hover, code actions, folding, selection ranges, document symbols | ⛔ not exposed by the published server yet |
| TypeScript features (go to definition, rename, type errors) | ⛔ pending later Wave 4 milestones |

Formatting shells out to the native `rsvelte-fmt` CLI. The server looks for
`node_modules/.bin/rsvelte-fmt` walking up from the file, so install
[`@rsvelte/fmt`](https://www.npmjs.com/package/@rsvelte/fmt) in your project, or
point at a binary explicitly (below). Without it, formatting is a no-op.

The language config here deliberately omits `prettier_parser_name`, so Zed
routes formatting to the language server instead of Prettier.

The richer Rust server (`crates/rsvelte_language_server`, which additionally
implements completions, hover, code actions, folding, selection ranges and
document symbols) is not published as a binary yet. Once it is, this extension
switches to it and the table above grows; until then you can already point at a
locally built one with `binary.path`.

## Settings

```json
{
  "lsp": {
    "rsvelte-language-server": {
      "binary": {
        "path": "/absolute/path/to/rsvelte-language-server",
        "arguments": ["--stdio"]
      },
      "settings": {
        "format": { "enable": true },
        "lint": { "enable": true },
        "rsvelteFmtPath": "/absolute/path/to/rsvelte-fmt"
      }
    }
  }
}
```

- `binary.path` — skip the npm install and run this executable instead.
  Defaults to `node <npm package>/dist/server.mjs --stdio`.
- `settings` — forwarded verbatim as the server's `rsvelte` configuration
  section.

## Notes

`.svelte.js` / `.svelte.ts` files are plain JavaScript/TypeScript documents in
Zed, so this extension does not attach to them yet.

Third-party sources and their licenses: [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md).
