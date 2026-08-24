---
'@rsvelte/compiler': patch
---

Return the Svelte-4 legacy AST from `compile()` when `modernAst` is not set, as the official compiler does. `result.ast` was `null`, so tooling that reads it received nothing instead of a tree.
