# rsvelte-vscode

## 0.6.0

## 0.4.1

## 0.4.0

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

### Patch Changes

- b4dbcc1: fix(vscode): add `typescriptreact`/`javascriptreact` to `activationEvents`

  The document selector already covered `.tsx`/`.jsx` files, but `activationEvents`
  had no matching `onLanguage:` entries, so the extension never activated when a
  `.tsx` or `.jsx` file was opened on its own (with no `.svelte`/`.ts`/`.js`/etc.
  file opened first).

## 0.2.1
