---
'@rsvelte/compiler': patch
---

A parenthesised prop mutation is wrapped outside its setter call, not inside it.
Upstream applies `validate_mutation` to the fully built expression, so
`$$ownership_validator.mutation(...)` encloses the prop setter; rsvelte matched the
setter's first argument as an assignment only, and `ParseOptions` preserve parens,
so `const q = (p.x = 1)` fell through to the assignment visitor and the wrap landed
inside. Two real components carried it — `svelte-lexical`'s `NestedComposer.svelte`
and immich's `Timeline.svelte`.
