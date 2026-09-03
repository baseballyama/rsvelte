---
'@rsvelte/compiler': patch
---

A write inside a prop's default value now reaches the passes an instance body
already gets. Upstream visits a default with the same `AssignmentExpression` and
`UpdateExpression` visitors as any other expression; rsvelte reaches it through
passes that skip a line containing `$.prop(`, and only the read halves had a
default-scoped counterpart — so `export let f = () => ($store = 1)` emitted
`() => ($store() = 1)`, which no JS parser accepts, and `() => (prop = 1)`
dropped its invalidation.
