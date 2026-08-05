---
"@rsvelte/compiler": patch
---

Build the dev CSS source map the way MagicString does — a segment at the start of every unedited chunk, at every line start inside one, and at every CSS AST node boundary — instead of matching tokens by name, use the source basename for its `file` field, and emit it for a custom element's `$$css.code` too.
