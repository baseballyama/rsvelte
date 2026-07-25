---
"rsvelte-vscode": patch
---

fix(vscode): add `typescriptreact`/`javascriptreact` to `activationEvents`

The document selector already covered `.tsx`/`.jsx` files, but `activationEvents`
had no matching `onLanguage:` entries, so the extension never activated when a
`.tsx` or `.jsx` file was opened on its own (with no `.svelte`/`.ts`/`.js`/etc.
file opened first).
