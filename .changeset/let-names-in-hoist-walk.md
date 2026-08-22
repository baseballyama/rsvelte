---
"@rsvelte/compiler": patch
---

Let a `let:` directive's names count as local when deciding whether a root `{#snippet}` can be hoisted. The hoistability walk recursed into a component's (or a slotted element's) children with the enclosing parameter set, so a reference to a `let:`-bound name read as instance-level and pinned the snippet. Upstream reaches the same question through the scope chain, where such a binding sits at or below the snippet's own depth and is skipped; the walk now extends the set at each node that carries the directive, which is where its scope begins.
