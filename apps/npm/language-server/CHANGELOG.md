# @rsvelte/language-server

## 0.4.1

### Patch Changes

- 9c22cc3: Build the Linux binaries against glibc 2.35 instead of whatever `ubuntu-latest` happens to provide. The release matrix ran on the hosted `ubuntu-latest` image, which moved to Ubuntu 24.04 (glibc 2.39), so every published `linux-x64-gnu` / `linux-arm64-gnu` artifact refused to start on Ubuntu 22.04 LTS and other distributions on an older glibc — `libc.so.6: version 'GLIBC_2.39' not found`. The Linux legs are now pinned to `ubuntu-22.04`, and each one asserts the requirement by reading the artifact it just built, so a future image bump fails the release instead of shipping.

## 0.4.0

### Minor Changes

- 3c25cd9: Ship the native Rust `rsvelte-language-server` as per-platform npm packages and prefer it from the `@rsvelte/language-server` launcher.

  The launcher's `rsvelte-language-server` bin now resolves the prebuilt binary from the optional `@rsvelte/language-server-<triple>` dependency and execs it, falling back to the bundled JS server when no platform package is installed. `RSVELTE_LANGUAGE_SERVER_BIN` overrides the binary path and `RSVELTE_LANGUAGE_SERVER_JS=1` forces the JS fallback.

## 0.3.0

### Minor Changes

- b0eb890: feat(language-server): apply the project's `rsvelte-lint.json` to editor diagnostics

  The linter runs as wasm and has no filesystem, so `json_api::lint` hardcoded the
  `recommended` preset: every rule ran at its default severity and no project
  config could change that. In a codebase that has never been linted with rsvelte
  — or one whose Svelte rules are already tuned in ESLint — that meant thousands
  of unsuppressable warnings, and turning `rsvelte.lint.enable` off was the only
  way out.

  The server now discovers `rsvelte-lint.json` / `.rsvelte-lintrc.json` by walking
  up from the document's directory (the same file, in the same order, that the
  `rsvelte-lint` CLI resolves) and passes it to the new
  `lint_with_config(source, filename, config)` wasm export, so the editor reports
  what CI does. Resolved configs are cached and dropped when a config file is
  saved. A config that can't be read or parsed is reported to the client's log and
  the recommended preset is used, so a typo never leaves the editor without
  diagnostics.

## 0.2.2

## 0.2.1

### Patch Changes

- fd4572e: `svelte/no-top-level-browser-globals` now uses real scope resolution (oxc_semantic) instead of name matching: local bindings that share a browser global's name — `let { open = $bindable() }` props, imports, `let top` — are no longer falsely flagged, in both `<script>` and template expressions. Fail-safe: unresolvable scripts fall back to the previous behaviour.

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
