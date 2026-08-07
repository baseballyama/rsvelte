---
'@rsvelte/compiler': patch
---

Walk the client store-subscription lookback by characters. Deciding whether a
`$name(` call sits in a function parameter list means stepping back over the
function name to the `function` keyword, and the three cursors that did it moved
one **byte** at a time. Continuation bytes leak through both predicates — `0x85`
and `0xA0` read as whitespace, and nine of the sixty-four read as alphanumeric
(`ª ² ³ µ ¹ º ¼ ½ ¾`) — so the cursor could stop inside a character. Depending on
which character preceded the parenthesis that was either a panic on a
non-boundary slice or, just as often, a silent wrong answer: the lookback never
reached `function`, so a store call inside a parameter list was rewritten to
`$s()(…)` when it should have been left alone.
