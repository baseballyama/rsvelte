---
'@rsvelte/compiler': patch
---

Fix server output for a snippet declared as a component child or as a `<svelte:boundary>` `failed` / `pending` snippet: its parameters now shadow same-named component bindings (the body no longer constant-folds to the outer value), and a boundary snippet keeps its destructuring pattern instead of emitting `undefined` as a formal parameter
