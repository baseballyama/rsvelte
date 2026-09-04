# rsvelte

## 0.7.0

### Minor Changes

- 87f6574: The VS Code extension is published as `baseballyama.rsvelte`, not `baseballyama.rsvelte-vscode`.

  The old identifier is unlisted on the Marketplace while its name stays reserved — a
  publisher-account state that no retry moves — so every release commit failed its
  `Publish to Marketplace` step while Open VSX published fine. The extension's `name` is
  what the Marketplace keys on, so the rename is the identifier change.

  Anyone who installed `baseballyama.rsvelte-vscode` from Open VSX keeps that extension; it
  does not update to this one. Install `baseballyama.rsvelte` instead, and set
  `"editor.defaultFormatter": "baseballyama.rsvelte"` if you had pinned the old id.

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
