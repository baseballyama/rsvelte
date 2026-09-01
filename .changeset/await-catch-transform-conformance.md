---
'@rsvelte/compiler': patch
---

An `{#await}` catch binding's read transform now leaks past its block, matching the official
compiler. `AwaitBlock.js` gives `then_context` a copy of `state.transform` and gives
`catch_context` the parent's own object, so the catch binding's read override outlives the
block and every later read of that name is rewritten — including reads of a prop, a `$state`
or a legacy `export let`. rsvelte scoped both arms and emitted the unrewritten read. The
divergence and its runtime consequence are recorded in
`upstream_issues/4111-svelte-await-catch-binding-transform-leaks-out-of-the-block.md`.
