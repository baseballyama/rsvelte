# Editor setup

`rsvelte-language-server` is a single native executable that speaks LSP over
standard input and output. It does not require Node.js when installed from a
[GitHub release](#standalone-binaries). Do not run it alongside another Svelte
language server: both servers will answer the same requests and publish
duplicate diagnostics.

Core Svelte, HTML, CSS, formatting, linting, and TypeScript features are fully
native. Applying a JavaScript preprocessor from `svelte.config.*` still needs a
`node` executable; if it is unavailable, the server reports that preprocessing
failure and keeps the raw-source editor features running.

## Install

### npm

The npm launcher installs the matching native package where one is available
and falls back to the JavaScript server on unsupported platforms:

```sh
npm install --global @rsvelte/language-server
```

### Standalone binaries

Each `@rsvelte/language-server@<version>` GitHub release contains:

| Archive suffix | Platform |
| --- | --- |
| `darwin-arm64.tar.gz` | macOS Apple silicon |
| `darwin-x64.tar.gz` | macOS Intel |
| `linux-arm64-gnu.tar.gz` | Linux arm64, glibc |
| `linux-x64-gnu.tar.gz` | Linux x64, glibc |
| `win32-x64-msvc.zip` | Windows x64 |

Download an archive from the repository's
[Releases](https://github.com/baseballyama/rsvelte/releases), verify it against
`SHA256SUMS`, and put `rsvelte-language-server` (or the `.exe`) on `PATH`.
The server is started with:

```sh
rsvelte-language-server --stdio
```

Musl Linux, Windows arm64, and other targets do not yet have standalone
archives. Build `rsvelte-language-server` from source or use the npm package's
JavaScript fallback on those targets.

## Editors

- [Neovim (`nvim-lspconfig`)](./nvim-lspconfig/README.md)
- [Zed](../apps/zed/README.md)
- [Sublime Text (`LSP-rsvelte`)](./sublime/README.md)
- [Helix](./helix.md)
- [Emacs (`lsp-mode`)](./emacs-lsp-mode.md)

All configurations send settings under the `rsvelte` section. The supported
keys are documented by
[`@rsvelte/language-server`](../apps/npm/language-server/README.md#settings).
