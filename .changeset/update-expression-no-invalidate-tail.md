---
"@rsvelte/compiler": patch
---

An `++` / `--` on a state or prop member no longer grows the
`$.invalidate_inner_signals` tail. `UpdateExpression.js` does not import
`build_assignment`, so upstream attaches that tail only to an assignment; the
same binding's `=` and `+=` keep it. The wrapper was applied in four places —
the AST and in-place ports of both the legacy-state and the prop member
mutation transforms.
