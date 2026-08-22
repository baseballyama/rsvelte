---
'@rsvelte/compiler': patch
---

Lower runes inside `{@const}` on the server target. The const visitor re-parses its source slice, which bypasses the expression visitor and with it the rune lowering, so `$state.snapshot`, `$effect.tracking` and `$effect.root` reached the output verbatim and threw on the first render
