---
"@rsvelte/compiler": patch
---

fix(transform): parenthesize `new` callees with a call in their spine + multi-node title defined-check

- esrap now wraps a `new` callee in parens when its member-object spine contains a
  CallExpression (`new ($.get(deckgl).MapboxOverlay)(…)`) or it is a
  ChainExpression — porting esrap's `has_call_expression` clause so the trailing
  `(…)` is not mis-parsed as the constructor arguments.
- A multi-node `<title>` interpolation uses the canonical `is_expression_defined`
  check, so a conditional with two string branches (`{name ? \`…\` : ""}`) no longer
  gets a spurious `?? ""` coercion.
