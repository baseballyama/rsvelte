---
'@rsvelte/compiler': patch
---

An `{#await … then X}` or `{:catch X}` binding now shadows a prop of the same name. Every read of
`X` inside the block was lowered as the prop read `$$props.X` instead of the block's own binding,
because a non-source prop is answered before `state.transform` is consulted and the await visitor
never registered the binding as shadowing. A prop declared with a default was unaffected.
