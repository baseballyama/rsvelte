# @rsvelte/language-server

## 0.2.0

### Minor Changes

- 678b7b0: feat(language-server): add `@rsvelte/language-server` + `rsvelte-vscode` extension

  A new Language Server (`@rsvelte/language-server`) exposes rsvelte's formatter
  and linter over LSP, and a thin VS Code extension (`rsvelte-vscode`) bundles and
  launches it.

  - **Formatting** — `textDocument/formatting` shells out to the native
    `rsvelte-fmt` CLI (resolved from `node_modules/.bin`, or `rsvelte.rsvelteFmtPath`)
    and returns a whole-document edit; silently disabled when the binary is absent.
  - **Diagnostics** — push diagnostics from the `rsvelte_lint` engine compiled to
    wasm and vendored into the package (no extra install), on open / change
    (300 ms debounce) / save.

  Settings: `rsvelte.format.enable`, `rsvelte.lint.enable`, `rsvelte.rsvelteFmtPath`.
  Type-checking is out of scope for v1.
