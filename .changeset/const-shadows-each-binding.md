---
'@rsvelte/compiler': patch
---

Let a `{@const}` shadow an enclosing `{#each}`'s item or index

A `{@const}` one block deeper than the loop it shadows — behind `{#if}`,
`{#key}`, a nested `{#each}`, `{#await … then}` or `{#snippet}` — was still read
as the loop variable. Upstream resolves the reference through `scope.evaluate`,
so the const wins and its literal initializer is known; three decisions follow
from that and all three came out wrong.

On the server the constant fold kept the loop variable, so `<b>{value}</b>`
rendered the row instead of the const. On the client the read counted as state,
which costs the element its `textContent` shortcut: `<b> </b>` plus a
`$.template_effect` where official emits `<b></b>` and one assignment. And the
each callback kept an `index` parameter that nothing reads any more, because
upstream sets `uses_index` from the index transform's own `read` callback.

All three answered the question by NAME — `each_binding_context`,
`each_index_name`, and the server's `slot_let_shadows` veto — and a name is
exactly what a shadow reuses. The scope chain now decides on the server, and the
client carries the shadowing names (`{@const}` declarations and snippet
parameters) alongside the transform map they already scope, so an inner
`{#each}` taking the name back is a removal rather than a special case.

With the const in the each body itself the two declarations share one scope and
both compilers raise `declaration_duplicate`, so the shape only exists across a
block boundary. The snippet-parameter version of that collision is an upstream
defect — official compiles it into a JS redeclaration no parser accepts — and is
written up in `upstream_issues/`.
