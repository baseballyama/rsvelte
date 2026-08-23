---
"@rsvelte/fmt": patch
---

The formatter no longer rewrites an ES2022 brand check into a different program. `oxc_formatter` treats only `BinaryExpression` and `LogicalExpression` as binary-like parents, so oxc's separate `PrivateInExpression` node falls through the precedence comparison and both sides of `#x in o` lose required parentheses — `#value in (o || {})` printed as `#value in o || {}` (which returns `true` or `{}` instead of `true`/`false`), and `(#value in o) * 2` printed as `#value in o * 2`. 12 of 24 measured shapes changed meaning; the same shapes with an ordinary `"k" in (…)` were all correct. The formatter now records each brand check's right operand, re-parses its own output, and keeps the input when the two disagree — so it declines to reformat rather than change what the code means. Reported upstream in `upstream_issues/3451-oxc-private-in-parens.md`; a program with no brand check is unaffected and never re-parsed.
