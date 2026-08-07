---
'@rsvelte/compiler': patch
---

fix(esrap): unwrap a `ParenthesizedExpression` unconditionally and let precedence
re-add what the grammar needs, matching acorn — which has no paren node at all.
The previous exception (keep the literal parens when a comment leads the inner
expression) doubled whatever a parent adds, so `(/* c */ a + b) * 2` printed as
`((/* c */ a + b)) * 2`, `(/* c */ o).x` kept parens upstream drops, and
`(/* @__PURE__ */ new Date()).getTime()` did not collapse. The parens a leading
comment genuinely needs come from `ReturnStatement` — the one place esrap
parenthesizes for a comment — whose comment test now anchors on the *unwrapped*
argument so oxc's preserved parens cannot suppress it. `rsvelte_esrap` is
released as 0.10.3 and `rsvelte_core` pins the new exact requirement.
