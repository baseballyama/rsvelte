---
'@rsvelte/compiler': patch
---

A `{const}` / `{let}` tag now reads every template-scope binding through that binding's own read, not through a hand-written list of two kinds. Snippet parameters, `let:` bindings and `{@const}` bindings were read bare, so a value produced by one of them was frozen at its first-render value.
