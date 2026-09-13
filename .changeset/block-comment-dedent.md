---
"@rsvelte/compiler": patch
---

fix(parse): dedent a multi-line block comment on the node as well as on `Root.comments`

Upstream's single `onComment` handler strips a block comment's own opening-line
indentation from every line of its `value`, and that one value is what both
`Root.comments` and a node's `leadingComments` / `trailingComments` carry.
rsvelte ported the handler twice and only one of the two dedented, so the same
comment came back dedented in `Root.comments` and raw on the node. The dedent
itself also missed index 0, which `^` under `m` matches.
