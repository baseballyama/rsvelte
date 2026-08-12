---
'@rsvelte/compiler': patch
---

Classify async component-body awaits from the JavaScript AST, preserving async `$derived.by` callbacks in the synchronous prelude.
