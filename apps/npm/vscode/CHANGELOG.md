# rsvelte

## 0.7.1

### Patch Changes

- 63e8e02: The Marketplace rejected `baseballyama.rsvelte` for its **display name**, not its id.

  Measured on the 0.7.0 publish: `marketplace version: (none) → publish: true`, vsce
  packaged and uploaded, and the rejection was `This extension display name is taken.`
  Open VSX accepted the same artifact for all six targets. So the id freed by the
  previous rename is fine and `displayName: "rsvelte"` is the collision.

  `displayName` is now `rsvelte Language Tools`. The extension id, the publisher and
  every documented setting value (`baseballyama.rsvelte`) are unchanged.

  The failure handler in `scripts/release/publish-vscode.mjs` asserted the other cause
  — it inferred "the name is reserved" from an empty gallery query without reading
  vsce's message, which is written to the job log rather than to the error object. It
  now enumerates both causes and points at the line above it.

- 794ecd3: The publish decision skipped the Marketplace on an inference with two producers.

  `mpAbsent && ovsxAtOrAhead` — an empty gallery beside an Open VSX copy at or
  ahead of the target — was documented as "a contradiction only one state
  produces: the Marketplace copy is unlisted while its name stays reserved."

  Measured on run 33888597354: a single publish put 0.7.0 on Open VSX (six targets,
  all accepted) and was rejected by the Marketplace for its **display name**. That
  leaves exactly the same pair. So the state after any partially-successful publish
  is indistinguishable from the one the guard was written for, and the guard then
  skips every retry at that version — which is what happened on `63e8e025b`, where
  the display-name fix could not be attempted because the previous run had put
  0.7.0 on Open VSX.

  The Marketplace decision is now a function of the Marketplace state alone: an
  empty gallery is published into and `vsce` gives the verdict. A failed attempt is
  a red job with a diagnostic; the skip it replaces was neither success nor failure
  and reported nothing.

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
