---
"@rsvelte/compiler": patch
---

fix(client): preserve pre-existing parens in `parse_raw_expression` (#1783)

`parse_raw_expression` stripped every `ParenthesizedExpression` layer, not just
its own synthetic wrapper, so a single-dependency `$.legacy_pre_effect` thunk
printed as `() => $.get(y)` where the official compiler emits `() => ($.get(y))`
(upstream builds it as a one-element `SequenceExpression`, which esrap prints
with parens). The wrapper now strips exactly one layer, and the one-element
sequence is rebuilt for `$.legacy_pre_effect` dependency thunks; user-written
parens are still dropped exactly as acorn + esrap do.
