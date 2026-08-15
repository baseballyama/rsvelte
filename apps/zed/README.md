# rsvelte for Zed

A [Zed](https://zed.dev) extension that adds the `Svelte` language and starts
the native [`rsvelte-language-server`](../npm/language-server) for `.svelte`
files.

## Install

Not yet in Zed's extension registry. To try it now:

1. `Zed: install dev extension` from the command palette.
2. Pick this directory (`apps/zed`).

Zed compiles the extension to `wasm32-wasip2` itself; you only need a Rust
toolchain with that target installed.

## Server installation

The extension resolves the server in this order:

1. `lsp.rsvelte-language-server.binary.path` from Zed settings.
2. A standalone `rsvelte-language-server` on the worktree's `PATH` (no Node.js
   required).
3. The native optional dependency installed by
   `@rsvelte/language-server`; the package's JavaScript server remains the
   fallback on unsupported platforms.

Standalone archives are documented in the repository's
[editor setup guide](../../editors/README.md#standalone-binaries).

The language config deliberately omits `prettier_parser_name`, so Zed routes
formatting to the language server instead of Prettier.

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
        "preprocess": { "enable": true },
        "rsvelteFmtPath": "/absolute/path/to/rsvelte-fmt"
      }
    }
  }
}
```

- `binary.path` — run this executable instead of PATH/npm discovery.
- `settings` — forwarded verbatim as the server's `rsvelte` configuration
  section.

## Notes

`.svelte.js` / `.svelte.ts` files are plain JavaScript/TypeScript documents in
Zed, so this extension does not attach to them yet.

Third-party sources and their licenses: [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md).
