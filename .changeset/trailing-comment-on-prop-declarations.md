---
'@rsvelte/compiler': patch
---

fix(client): a trailing comment lands on the node upstream puts it on

esrap attaches the comment run after a declaration's last code byte to that
statement's last *located* node. When the source initializer survives as the
last `$.prop(…)` argument that node is inside the call, so the comment prints
before the closing paren; when this pass synthesizes a thunk, or the declaration
has no initializer, there is no located node inside the call and upstream
flushes the comment after the statement. Nothing in that rule reads the
comment's spelling or a `;`.

rsvelte scanned the last source line for a `//`, restored it only when the
declaration had an initializer, and left a block comment to a different pass —
and `transform_let_with_reexported_props`, which lowers `let v = 1` with
`export { v }`, had no trailing-comment handling at all. Measured against the
oracle over comment kind x `;` x default shape x host, 15 of 20 client cells
diverged; all 20 agree now.
