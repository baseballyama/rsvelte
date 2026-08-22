---
'@rsvelte/compiler': patch
---

Lower a `$effect.pending()` declarator initializer to `void 0` on the server, matching upstream's `VariableDeclaration` visitor, instead of applying the call-expression rule that produces `0`. The `.svelte.js` module path already did this; the component instance script did not.
