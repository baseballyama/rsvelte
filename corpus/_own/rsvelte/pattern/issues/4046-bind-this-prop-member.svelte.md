# `4046-bind-this-prop-member.svelte`

**Issue:** [#4046](https://github.com/baseballyama/rsvelte/pull/4046)

A `bind:this` whose target is a member of a legacy prop, with a literal key and with an each-block index. The setter must run through the assignment visitor so the prop `mutate` transform still fires after conversion has lowered the read to `prop()`; the each index must stay shadowed inside the generated mutation.
