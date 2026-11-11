# `3285-each-key-expression-update.svelte`

**Issue:** [#3285](https://github.com/baseballyama/rsvelte/issues/3285)

An `{#each}` **key** expression that writes the item (`(v++)`). Upstream visits the key INSIDE the each scope (`scope.js`'s `EachBlock`: `if (node.key) visit(node.key, { scope })`), so the write is recorded against the item binding and promotes the collection to `$.mutable_source`; rsvelte visited it with the each bindings out of scope, so the write reached nothing. The **update** form is the one that was live — the assignment form (`(v = 1)`) already produced the right output, so a repro carrying only one of the two reads as fixed
