---
"@rsvelte/compiler": patch
---

Remove the residual quadratic term in prop-read rewriting

`transform_prop_reads_in_expr` asked three questions per matched identifier — shadowed by
a function parameter, an explicit object-literal property key, an arrow-function parameter
binding — and each was answered by a backward scan that could run to the start of the
expression. Matches are themselves O(n), so the guards were O(n) work fired O(n) times:
the term left over after the `char_indices().nth(i)` fix.

A bracket-event index, built in the same walk that already produces the rewriter's
character vector and byte offsets, answers those questions in O(log m). On a scaling
fixture (one `$: _class = cls(…)` over four props) compile time drops 1.5x at 2.8 KB to
24.9x at 89 KB, and the fitted log-log slope of time against size falls from 1.73 to 0.92.
