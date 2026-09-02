---
'@rsvelte/svelte2tsx': patch
'@rsvelte/compiler': patch
'@rsvelte/svelte-check': patch
---

`<svelte:fragment slot="…">` keeps its attribute names and its opener layout.

It is an `Element` whose node type is not `Element`, so the attribute-case fold and
the number-only rewrite do not reach it — `<svelte:fragment slot="s" someProp="0"
cols="3" />` keeps `someProp` and types `cols` as a string. And its opener is
position-preserving like any other element's: the columns the stripped `slot=` and
`let:` occupy come back as spaces whether or not another attribute survives, where
rsvelte emitted them only when nothing did.
