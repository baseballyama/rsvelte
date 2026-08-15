# @rsvelte/language-server

A Language Server for [rsvelte](https://github.com/baseballyama/rsvelte) — the
Rust port of the Svelte compiler. The native server combines rsvelte's
formatter, linter and Svelte/HTML/CSS providers with a TypeScript 7 LSP child,
so editors get the complete Svelte and TypeScript language surface.

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
  open, on change (300 ms debounced), and on save. The rule set comes from the
  project's own [`rsvelte-lint.json`](#lint-configuration).

The native server proxies hover, definitions, references, completion and
resolve, rename, signature help, inlay hints, semantic tokens, hierarchy,
symbols, code actions, code lenses and pull diagnostics through tsgo. Svelte
components use eagerly opened, diskless `.svelte.tsx` shadows; plain `.ts` and
`.js` documents share the same project.

In trusted workspaces, the server loads the nearest `svelte.config.*` through a
supervised Node sidecar and applies its preprocessors before generating the
TypeScript shadow. Preprocessor source maps keep diagnostics and TypeScript
locations in original-source coordinates. Config files are never executed in
an untrusted workspace.

Install TypeScript 7 in the workspace, or set `TSGO_BIN` to its executable:

```sh
npm install -D typescript@~6 @typescript/native@npm:typescript@7
```

If tsgo is unavailable, native formatting, linting and Svelte/HTML/CSS features
continue to work.

For VS Code, Emmet remains the built-in extension's responsibility. Enable its
HTML abbreviations in Svelte documents with
`"emmet.includeLanguages": { "svelte": "html" }`.

## Settings

The server reads these from the client's `rsvelte.*` configuration:

| Key | Default | Description |
| --- | --- | --- |
| `rsvelte.format.enable` | `true` | Enable formatting via `rsvelte-fmt`. |
| `rsvelte.lint.enable` | `true` | Enable linting via the bundled engine. |
| `rsvelte.preprocess.enable` | `true` | Apply preprocessors from `svelte.config.*` in trusted workspaces. |
| `rsvelte.rsvelteFmtPath` | `""` | Explicit path to a `rsvelte-fmt` binary (overrides resolution). |

## Lint configuration

Severities and rule options come from a `rsvelte-lint.json` (or
`.rsvelte-lintrc.json`), discovered by walking up from the document's directory
— the same file, in the same order, that the
[`rsvelte-lint`](https://www.npmjs.com/package/@rsvelte/lint) CLI resolves, so
the editor reports what CI does. With no config file, every rule runs at its
default severity (the `recommended` preset); to start from nothing and opt in,
use `"extends": ["none"]`:

```json
{
  "extends": ["recommended"],
  "rules": {
    "svelte/no-at-html-tags": "error",
    "svelte/no-unused-class-name": "off",
    "svelte/button-has-type": ["warn", { "submit": true, "reset": false }]
  }
}
```

See the
[CLI's configuration reference](https://www.npmjs.com/package/@rsvelte/lint#configuration)
for the full shape. An ESLint config is deliberately **not** read: importing it
is opt-in on the CLI (`--config-from-eslint`), and a server that read it on its
own would report a different rule set than the same project's CI. A config that
can't be read or parsed is reported to the client's log and the recommended
preset is used, so a typo never leaves the editor without diagnostics.

Resolved configs are cached for the life of the server; they are dropped when a
config file is saved through the client, and on `workspace/didChangeConfiguration`.

## Usage

```sh
rsvelte-language-server --stdio
```

Most users won't run this directly — the
[rsvelte VS Code extension](https://github.com/baseballyama/rsvelte/tree/main/apps/npm/vscode)
bundles and launches it. For other editors, point your LSP client at the
`rsvelte-language-server` binary with the `--stdio` transport.

## Native server

`rsvelte-language-server` is a launcher. It prefers the prebuilt native (Rust)
server shipped in the optional `@rsvelte/language-server-<platform>` packages
and falls back to the bundled JS server when no platform package is installed
(unsupported platform, or an install that skipped optional dependencies).

| Environment variable | Effect |
| --- | --- |
| `RSVELTE_LANGUAGE_SERVER_BIN` | Run this binary instead of the resolved one. |
| `RSVELTE_LANGUAGE_SERVER_JS=1` | Force the bundled JS server. |

## License

MIT
