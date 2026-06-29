---
"@rsvelte/fmt": patch
---

fix(fmt): don't keep wrapper parens around an object-literal attribute value

An attribute value that is an object or arrow literal (`track={{ … }}`) is parsed
through a `(expr);` wrapper; the redundant outer parens are then stripped only when
`outer_parens_match` confirms they were balanced. Two cases leaked parens into the
output where the oracle keeps none:

- A body comment like `// 1.) No clamping` carries a lone `)`, so the literal
  paren count made a balanced value look unbalanced and rsvelte emitted
  `track={({ … })}`. `outer_parens_match` now skips parens inside string/template
  literals and `//` / `/* */` comments.
- An object that is the *head* of a member/call expression (`size={{ … }[key]}`)
  is parenthesized by OXC at statement position (`({ … })[key]`), which
  `strip_outer_parens` can't unwrap because the string ends with the postfix, not
  `)`. The expression head is now detected via the AST (`expr_has_object_head`) and
  the leading paren pair stripped while keeping the `[key]` / `.foo` / `( … )`
  postfix verbatim.
