---
"@rsvelte/compiler": patch
---

fix(client): `{@html}`'s thunk carries the anchor its `{#key}` sibling reaches by recovery

`{@html expr}` lowers to `$.html(node, () => expr)`. Upstream builds the thunk with `b.thunk`, so
the arrow has no `loc` while the expression keeps its own, and esrap's parameter sequence runs
`until` the body's start — which is why a comment still pending from the instance script is emitted
inside the empty parameter list. rsvelte built the thunk with no anchor, so the located pass had no
site before the end of the component body and wrote the comment there.
