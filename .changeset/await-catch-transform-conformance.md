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

Only the read half is conformed. Upstream replaces the whole `transform` entry, so the
setter is lost too and a later write to the outer binding is emitted as an assignment to a
call expression — the unparseable class `upstream_unparseable_3306.rs` already pins, where
this port deliberately diverges. The write halves are therefore restored on the way out of
the block.
