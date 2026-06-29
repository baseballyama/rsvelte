---
"@rsvelte/fmt": patch
---

fix(fmt): don't keep wrapper parens on an object/arrow value whose body comment carries a stray `)`

An attribute value that is an object or arrow literal (`track={{ … }}`) is parsed
through a `(expr);` wrapper; the redundant outer parens are then stripped only when
`outer_parens_match` confirms they were balanced. That balance check counted every
`(`/`)` literally, so a body comment like `// 1.) No clamping` — a lone `)` — made a
perfectly balanced value look unbalanced, and rsvelte emitted `track={({ … })}`
where the oracle keeps `track={{ … }}`. `outer_parens_match` now skips parens inside
string/template literals and `//` line / `/* */` block comments.
