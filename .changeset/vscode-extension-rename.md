---
'rsvelte': minor
---

The VS Code extension is published as `baseballyama.rsvelte`, not `baseballyama.rsvelte-vscode`.

The old identifier is unlisted on the Marketplace while its name stays reserved — a
publisher-account state that no retry moves — so every release commit failed its
`Publish to Marketplace` step while Open VSX published fine. The extension's `name` is
what the Marketplace keys on, so the rename is the identifier change.

Anyone who installed `baseballyama.rsvelte-vscode` from Open VSX keeps that extension; it
does not update to this one. Install `baseballyama.rsvelte` instead, and set
`"editor.defaultFormatter": "baseballyama.rsvelte"` if you had pinned the old id.
