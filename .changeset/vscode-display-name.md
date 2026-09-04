---
'rsvelte': patch
---

The Marketplace rejected `baseballyama.rsvelte` for its **display name**, not its id.

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
